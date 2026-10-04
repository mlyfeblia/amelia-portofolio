import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const isAuth = await isAuthenticatedAdmin(request);
  return NextResponse.json({
    success: isAuth,
    authenticated: isAuth,
  });
}
