import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { ensureSessionRegistered } from "@/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the user session to ensure they're authenticated
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure session is registered with backend
    await ensureSessionRegistered();

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const session_id = formData.get('session_id') as string | null;

    if (!file || !session_id) {
      return NextResponse.json({ error: 'File and session_id are required' }, { status: 400 });
    }

    // Prepare form data for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('session_id', session_id);

    // Call the backend API with session cookies for authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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

    const response = await fetch(`${backendUrl}/chat/file`, {
      method: 'POST',
      body: backendFormData,
      headers: {
        // Include session token in Authorization header for backend security
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        // Forward the Better Auth session cookies to the backend for authentication
        'Cookie': cookies
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Chat file API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}