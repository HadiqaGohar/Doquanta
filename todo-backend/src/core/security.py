
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, Security, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, text
from src.db.session import engine
from .settings import settings
import datetime
import traceback
import base64


security = HTTPBearer(auto_error=False)

def verify_token(token: str) -> Optional[dict]:
    """Verify the JWT token and return the payload."""
    try:
        # print(f"DEBUG: Verifying token: {token[:20]}...")
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=[settings.jwt_algorithm],
            options={"verify_aud": False, "verify_exp": True}  # Verify expiration
        )
        print("DEBUG: JWT token verified successfully")
        return payload
    except JWTError as e:
        # print(f"DEBUG: Token verification failed: {str(e)}")
        # traceback.print_exc()
        print(f"DEBUG: JWT verification failed: {str(e)}")
        return None

def verify_session_token(token: str) -> Optional[str]:
    """Verify session token against the database."""
    try:
        # print(f"DEBUG: Received token for verification: {repr(token)}")

        db_token = token
        if "." in token and len(token.split(".")) >= 2:
            db_token = token.split(".")[0]

        with Session(engine) as session:
            # Try multiple table and column name variations for maximum compatibility
            is_postgres = "postgresql" in str(engine.url)
            
            # Query variations to try
            queries = []
            if is_postgres:
                queries = [
                    text('SELECT "userId", "expiresAt" FROM "session" WHERE "token" = :token'),
                    text('SELECT "user_id", "expires_at" FROM "session" WHERE "token" = :token'),
                    text('SELECT userId, expiresAt FROM session WHERE token = :token'),
                ]
            else:
                queries = [
                    text("SELECT userId, expiresAt FROM session WHERE token = :token"),
                    text("SELECT user_id, expires_at FROM session WHERE token = :token"),
                ]

            result = None
            for query in queries:
                try:
                    result = session.execute(query, params={"token": db_token}).first()
                    if result: break
                except Exception:
                    continue

            if result:
                user_id, expires_at = result
                
                # Exclude literal column name returns (happens in some SQLite drivers)
                if str(user_id).lower() in ["userid", "user_id"]:
                    return None

                # Expiration check
                now = datetime.datetime.now(datetime.timezone.utc)
                if isinstance(expires_at, str):
                    from datetime import datetime as dt
                    try:
                        expires_at = dt.fromisoformat(expires_at.replace('Z', '+00:00'))
                    except ValueError:
                        expires_at = dt.strptime(expires_at.split('.')[0], "%Y-%m-%d %H:%M:%S")

                if expires_at.tzinfo is None:
                    now = now.replace(tzinfo=None)

                if expires_at < now:
                    print(f"DEBUG: Session expired for user: {user_id}")
                    return None

                return str(user_id)
            return None

    except Exception as e:
        print(f"DEBUG: Session verification error: {e}")
        return None

def get_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> str:
    """Dependency to get the current user ID from the JWT token, DB session, or cookie."""
    token = None
    
    # 1. Try Bearer token from header
    if credentials:
        token = credentials.credentials.strip()
    
    # 2. Try session cookie (better-auth.session_token)
    if not token:
        token = request.cookies.get("better-auth.session_token")
        if token:
            print(f"DEBUG: Found token in cookie: {token[:20]}...")

    if not token:
        print("DEBUG: No token found in header or cookie")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Try JWT verification first (for Better Auth JWT tokens)
    payload = verify_token(token)
    if payload:
        user_id = payload.get("sub") or payload.get("id") or payload.get("user_id")
        if user_id:
            print(f"DEBUG: JWT verification successful for user: {user_id}")
            return str(user_id)

    # Fallback to DB session verification (for registered Better Auth sessions)
    user_id = verify_session_token(token)
    if user_id:
        return user_id

    # If both methods fail, raise unauthorized
    print(f"DEBUG: Both JWT and DB verification failed for token: {repr(token)}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
