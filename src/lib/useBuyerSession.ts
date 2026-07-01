'use client';
import { useEffect, useState } from 'react';

// Checks if the buyer is currently logged in for this store (via the
// AccountSheet OTP session cookie). Used at checkout time so orders
// always attribute to the authenticated buyer, regardless of what
// they type in the checkout form's email field.
export function useBuyerSession(username: string) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/auth/me?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setEmail(data.error ? null : data.email);
      })
      .catch(() => { if (!cancelled) setEmail(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [username]);

  return { email, loggedIn: !!email, loading };
}
