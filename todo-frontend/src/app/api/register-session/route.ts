import { NextRequest } from "next/server";
import { auth } from "../../../lib/auth/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      console.error("No session found in register-session POST");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID and token from session
    const userId = session.user.id;
    console.log("Register Session - User ID from session:", userId);

    // Extract Better Auth session token from cookies to send to backend
    const cookies = request.headers.get('cookie') || '';
    const sessionCookieMatch = cookies.match(/__Secure-bta-s=([^;]+)/) || cookies.match(/bta-s=([^;]+)/);
    const sessionToken = sessionCookieMatch ? sessionCookieMatch[1] : null;

    if (!sessionToken) {
      console.error("No session token found in cookies");
      return NextResponse.json({ error: "No session token found" }, { status: 400 });
    }

    console.log("Register Session - Session token found:", sessionToken.substring(0, 10) + "...");

    // Get expiration time from session or set default
    const expiresAt = session.session.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days

    // Forward the request to the backend to register the session
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register-session`;
    console.log("Register Session - Backend URL:", backendUrl);

    // Send the session data to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        token: sessionToken,
        expires_at: expiresAt
      }),
    });

    console.log("Register Session - Backend response status:", response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error registering session with backend:", data);
      return NextResponse.json({ error: "Failed to register session with backend" }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in register-session POST API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}