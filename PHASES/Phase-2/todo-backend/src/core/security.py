from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, text
from src.db.session import engine
from .settings import settings
import datetime
import traceback

security = HTTPBearer()

def verify_token(token: str) -> Optional[dict]:
    """Verify the JWT token and return the payload."""
    try:
        # print(f"DEBUG: Verifying token: {token[:20]}...")
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=[settings.jwt_algorithm],
            options={"verify_aud": False}
        )
        print("DEBUG: Token verified successfully")
        return payload
    except JWTError as e:
        # print(f"DEBUG: Token verification failed: {str(e)}")
        # traceback.print_exc()
        return None

def verify_session_token(token: str) -> Optional[str]:
    """Verify session token against the database."""
    try:
        # Handle signed tokens (format: token.signature)
        # Better Auth might send signed cookies like "token.signature"
        db_token = token
        if "." in token:
            parts = token.split(".")
            # Assuming the first part is the raw token
            # We try both the full token and the first part just in case
            db_token = parts[0]
            # print(f"DEBUG: Token has signature, using prefix: {db_token}")

        with Session(engine) as session:
            # Query the session table
            # Note: Postgres table and column names might be case sensitive if created with quotes
            statement = text('SELECT "userId", "expiresAt" FROM session WHERE token = :token')
            
            # Use session.execute for raw SQL text
            # First try with the processed token (signature stripped)
            result = session.execute(statement, params={"token": db_token}).first()
            
            # If not found and token was split, try the original token just in case
            if not result and db_token != token:
                 result = session.execute(statement, params={"token": token}).first()

            if not result:
                print(f"DEBUG: Session token not found in DB. Token sent: {repr(token)}")
                return None
                
            user_id, expires_at = result
            
            # Check expiration
            # Ensure timezone awareness compatibility
            now = datetime.datetime.now(datetime.timezone.utc)
            if expires_at.tzinfo is None:
                # If DB returns naive datetime, assume it's UTC or handle accordingly
                # Usually Postgres returns timezone aware if column is timestamptz
                pass
            
            if expires_at < now:
                print(f"DEBUG: Session token expired. Expires: {expires_at}, Now: {now}")
                return None
                
            return user_id
    except Exception as e:
        print(f"DEBUG: Database session verification failed: {e}")
        traceback.print_exc()
        return None

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Dependency to get the current user ID from the JWT token or DB session."""
    token = credentials.credentials.strip() # Strip whitespace
    
    # Try JWT verification first
    payload = verify_token(token)
    if payload:
        user_id = payload.get("sub") or payload.get("id") or payload.get("user_id")
        if user_id:
            return str(user_id)

    # Fallback to DB session verification
    # print("DEBUG: JWT verification failed, trying DB session verification")
    user_id = verify_session_token(token)
    if user_id:
        return user_id

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
