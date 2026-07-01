'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Account {
  name: string | null;
  phone: string | null;
  address: string | null;
  totalSpent: number;
  orderCount: number;
}

export default function AccountPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [email, setEmail] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auth/me?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { router.push(`/${username}/auth`); return; }
        setEmail(data.email);
        setAccount(data.account);
      })
      .finally(() => setLoading(false));
  }, [username, router]);

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    router.push(`/${username}`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!account) return null;

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 4px', borderBottom: '1px solid #eee', textDecoration: 'none', color: '#111',
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>My Account</h1>

      <div style={{ marginBottom: 8 }}>
        <p style={{ fontWeight: 600 }}>{account.name || 'No name provided'}</p>
        <p style={{ color: '#666', fontSize: 14 }}>{email}</p>
        {account.phone && <p style={{ color: '#666', fontSize: 14 }}>{account.phone}</p>}
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700 }}>₦{Number(account.totalSpent).toLocaleString()}</p>
          <p style={{ fontSize: 11, color: '#888' }}>TOTAL SPENT</p>
        </div>
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{account.orderCount}</p>
          <p style={{ fontSize: 11, color: '#888' }}>ORDERS</p>
        </div>
      </div>

      <Link href={`/${username}/account/orders`} style={rowStyle}>
        <span>MY ORDERS</span><span>›</span>
      </Link>
      <Link href={`/${username}/account/reviews`} style={rowStyle}>
        <span>PENDING REVIEWS</span><span>›</span>
      </Link>
      <button
        onClick={logout}
        style={{ ...rowStyle, width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #eee', color: '#c0392b', fontSize: 15, cursor: 'pointer', textAlign: 'left' }}
      >
        LOGOUT
      </button>
    </div>
  );
}
