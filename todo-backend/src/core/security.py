
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, text
from src.db.session import engine
from .settings import settings
import datetime
import traceback
import base64


security = HTTPBearer()

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
            # Query the session table - Check for both possible column names
            # First try with the actual column names in our SQLite database
            statement = text("SELECT user_id, expires_at FROM session WHERE token = :token")
            result = session.execute(statement, params={"token": db_token}).first()

            # If not found with snake_case, try with camelCase
            if not result:
                statement = text("SELECT userId, expiresAt FROM session WHERE token = :token")
                result = session.execute(statement, params={"token": db_token}).first()

            if result:
                user_id, expires_at = result
                print(f"DEBUG: Found session in DB - user_id: {user_id}, expires_at: {expires_at}, type: {type(expires_at)}")

                # Check expiration
                # Ensure timezone awareness compatibility
                now = datetime.datetime.now(datetime.timezone.utc)

                # Handle different types of datetime objects from different databases
                if isinstance(expires_at, str):
                    # Convert string to datetime object
                    from datetime import datetime as dt
                    expires_at = dt.fromisoformat(expires_at.replace('Z', '+00:00'))

                if expires_at.tzinfo is None:
                    # If DB returns naive datetime, assume it's UTC or handle accordingly
                    # Usually Postgres returns timezone aware if column is timestamptz
                    print(f"DEBUG: DB datetime is naive, treating as UTC. Converting now to naive for comparison: {now.replace(tzinfo=None)} vs {expires_at}")
                    now = now.replace(tzinfo=None)

                if expires_at < now:
                    print(f"DEBUG: Session token expired. Expires: {expires_at}, Now: {now}")
                    return None

                print(f"DEBUG: Session token verification successful for user: {user_id}")
                return str(user_id)
            else:
                print(f"DEBUG: Session token not found in DB. Token sent: {repr(token)}, DB token tried: {repr(db_token)}")
                print(f"DEBUG: Available tokens in DB: {[row[0] for row in session.execute(text('SELECT token FROM session')).all()]}")
                return None

    except Exception as e:
        print(f"DEBUG: Database session verification failed: {e}")
        traceback.print_exc()
        return None

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Dependency to get the current user ID from the JWT token or DB session."""
    token = credentials.credentials.strip() # Strip whitespace

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
