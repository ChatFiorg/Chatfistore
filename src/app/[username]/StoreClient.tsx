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

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function IconChat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconBag({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconImageOff({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c4c4c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 20 20" />
      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
      <path d="M13.5 13.5 16 16" />
      <path d="M21 15.34V5a2 2 0 0 0-2-2H9.66" />
      <path d="M3 9v10a2 2 0 0 0 2 2h10" />
    </svg>
  );
}

export default function StoreClient({ store, username }: { store: Store; username: string }) {
  const [buying, setBuying] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [error, setError] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const primary = store.theme?.primary || '#C7F284';
  const tint = hexToRgba(primary, 0.14);

  const handleBuy = (product: Product) => {
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
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style jsx>{`
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (min-width: 640px) { .product-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
        @media (min-width: 960px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
        .product-card { transition: box-shadow 0.15s ease, transform 0.15s ease; }
        .product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .product-card img { transition: transform 0.3s ease; }
        .product-card:hover img { transform: scale(1.04); }
      `}</style>

      {store.banner && (
        <div style={{ width: '100%', height: 180, overflow: 'hidden', position: 'relative' }}>
          <img src={store.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          {store.logo ? (
            <img src={store.logo} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '1px solid #eee' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#111' }}>
              {store.name?.[0]?.toUpperCase() || 'S'}
            </div>
          )}
          <div>
            <h1 style={{ color: '#111111', fontSize: 22, fontWeight: 800, margin: 0 }}>{store.name}</h1>
            {store.category && (
              <span style={{ display: 'inline-block', marginTop: 4, backgroundColor: tint, color: '#111111', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                {store.category}
              </span>
            )}
          </div>
        </div>

        {store.description && (
          <p style={{ color: '#6b6b6b', fontSize: 14, lineHeight: 1.6, margin: '4px 0 16px', maxWidth: 560 }}>{store.description}</p>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {store.contact?.whatsapp && (
            <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#fff', color: '#111', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e5e5' }}>
              <IconChat /> WhatsApp
            </a>
          )}
          {store.contact?.email && (
            <a href={`mailto:${store.contact.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#fff', color: '#111', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e5e5' }}>
              <IconMail /> Email
            </a>
          )}
          {store.contact?.twitter && (
            <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#fff', color: '#111', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e5e5' }}>
              <IconX /> {store.contact.twitter}
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ color: '#111111', fontSize: 15, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Products</h2>
          <span style={{ color: '#999', fontSize: 12 }}>{store.products.length} item{store.products.length !== 1 ? 's' : ''}</span>
        </div>

        {store.products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 56, color: '#999', backgroundColor: '#fff', borderRadius: 16, border: '1px solid #eee' }}>No products yet</div>
        ) : (
          <div className="product-grid">
            {store.products.map(product => {
              const soldOut = product.stock === 0;
              const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 5;
              const showImg = product.image && !imgErrors[product.id];
              return (
                <div key={product.id} className="product-card" style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #eee' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f4f4f4', overflow: 'hidden' }}>
                    {showImg ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={() => setImgErrors(prev => ({ ...prev, [product.id]: true }))}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconImageOff />
                      </div>
                    )}
                    {soldOut && (
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ backgroundColor: '#111', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 700, margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p style={{ color: '#999', fontSize: 12, margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: '#111111', fontSize: 16, fontWeight: 800 }}>₦{product.price.toLocaleString()}</span>
                      {lowStock && <span style={{ color: '#d97706', fontSize: 11, fontWeight: 600 }}>{product.stock} left</span>}
                    </div>
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={soldOut}
                      style={{
                        width: '100%', padding: '10px', backgroundColor: soldOut ? '#e5e5e5' : '#111111',
                        color: soldOut ? '#999' : '#fff', borderRadius: 8, border: 'none',
                        fontSize: 13, fontWeight: 700, cursor: soldOut ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {!soldOut && <IconBag size={14} />} {soldOut ? 'Sold Out' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48, paddingBottom: 32 }}>
          <a href="https://chatfi.pro" target="_blank" style={{ color: '#999', fontSize: 12, textDecoration: 'none' }}>
            Powered by <span style={{ color: '#111', fontWeight: 700 }}>ChatFi</span>
          </a>
        </div>
      </div>

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 18, padding: 22, width: '100%', maxWidth: 380, border: '1px solid #eee' }}>
            {paymentLink ? (
              <>
                <h3 style={{ color: '#111', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Payment Ready</h3>
                <p style={{ color: '#777', fontSize: 13, margin: '0 0 16px' }}>Tap below to complete your payment via ChatFi Pay</p>
                <a href={paymentLink} target="_blank"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '13px', backgroundColor: '#111', color: '#fff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' }}>
                  <IconBag size={14} /> Pay ₦{selectedProduct.price.toLocaleString()}
                </a>
                <button onClick={() => { setSelectedProduct(null); setPaymentLink(''); }}
                  style={{ width: '100%', marginTop: 8, padding: '11px', backgroundColor: 'transparent', color: '#777', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ color: '#111', fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>{selectedProduct.name}</h3>
                <p style={{ color: '#111', fontSize: 17, fontWeight: 800, margin: '0 0 16px' }}>₦{selectedProduct.price.toLocaleString()}</p>
                <label style={{ color: '#777', fontSize: 12, display: 'block', marginBottom: 6 }}>Email (optional — for order confirmation)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{ width: '100%', padding: '11px', backgroundColor: '#fafafa', color: '#111', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
                />
                {error && <p style={{ color: '#dc2626', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
                <button onClick={confirmBuy} disabled={!!buying}
                  style={{ width: '100%', padding: '13px', backgroundColor: '#111', color: '#fff', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1 }}>
                  {buying ? 'Creating payment...' : 'Proceed to Pay'}
                </button>
                <button onClick={() => setSelectedProduct(null)}
                  style={{ width: '100%', marginTop: 8, padding: '11px', backgroundColor: 'transparent', color: '#777', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
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
