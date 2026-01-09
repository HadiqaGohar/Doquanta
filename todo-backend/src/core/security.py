
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
        print(f"DEBUG: Received token for verification: {repr(token)}")

        # Handle signed tokens (format: token.signature)
        # Better Auth might send signed cookies like "token.signature"
        db_token = token
        if "." in token and len(token.split(".")) >= 2:
            # For Better Auth, the token is typically in format: token.signature
            # We need to use ONLY the token part for verification against the DB
            db_token = token.split(".")[0]
            print(f"DEBUG: Token has signature, using raw token for DB lookup: {repr(db_token)}")

        with Session(engine) as session:
            # Query the session table
            # Since we just recreated the tables with camelCase, prioritize that.
            
            result = None
            # 1. Try camelCase without quotes (SQLite standard)
            try:
                statement = text("SELECT userId, expiresAt FROM session WHERE token = :token")
                result = session.execute(statement, params={"token": db_token}).first()
            except Exception:
                pass

            # 2. Try camelCase with quotes (Postgres style)
            if not result:
                try:
                    statement = text('SELECT "userId", "expiresAt" FROM "session" WHERE "token" = :token')
                    result = session.execute(statement, params={"token": db_token}).first()
                except Exception:
                    pass

            # 3. Try snake_case (fallback for old setups)
            if not result:
                try:
                    statement = text("SELECT user_id, expires_at FROM session WHERE token = :token")
                    result = session.execute(statement, params={"token": db_token}).first()
                except Exception:
                    pass

            if result:
                # IMPORTANT: In some SQLite versions, if we select a non-existent quoted identifier,
                # it might return the identifier name as a string. Check for that.
                user_id, expires_at = result
                
                if user_id == "userId" or expires_at == "expiresAt" or user_id == "user_id":
                    print(f"DEBUG: SQLite returned literal column names instead of values. Token: {db_token}")
                    return None

                print(f"DEBUG: Found session in DB - user_id: {user_id}, expires_at: {expires_at}, type: {type(expires_at)}")

                # Check expiration
                # Ensure timezone awareness compatibility
                now = datetime.datetime.now(datetime.timezone.utc)

                # Handle different types of datetime objects from different databases
                if isinstance(expires_at, str):
                    # Convert string to datetime object
                    from datetime import datetime as dt
                    # Support multiple formats including those with ' ' or 'T'
                    try:
                        expires_at = dt.fromisoformat(expires_at.replace('Z', '+00:00'))
                    except ValueError:
                        # Fallback for other formats
                        expires_at = dt.strptime(expires_at.split('.')[0], "%Y-%m-%d %H:%M:%S")

                if expires_at.tzinfo is None:
                    # If DB returns naive datetime, assume it's UTC or handle accordingly
                    print(f"DEBUG: DB datetime is naive, treating as UTC. Converting now to naive for comparison")
                    now = now.replace(tzinfo=None)

                if expires_at < now:
                    print(f"DEBUG: Session token expired. Expires: {expires_at}, Now: {now}")
                    return None

                print(f"DEBUG: Session token verification successful for user: {user_id}")
                return str(user_id)
            else:
                print(f"DEBUG: Session token not found in DB. Token sent: {repr(token)}, DB token tried: {repr(db_token)}")
                return None

    except Exception as e:
        print(f"DEBUG: Database session verification failed: {e}")
        traceback.print_exc()
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
