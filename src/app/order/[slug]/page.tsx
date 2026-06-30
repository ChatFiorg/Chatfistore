'use client';
import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OrderConfirmedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'error'>('checking');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`https://pay.chatfi.pro/api/store/${slug}/order-status?reference=${reference}`);
        const data = await res.json();
        if (data.status === 'paid') {
          setStatus('paid');
          setOrderId(data.orderId);
          return;
        }
      } catch {}
      attempts++;
      if (attempts < 8) setTimeout(poll, 2000);
      else setStatus('pending');
    };
    poll();
  }, [reference, slug]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', padding: 24, textAlign: 'center', fontFamily: 'system-ui' }}>
      {status === 'checking' && (
        <p style={{ color: '#999', fontSize: 14 }}>Confirming your payment…</p>
      )}
      {status === 'paid' && (
        <>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#C7F284', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 32 }}>✓</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Payment received</h1>
          <p style={{ color: '#999', fontSize: 14, margin: '0 0 24px', maxWidth: 320 }}>
            Your order has been confirmed. Save your tracking ID below to follow up with the seller.
          </p>
          <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '14px 20px', marginBottom: 24 }}>
            <p style={{ color: '#666', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Tracking ID</p>
            <p style={{ color: '#C7F284', fontSize: 16, fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{orderId}</p>
          </div>
        </>
      )}
      {status === 'pending' && (
        <p style={{ color: '#999', fontSize: 14, maxWidth: 320 }}>
          Your payment is still being confirmed. This can take a moment — check back shortly or contact the seller with reference <span style={{ color: '#C7F284' }}>{reference}</span>.
        </p>
      )}
      {status === 'error' && (
        <p style={{ color: '#999', fontSize: 14 }}>Could not verify this payment.</p>
      )}
      <p style={{ color: '#666', fontSize: 12, marginTop: 24 }}>Powered by ChatFi</p>
    </div>
  );
}
