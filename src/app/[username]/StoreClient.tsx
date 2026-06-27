'use client';
import { useState } from 'react';

const BASE_URL = 'https://pay.chatfi.pro/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number | null;
  active: boolean;
}

interface Store {
  username: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  category: string;
  theme: { primary: string; bg: string };
  contact: { whatsapp?: string; email?: string; twitter?: string };
  products: Product[];
}

export default function StoreClient({ store, username }: { store: Store; username: string }) {
  const [buying, setBuying] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [error, setError] = useState('');

  const primary = store.theme?.primary || '#C7F284';
  const bg = store.theme?.bg || '#000000';

  const handleBuy = async (product: Product) => {
    setSelectedProduct(product);
    setPaymentLink('');
    setError('');
    setEmail('');
  };

  const confirmBuy = async () => {
    if (!selectedProduct) return;
    setBuying(selectedProduct.id);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/store/${username}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, buyerEmail: email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPaymentLink(data.paymentLink);
    } catch (e: any) {
      setError(e.message || 'Failed to create payment');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Banner */}
      {store.banner && (
        <div style={{ width: '100%', height: 200, overflow: 'hidden', position: 'relative' }}>
          <img src={store.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, ' + bg + ')' }} />
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          {store.logo && (
            <img src={store.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid #1a1a1a' }} />
          )}
          <div>
            <h1 style={{ color: '#e6edf3', fontSize: 24, fontWeight: 700, margin: 0 }}>{store.name}</h1>
            {store.category && <span style={{ color: primary, fontSize: 12, fontWeight: 600 }}>{store.category}</span>}
          </div>
        </div>

        {store.description && (
          <p style={{ color: '#7d8590', fontSize: 14, lineHeight: 1.6, margin: '8px 0 16px' }}>{store.description}</p>
        )}

        {/* Contact */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {store.contact?.whatsapp && (
            <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0d1a0d', color: '#C7F284', padding: '6px 14px', borderRadius: 20, fontSize: 13, textDecoration: 'none', border: '1px solid #1a2e1a' }}>
              💬 WhatsApp
            </a>
          )}
          {store.contact?.email && (
            <a href={`mailto:${store.contact.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0d0d1a', color: '#79c0ff', padding: '6px 14px', borderRadius: 20, fontSize: 13, textDecoration: 'none', border: '1px solid #1a1a2e' }}>
              ✉️ Email
            </a>
          )}
          {store.contact?.twitter && (
            <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0d0d0d', color: '#e6edf3', padding: '6px 14px', borderRadius: 20, fontSize: 13, textDecoration: 'none', border: '1px solid #1a1a1a' }}>
              𝕏 {store.contact.twitter}
            </a>
          )}
        </div>

        {/* Products */}
        <h2 style={{ color: '#e6edf3', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Products</h2>

        {store.products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#7d8590' }}>No products yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {store.products.map(product => (
              <div key={product.id} style={{ backgroundColor: '#0d0d0d', borderRadius: 16, overflow: 'hidden', border: '1px solid #1a1a1a' }}>
                {product.image && (
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                )}
                <div style={{ padding: 16 }}>
                  <h3 style={{ color: '#e6edf3', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{product.name}</h3>
                  {product.description && (
                    <p style={{ color: '#7d8590', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>{product.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: primary, fontSize: 18, fontWeight: 700 }}>₦{product.price.toLocaleString()}</span>
                    {product.stock !== null && (
                      <span style={{ color: '#7d8590', fontSize: 12 }}>{product.stock} left</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleBuy(product)}
                    style={{ width: '100%', marginTop: 12, padding: '12px', backgroundColor: primary, color: '#000', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 48, paddingBottom: 32 }}>
          <a href="https://chatfi.pro" target="_blank" style={{ color: '#7d8590', fontSize: 12, textDecoration: 'none' }}>
            Powered by <span style={{ color: primary, fontWeight: 600 }}>ChatFi</span>
          </a>
        </div>
      </div>

      {/* Buy Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
          <div style={{ backgroundColor: '#0d0d0d', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, border: '1px solid #1a1a1a' }}>
            {paymentLink ? (
              <>
                <h3 style={{ color: '#e6edf3', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Payment Ready ✓</h3>
                <p style={{ color: '#7d8590', fontSize: 13, margin: '0 0 16px' }}>Click the link below to complete your payment via ChatFi Pay</p>
                <a href={paymentLink} target="_blank"
                  style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: primary, color: '#000', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' }}>
                  Pay ₦{selectedProduct.price.toLocaleString()} →
                </a>
                <button onClick={() => { setSelectedProduct(null); setPaymentLink(''); }}
                  style={{ width: '100%', marginTop: 10, padding: '12px', backgroundColor: 'transparent', color: '#7d8590', border: '1px solid #1a1a1a', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ color: '#e6edf3', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{selectedProduct.name}</h3>
                <p style={{ color: primary, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>₦{selectedProduct.price.toLocaleString()}</p>
                <label style={{ color: '#7d8590', fontSize: 12, display: 'block', marginBottom: 6 }}>Email (optional — for order confirmation)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{ width: '100%', padding: '12px', backgroundColor: '#111', color: '#e6edf3', border: '1px solid #1a1a1a', borderRadius: 10, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
                />
                {error && <p style={{ color: '#ff4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
                <button onClick={confirmBuy} disabled={!!buying}
                  style={{ width: '100%', padding: '14px', backgroundColor: primary, color: '#000', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1 }}>
                  {buying ? 'Creating payment...' : 'Proceed to Pay'}
                </button>
                <button onClick={() => setSelectedProduct(null)}
                  style={{ width: '100%', marginTop: 10, padding: '12px', backgroundColor: 'transparent', color: '#7d8590', border: '1px solid #1a1a1a', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
