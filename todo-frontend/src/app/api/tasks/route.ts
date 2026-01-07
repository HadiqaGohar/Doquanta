import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ensureSessionRegistered } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      console.error("No session found in GET");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from session
    const userId = session.user.id;
    console.log("GET - User ID from session:", userId);

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();

    // Add all search params to the query string
    for (const [key, value] of searchParams) {
      queryParams.append(key, value);
    }

    
    // Forward the request to the backend with the user ID in the URL
    // The backend will validate the user ID against the session on its end
    const queryString = queryParams.toString();
    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const backendUrl = `${cleanApiBaseUrl}/api/${userId}/tasks/${queryString ? `?${queryString}` : ''}`;
    console.log("GET - Backend URL:", backendUrl);

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

    console.log("GET - Backend response status:", response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in tasks GET API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from session
    const userId = session.user.id;
    console.log("User ID from session:", userId);

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    const body = await request.json();
    console.log("Request body:", body);

    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const backendUrl = `${cleanApiBaseUrl}/api/${userId}/tasks/`;
    console.log("Backend URL:", backendUrl);

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include session token in Authorization header for backend security
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        // Also forward cookies in case backend needs them for other purposes
        'Cookie': cookies
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in tasks POST API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from session
    const userId = session.user.id;
    console.log("DELETE - User ID from session:", userId);

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    const { pathname } = new URL(request.url);
    const cleanApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    
    let backendUrl = "";
    if (pathname.endsWith('/all/clear')) {
      backendUrl = `${cleanApiBaseUrl}/api/${userId}/tasks/all/clear`;
    } else if (pathname.endsWith('/completed/clear')) {
      backendUrl = `${cleanApiBaseUrl}/api/${userId}/tasks/completed/clear`;
    }

    if (!backendUrl) {
       return NextResponse.json({ error: "Invalid clear action" }, { status: 400 });
    }

    console.log("DELETE - Backend URL:", backendUrl);

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
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        'Cookie': cookies
      },
    });

    console.log("DELETE - Backend response status:", response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in tasks DELETE API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}