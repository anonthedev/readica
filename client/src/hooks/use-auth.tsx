'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export const useAuth = () => {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return { session, status };
};
