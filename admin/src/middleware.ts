import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow access to the register page
  return NextResponse.next();
}

export const config = {
  matcher: [],
}; 