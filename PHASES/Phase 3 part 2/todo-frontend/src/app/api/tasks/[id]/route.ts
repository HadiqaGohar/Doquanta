import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ensureSessionRegistered } from "@/utils/auth";

// This route handles individual task operations using dynamic route
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    // Extract user ID from session
    const userId = session.user.id;

    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const backendUrl = `${cleanApiBaseUrl}/api/tasks/${taskId}`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    
    // Support all Better Auth cookie variations
    let sessionToken = null;
    const betterAuthTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
    const secureBetterAuthTokenMatch = cookies.match(/__Secure-better-auth\.session_token=([^;]+)/);
    const shortTokenMatch = cookies.match(/bta-s=([^;]+)/);
    const secureShortTokenMatch = cookies.match(/__Secure-bta-s=([^;]+)/);
    
    if (secureBetterAuthTokenMatch) sessionToken = secureBetterAuthTokenMatch[1];
    else if (betterAuthTokenMatch) sessionToken = betterAuthTokenMatch[1];
    else if (secureShortTokenMatch) sessionToken = secureShortTokenMatch[1];
    else if (shortTokenMatch) sessionToken = shortTokenMatch[1];

    // Forward the request to the backend with proper authentication
    const response = await fetch(backendUrl, {
      method: 'GET',
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
    console.error("Error in individual task GET API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    // Extract user ID from session
    const userId = session.user.id;
    const body = await request.json();

    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const backendUrl = `${cleanApiBaseUrl}/api/tasks/${taskId}`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    
    // Support all Better Auth cookie variations
    let sessionToken = null;
    const betterAuthTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
    const secureBetterAuthTokenMatch = cookies.match(/__Secure-better-auth\.session_token=([^;]+)/);
    const shortTokenMatch = cookies.match(/bta-s=([^;]+)/);
    const secureShortTokenMatch = cookies.match(/__Secure-bta-s=([^;]+)/);
    
    if (secureBetterAuthTokenMatch) sessionToken = secureBetterAuthTokenMatch[1];
    else if (betterAuthTokenMatch) sessionToken = betterAuthTokenMatch[1];
    else if (secureShortTokenMatch) sessionToken = secureShortTokenMatch[1];
    else if (shortTokenMatch) sessionToken = shortTokenMatch[1];

    // Forward the request to the backend with proper authentication
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Include session token in Authorization header for backend security
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        // Also forward cookies in case backend needs them for other purposes
        'Cookie': cookies
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in individual task PUT API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    // Extract user ID from session
    const userId = session.user.id;

    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const backendUrl = `${cleanApiBaseUrl}/api/tasks/${taskId}`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    
    // Support all Better Auth cookie variations
    let sessionToken = null;
    const betterAuthTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
    const secureBetterAuthTokenMatch = cookies.match(/__Secure-better-auth\.session_token=([^;]+)/);
    const shortTokenMatch = cookies.match(/bta-s=([^;]+)/);
    const secureShortTokenMatch = cookies.match(/__Secure-bta-s=([^;]+)/);
    
    if (secureBetterAuthTokenMatch) sessionToken = secureBetterAuthTokenMatch[1];
    else if (betterAuthTokenMatch) sessionToken = betterAuthTokenMatch[1];
    else if (secureShortTokenMatch) sessionToken = secureShortTokenMatch[1];
    else if (shortTokenMatch) sessionToken = shortTokenMatch[1];

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
    console.error("Error in individual task DELETE API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    // Extract user ID from session
    const userId = session.user.id;
    const body = await request.json();

    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const backendUrl = `${cleanApiBaseUrl}/api/tasks/${taskId}/complete`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    
    // Support all Better Auth cookie variations
    let sessionToken = null;
    const betterAuthTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
    const secureBetterAuthTokenMatch = cookies.match(/__Secure-better-auth\.session_token=([^;]+)/);
    const shortTokenMatch = cookies.match(/bta-s=([^;]+)/);
    const secureShortTokenMatch = cookies.match(/__Secure-bta-s=([^;]+)/);
    
    if (secureBetterAuthTokenMatch) sessionToken = secureBetterAuthTokenMatch[1];
    else if (betterAuthTokenMatch) sessionToken = betterAuthTokenMatch[1];
    else if (secureShortTokenMatch) sessionToken = secureShortTokenMatch[1];
    else if (shortTokenMatch) sessionToken = shortTokenMatch[1];

    // Forward the request to the backend with proper authentication
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Include session token in Authorization header for backend security
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        // Also forward cookies in case backend needs them for other purposes
        'Cookie': cookies
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in individual task PATCH API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}