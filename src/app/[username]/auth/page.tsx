'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const requestOtp = async () => {
    if (!email.trim()) { setError('Enter your email'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: email.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNotice('OTP has been sent successfully to your Email');
      setStep('otp');
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/${username}/account`);
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px' }}>
      {step === 'email' ? (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>LOGIN/REGISTER</h1>
          <p style={{ color: '#555', marginBottom: 20 }}>Enter your email below to receive an OTP.</p>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', border: '1px solid #ddd', borderRadius: 10, fontSize: 15, marginBottom: 16 }}
          />
          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            onClick={requestOtp}
            disabled={loading}
            style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: loading ? '#ccc' : '#111', color: '#fff', fontWeight: 600, fontSize: 15 }}
          >
            {loading ? 'Sending...' : 'Get OTP'}
          </button>
        </>
      ) : (
        <>
          {notice && (
            <div style={{ background: '#e8f8ee', color: '#1a7a3c', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              {notice}
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Enter OTP</h1>
          <p style={{ color: '#555', marginBottom: 20 }}>Enter the OTP sent to your email.</p>
          <input
            type="text"
            placeholder="OTP"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', border: '1px solid #ddd', borderRadius: 10, fontSize: 15, marginBottom: 16 }}
          />
          {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            onClick={verifyOtp}
            disabled={loading}
            style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: loading ? '#ccc' : '#111', color: '#fff', fontWeight: 600, fontSize: 15 }}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>
        </>
      )}
    </div>
  );
}
