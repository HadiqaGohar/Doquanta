import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    // Extract user ID from session
    const userId = session.user.id;

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks/${taskId}`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    const sessionCookieMatch = cookies.match(/__Secure-bta-s=([^;]+)/) || cookies.match(/bta-s=([^;]+)/);
    const sessionToken = sessionCookieMatch ? sessionCookieMatch[1] : null;

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

    // Extract user ID from session
    const userId = session.user.id;
    const body = await request.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks/${taskId}`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    const sessionCookieMatch = cookies.match(/__Secure-bta-s=([^;]+)/) || cookies.match(/bta-s=([^;]+)/);
    const sessionToken = sessionCookieMatch ? sessionCookieMatch[1] : null;

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

    // Extract user ID from session
    const userId = session.user.id;

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks/${taskId}`;

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

    // Extract user ID from session
    const userId = session.user.id;
    const body = await request.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks/${taskId}/complete`;

    // Extract Better Auth session token from cookies to use as Authorization header
    const cookies = request.headers.get('cookie') || '';
    const sessionCookieMatch = cookies.match(/__Secure-bta-s=([^;]+)/) || cookies.match(/bta-s=([^;]+)/);
    const sessionToken = sessionCookieMatch ? sessionCookieMatch[1] : null;

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