import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from session
    const userId = session.user.id;

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks/completed/clear`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    const sessionCookieMatch = cookies.match(/__Secure-bta-s=([^;]+)/) || cookies.match(/bta-s=([^;]+)/);
    const sessionToken = sessionCookieMatch ? sessionCookieMatch[1] : null;

    // Forward the request to the backend with proper authentication
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Include session token in Authorization header for backend security
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        // Also forward cookies in case backend needs them for other purposes
        'Cookie': cookies
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in delete completed tasks API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}