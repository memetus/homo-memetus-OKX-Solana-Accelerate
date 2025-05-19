import { NextResponse } from 'next/server';

export async function DELETE() {
  const response = NextResponse.json({ message: '쿠키 삭제 완료' });

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  response.cookies.delete('accessToken');

  return response;
}

export const dynamic = 'force-dynamic';
