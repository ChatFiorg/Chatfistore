'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem { productId: string; productName: string; quantity: number; }
interface Order {
  id: string; items: OrderItem[]; amount: number; status: string;
  fulfillmentStatus: string | null; createdAt: string | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auth/me?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { router.push('/auth'); return; }
        setOrders(data.orders || []);
      })
      .finally(() => setLoading(false));
  }, [username, router]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px' }}>
      <Link href="/account" style={{ color: '#666', fontSize: 14 }}>‹ My Account</Link>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 20px' }}>My Orders</h1>

      {orders.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>
                {order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}
              </p>
              <p style={{ fontWeight: 700, fontSize: 14 }}>₦{Number(order.amount).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <p style={{ fontSize: 12, color: '#888' }}>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: order.status === 'paid' ? '#1a7a3c' : '#c78a1a' }}>
                {order.status.toUpperCase()}{order.fulfillmentStatus ? ` · ${order.fulfillmentStatus.toUpperCase()}` : ''}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
