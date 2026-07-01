'use client';
import { useEffect, useState } from 'react';

interface OrderItem { productId: string; productName: string; quantity: number; }
interface Order {
  id: string; items: OrderItem[]; amount: number; status: string;
  fulfillmentStatus: string | null; createdAt: string | null;
}
interface Account {
  name: string | null; phone: string | null; address: string | null;
  totalSpent: number; orderCount: number;
}

type View = 'email' | 'otp' | 'hub' | 'orders' | 'reviews';

interface Props {
  open: boolean;
  onClose: () => void;
  username: string;
  accent?: string;
}

export default function AccountSheet({ open, onClose, username, accent = '#0a0a0a' }: Props) {
  const [view, setView] = useState<View>('email');
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [buyerEmail, setBuyerEmail] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const checkSession = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/auth/me?username=${username}`);
      const data = await res.json();
      if (data.error) {
        setView('email');
      } else {
        setBuyerEmail(data.email);
        setAccount(data.account);
        setOrders(data.orders || []);
        setView('hub');
      }
    } catch {
      setView('email');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (open) {
      setError(''); setNotice('');
      checkSession();
    }
  }, [open]);

  if (!open) return null;

  const requestOtp = async () => {
    if (!email.trim()) { setError('Enter your email'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: email.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNotice('OTP has been sent successfully to your Email');
      setView('otp');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!code.trim()) { setError('Enter the OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCode('');
      await checkSession();
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    setAccount(null); setOrders([]); setEmail(''); setCode('');
    setView('email');
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 4px', borderBottom: '1px solid #eee', background: 'none', border: 'none',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#eee',
    width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#111',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', border: '1px solid #ddd', borderRadius: 10,
    fontSize: 15, marginBottom: 16, boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%', padding: 14, borderRadius: 10, border: 'none',
    background: loading ? '#ccc' : accent, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
  };

  return (
    <>
      <style>{`
        @keyframes accountSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes accountSheetFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div
        onClick={() => !loading && onClose()}
        style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', animation: 'accountSheetFade 0.25s' }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh', overflowY: 'auto',
            backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: '20px 20px 32px', animation: 'accountSheetUp 0.3s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#f5f5f5', border: 'none', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>

          {checking ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>Loading...</p>
          ) : view === 'email' ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#111' }}>LOGIN/REGISTER</h2>
              <p style={{ color: '#555', marginBottom: 18, fontSize: 14 }}>Enter your email below to receive an OTP.</p>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button onClick={requestOtp} disabled={loading} style={buttonStyle}>{loading ? 'Sending...' : 'Get OTP'}</button>
            </>
          ) : view === 'otp' ? (
            <>
              {notice && <div style={{ background: '#e8f8ee', color: '#1a7a3c', padding: '12px 16px', borderRadius: 8, marginBottom: 18, fontSize: 13 }}>{notice}</div>}
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#111' }}>Enter OTP</h2>
              <p style={{ color: '#555', marginBottom: 18, fontSize: 14 }}>Enter the OTP sent to your email.</p>
              <input type="text" placeholder="OTP" value={code} onChange={e => setCode(e.target.value)} style={inputStyle} />
              {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button onClick={verifyOtp} disabled={loading} style={buttonStyle}>{loading ? 'Verifying...' : 'Submit'}</button>
            </>
          ) : view === 'hub' && account ? (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 20, color: '#111' }}>My Account</h2>
              <p style={{ fontWeight: 600, color: '#111' }}>{account.name || 'No name provided'}</p>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>{buyerEmail}</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>₦{Number(account.totalSpent).toLocaleString()}</p>
                  <p style={{ fontSize: 10, color: '#888' }}>TOTAL SPENT</p>
                </div>
                <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{account.orderCount}</p>
                  <p style={{ fontSize: 10, color: '#888' }}>ORDERS</p>
                </div>
              </div>
              <button onClick={() => setView('orders')} style={rowStyle}><span>MY ORDERS</span><span>›</span></button>
              <button onClick={() => setView('reviews')} style={rowStyle}><span>PENDING REVIEWS</span><span>›</span></button>
              <button onClick={logout} style={{ ...rowStyle, color: '#c0392b', borderBottom: 'none' }}>LOGOUT</button>
            </>
          ) : view === 'orders' ? (
            <>
              <button onClick={() => setView('hub')} style={{ background: 'none', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 }}>‹ My Account</button>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>My Orders</h2>
              {orders.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>No orders yet</p>
              ) : orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}</p>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>₦{Number(order.amount).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <p style={{ fontSize: 11, color: '#888' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: order.status === 'paid' ? '#1a7a3c' : '#c78a1a' }}>
                      {order.status.toUpperCase()}{order.fulfillmentStatus ? ` · ${order.fulfillmentStatus.toUpperCase()}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : view === 'reviews' ? (
            <>
              <button onClick={() => setView('hub')} style={{ background: 'none', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 }}>‹ My Account</button>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>Pending Reviews</h2>
              {orders.filter(o => o.fulfillmentStatus === 'delivered').length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>No delivered orders awaiting review yet</p>
              ) : orders.filter(o => o.fulfillmentStatus === 'delivered').map(order => (
                <div key={order.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}</p>
                  <button disabled style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', color: '#999', fontSize: 11, cursor: 'not-allowed' }} title="Review submission coming soon">Write Review</button>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
