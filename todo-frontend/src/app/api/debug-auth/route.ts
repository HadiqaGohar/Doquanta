import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { ensureSessionRegistered } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      console.error("No session found in debug auth endpoint");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID and token from session
    const userId = session.user.id;
    console.log("Debug Auth - User ID from session:", userId);

    // Extract Better Auth session token from cookies
    const cookies = request.headers.get('cookie') || '';
    const sessionCookieMatch = cookies.match(/__Secure-bta-s=([^;]+)/) || cookies.match(/bta-s=([^;]+)/);
    const sessionToken = sessionCookieMatch ? sessionCookieMatch[1] : null;

    console.log("Debug Auth - Session token found:", sessionToken ? sessionToken.substring(0, 10) + "..." : "None");

    // Try to register the session with the backend
    const sessionRegistered = await ensureSessionRegistered();

    return NextResponse.json({
      message: "Debug info retrieved successfully",
      userId: userId,
      sessionToken: sessionToken ? sessionToken.substring(0, 10) + "..." : "None",
      sessionRegistered: sessionRegistered,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in debug auth endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}