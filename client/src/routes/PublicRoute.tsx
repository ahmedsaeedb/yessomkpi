import { useState } from 'react';
import { PUBLIC_TOKEN_KEY } from '@/lib/axios';

export function usePublicSession() {
  const [hasSession, setHasSession] = useState(() => !!sessionStorage.getItem(PUBLIC_TOKEN_KEY));

  function grantSession(token: string) {
    sessionStorage.setItem(PUBLIC_TOKEN_KEY, token);
    setHasSession(true);
  }

  function endSession() {
    sessionStorage.removeItem(PUBLIC_TOKEN_KEY);
    setHasSession(false);
  }

  return { hasSession, grantSession, endSession };
}
