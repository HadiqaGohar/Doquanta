import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();

    // Add all search params to the query string
    for (const [key, value] of searchParams) {
      queryParams.append(key, value);
    }

    // Get the token from cookies
    const token = request.cookies.get("better-auth.session_token")?.value;
    
    if (!token) {
        console.error("No session token found in cookies");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryString = queryParams.toString();
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks${queryString ? `?${queryString}` : ''}`;
    console.log("GET - Backend URL:", backendUrl);

    // Forward the request to the backend with Authorization header
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // Include cookies for authentication
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

    const body = await request.json();
    console.log("Request body:", body);

    // Get the token from cookies
    const token = request.cookies.get("better-auth.session_token")?.value;

    if (!token) {
        console.error("No session token found in cookies");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${userId}/tasks`;
    console.log("Backend URL:", backendUrl);

    // Forward the request to the backend with Authorization header
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
      credentials: 'include', // Include cookies for authentication
    });

    console.log("Backend response status:", response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in tasks POST API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}