'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem { productId: string; productName: string; quantity: number; }
interface Order { id: string; items: OrderItem[]; status: string; fulfillmentStatus: string | null; createdAt: string | null; }

export default function ReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [pending, setPending] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auth/me?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { router.push('/auth'); return; }
        const delivered = (data.orders || []).filter((o: Order) => o.fulfillmentStatus === 'delivered');
        setPending(delivered);
      })
      .finally(() => setLoading(false));
  }, [username, router]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px' }}>
      <Link href="/account" style={{ color: '#666', fontSize: 14 }}>‹ My Account</Link>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 20px' }}>Pending Reviews</h1>

      {pending.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No delivered orders awaiting review yet</p>
      ) : (
        pending.map(order => (
          <div key={order.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>
              {order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}
            </p>
            <button
              disabled
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', color: '#999', fontSize: 12, cursor: 'not-allowed' }}
              title="Review submission coming soon"
            >
              Write Review
            </button>
          </div>
        ))
      )}
    </div>
  );
}
