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

    // Forward the request to the backend with cookies for authentication
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in delete completed tasks API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}