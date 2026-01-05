import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

/**
 * Ensures that the current user's session is registered with the backend
 */
export async function ensureSessionRegistered() {
  try {
    // Get the session from Better Auth
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList
    });

    if (!session) {
      console.error("No session found when trying to register with backend");
      return false;
    }

    // Extract user ID and token from session
    const userId = session.user.id;
    console.log("Ensuring session registration - User ID from session:", userId);

    // Extract Better Auth session token from cookies to send to backend
    const cookies = headerList.get('cookie') || '';
    // console.log("DEBUG: Raw cookies:", cookies); // DEBUG: Uncomment to see raw cookies if needed

    // Better Auth cookie names: 
    // - production/secure: __Secure-better-auth.session_token
    // - development/insecure: better-auth.session_token
    // - or sometimes shortened: bta-s
    
    // Let's try to match various common Better Auth cookie patterns
    let sessionToken = null;
    
    // Try standard Better Auth cookie names first (more reliable)
    const betterAuthTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
    const secureBetterAuthTokenMatch = cookies.match(/__Secure-better-auth\.session_token=([^;]+)/);
    
    // Try shortened names
    const shortTokenMatch = cookies.match(/bta-s=([^;]+)/);
    const secureShortTokenMatch = cookies.match(/__Secure-bta-s=([^;]+)/);
    
    if (secureBetterAuthTokenMatch) {
        sessionToken = secureBetterAuthTokenMatch[1];
        // console.log("DEBUG: Found token via __Secure-better-auth.session_token");
    } else if (betterAuthTokenMatch) {
        sessionToken = betterAuthTokenMatch[1];
        // console.log("DEBUG: Found token via better-auth.session_token");
    } else if (secureShortTokenMatch) {
        sessionToken = secureShortTokenMatch[1];
        // console.log("DEBUG: Found token via __Secure-bta-s");
    } else if (shortTokenMatch) {
        sessionToken = shortTokenMatch[1];
        // console.log("DEBUG: Found token via bta-s");
    }

    // Fallback: Use the token from the session object directly if available and exposed
    if (!sessionToken && (session as any).token) {
        sessionToken = (session as any).token;
        console.log("DEBUG: Using token from session object");
    }

    if (!sessionToken) {
      console.error("No session token found for registration. Cookies available:", cookies.substring(0, 50) + "..."); 
      return false;
    }

    console.log("Ensuring session registration - Session token found:", sessionToken.substring(0, 10) + "...");

    // Forward the request to the backend to register the session
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register-session`;
    console.log("Ensuring session registration - Backend URL:", backendUrl);

    // Send the session data to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        token: sessionToken,
        expires_at: session.session.expiresAt
      }),
    });

    console.log("Ensuring session registration - Backend response status:", response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error registering session with backend:", data);
      return false;
    }

    console.log("Successfully ensured session registration with backend");
    return true;
  } catch (error) {
    console.error("Error in ensureSessionRegistered:", error);
    return false;
  }
}