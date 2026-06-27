'use client';
import { useState, useMemo } from 'react';

const BASE_URL = 'https://pay.chatfi.pro/api';

interface Product {
  id: string; name: string; description: string; price: number;
  image: string; stock: number | null; active: boolean;
}
interface Store {
  username: string; name: string; description: string; logo: string;
  banner: string; category: string;
  theme: { primary: string; bg: string };
  contact: { whatsapp?: string; email?: string; twitter?: string };
  products: Product[];
}
interface CartItem { product: Product; qty: number; }

const naira = (n: number) => `₦${Number(n).toLocaleString('en-NG')}`;

function tokens(dark: boolean, primary: string) {
  return dark ? {
    bg: '#08080A', surface: '#111113', surfaceSoft: '#18181B',
    border: '#27272A', text: '#FAFAFA', muted: '#71717A',
    primary, primaryText: '#000',
  } : {
    bg: '#F7F6F2', surface: '#FFFFFF', surfaceSoft: '#EFEDE7',
    border: '#E4E2DC', text: '#15161A', muted: '#76777E',
    primary, primaryText: '#FFF',
  };
}

export default function StoreClient({ store, username }: { store: Store; username: string }) {
  const primary = store.theme?.primary || '#FF4D2E';
  const [dark, setDark] = useState(true);
  const T = tokens(dark, primary);

  const [cart, setCart] = useState<Record<string, number>>({});
  const cartItems: CartItem[] = useMemo(() =>
    store.products.filter(p => (cart[p.id] || 0) > 0).map(p => ({ product: p, qty: cart[p.id] })),
    [cart, store.products]);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  const setQty = (id: string, qty: number) =>
    setCart(c => qty <= 0 ? { ...c, [id]: 0 } : { ...c, [id]: qty });

  const [modal, setModal] = useState<'cart' | 'delivery' | 'paying' | 'success' | null>(null);
  const [lightbox, setLightbox] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', state: '' });
  const [paying, setPaying] = useState(false);
  const [payLink, setPayLink] = useState('');
  const [error, setError] = useState('');

  const checkout = async () => {
    if (!form.name || !form.phone || !form.address) { setError('Please fill all required fields'); return; }
    setPaying(true); setError('');
    try {
      const links: string[] = [];
      for (const item of cartItems) {
        for (let i = 0; i < item.qty; i++) {
          const res = await fetch(`${BASE_URL}/store/${username}/charge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: item.product.id, buyerDelivery: form }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          links.push(data.paymentLink);
        }
      }
      setPayLink(links[0]);
      setModal('success');
    } catch (e: any) {
      setError(e.message || 'Failed to create payment');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: T.text, transition: 'background 0.2s, color 0.2s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${T.muted}; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div style={{ backgroundColor: T.surface, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {store.logo ? (
              <img src={store.logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                {store.name?.[0] || 'S'}
              </div>
            )}
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.04em', color: T.text }}>{store.name}</div>
              {store.category && <div style={{ fontSize: 10, fontWeight: 600, color: primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{store.category}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDark(d => !d)} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {dark ? '☀️' : '🌙'}
            </button>
            {itemCount > 0 && (
              <button onClick={() => setModal('cart')} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                🛒 {itemCount} · {naira(subtotal)}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 120px' }}>
        {store.banner && (
          <div style={{ margin: '16px 0', borderRadius: 12, overflow: 'hidden', height: 160 }}>
            <img src={store.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ marginTop: store.banner ? 0 : 16, marginBottom: 20 }}>
          {store.description && <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{store.description}</p>}
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}`, marginBottom: 14 }}>
            {[{ icon: '⭐', value: '4.8', label: 'Rating' }, { icon: '📦', value: '120+', label: 'Orders' }, { icon: '⚡', value: '<1hr', label: 'Replies' }].map((s, i) => (
              <div key={s.label} style={{ flex: 1, backgroundColor: T.surface, padding: '10px 4px', textAlign: 'center', borderLeft: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.icon} {s.value}</div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {store.contact?.whatsapp && (
              <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0d1a0d', color: '#1FAE63', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #1a2e1a' }}>💬 WhatsApp</a>
            )}
            {store.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.surfaceSoft, color: T.text, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${T.border}` }}>✉️ Email</a>
            )}
            {store.contact?.twitter && (
              <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.surfaceSoft, color: T.text, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${T.border}` }}>𝕏 {store.contact.twitter}</a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.06em', color: T.text }}>PRODUCTS</div>
          <div style={{ fontSize: 12, color: T.muted }}>{store.products.length} items</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {store.products.map(product => {
            const qty = cart[product.id] || 0;
            const soldOut = product.stock === 0 || !product.active;
            const lowStock = product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= 3;
            return (
              <div key={product.id} style={{ backgroundColor: T.surface, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                <div onClick={() => setLightbox(product)} style={{ position: 'relative', aspectRatio: '1', backgroundColor: T.surfaceSoft, cursor: 'pointer', overflow: 'hidden' }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🛍️</div>
                  )}
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    {soldOut ? (
                      <span style={{ backgroundColor: T.surfaceSoft, color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>Sold out</span>
                    ) : lowStock ? (
                      <span style={{ backgroundColor: 'rgba(255,77,46,0.12)', color: '#FF4D2E', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>Low stock</span>
                    ) : (
                      <span style={{ backgroundColor: 'rgba(31,174,99,0.12)', color: '#1FAE63', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>In stock</span>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{product.name}</div>
                  {product.description && <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{product.description}</div>}
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: T.text, marginBottom: 10 }}>{naira(product.price)}</div>
                  {soldOut ? (
                    <div style={{ width: '100%', padding: '8px', backgroundColor: T.surfaceSoft, color: T.muted, textAlign: 'center', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Unavailable</div>
                  ) : qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surfaceSoft, borderRadius: 6, overflow: 'hidden' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '8px 14px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '8px 14px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => setQty(product.id, 1)} style={{ width: '100%', padding: '8px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>Add to cart</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            {store.contact?.email && <a href={`mailto:${store.contact.email}`} style={{ color: T.muted, fontSize: 12, textDecoration: 'none' }}>✉️ Email</a>}
            {store.contact?.twitter && <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ color: T.muted, fontSize: 12, textDecoration: 'none' }}>𝕏 {store.contact.twitter}</a>}
          </div>
          <p style={{ color: T.muted, fontSize: 11 }}>Powered by <span style={{ color: primary, fontWeight: 600 }}>ChatFi</span></p>
        </div>
      </div>

      {itemCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', backgroundColor: T.surface, borderTop: `1px solid ${T.border}`, zIndex: 30 }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <button onClick={() => setModal('cart')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{itemCount} item{itemCount > 1 ? 's' : ''} · {naira(subtotal)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>View Cart →</span>
            </button>
          </div>
        </div>
      )}

      {store.contact?.whatsapp && (
        <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ position: 'fixed', right: 16, bottom: itemCount > 0 ? 90 : 24, width: 52, height: 52, borderRadius: 26, backgroundColor: '#1FAE63', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', zIndex: 25, boxShadow: '0 8px 22px rgba(31,174,99,0.4)' }}>
          <span style={{ fontSize: 24 }}>💬</span>
        </a>
      )}

      {modal && (
        <div onClick={() => { if (modal !== 'paying') setModal(null); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40, animation: 'fadeIn 0.2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.surface, borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.3s ease', paddingBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.border }} />
            </div>

            {modal === 'cart' && (
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Your Cart</div>
                  <button onClick={() => setModal(null)} style={{ backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', color: T.muted, cursor: 'pointer', fontSize: 13 }}>Close</button>
                </div>
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: T.surfaceSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛍️</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{product.name}</div>
                      <div style={{ fontSize: 13, color: primary, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{naira(product.price)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: T.surfaceSoft, borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+</button>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: '14px', backgroundColor: T.surfaceSoft, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: T.muted, fontSize: 13 }}>Subtotal</span>
                    <span style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{naira(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: T.muted, fontSize: 13 }}>Delivery</span>
                    <span style={{ color: T.muted, fontSize: 13 }}>Calculated next</span>
                  </div>
                </div>
                <button onClick={() => setModal('delivery')} style={{ width: '100%', marginTop: 16, padding: '15px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Proceed to Checkout →
                </button>
              </div>
            )}

            {modal === 'delivery' && (
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => setModal('cart')} style={{ backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 10px', color: T.text, cursor: 'pointer', fontSize: 13 }}>← Back</button>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Delivery Details</div>
                </div>
                {[
                  { key: 'name', placeholder: 'Full name *', icon: '👤' },
                  { key: 'phone', placeholder: 'Phone number *', icon: '📞' },
                  { key: 'address', placeholder: 'Delivery address *', icon: '📍' },
                  { key: 'state', placeholder: 'State / City', icon: '🗺️' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: T.text }} />
                  </div>
                ))}
                <div style={{ backgroundColor: T.surfaceSoft, borderRadius: 10, padding: 14, marginTop: 4, marginBottom: 16 }}>
                  {cartItems.map(({ product, qty }) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: T.muted, fontSize: 13 }}>{product.name} × {qty}</span>
                      <span style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{naira(product.price * qty)}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, backgroundColor: T.border, margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>Total</span>
                    <span style={{ color: primary, fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{naira(subtotal)}</span>
                  </div>
                </div>
                {error && <p style={{ color: '#FF4D2E', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
                <button onClick={checkout} disabled={paying} style={{ width: '100%', padding: '15px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
                  {paying ? 'Creating payment...' : `Pay ${naira(subtotal)}`}
                </button>
              </div>
            )}

            {modal === 'success' && (
              <div style={{ padding: '0 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Order Created!</div>
                <p style={{ color: T.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Complete your payment via ChatFi Pay. Your order will be confirmed once payment is received.</p>
                <a href={payLink} target="_blank" style={{ display: 'block', width: '100%', padding: '15px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', marginBottom: 10 }}>Complete Payment →</a>
                <button onClick={() => { setModal(null); setCart({}); setForm({ name: '', phone: '', address: '', state: '' }); }} style={{ width: '100%', padding: '13px', backgroundColor: T.surfaceSoft, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>Back to Store</button>
              </div>
            )}
          </div>
        </div>
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: 14 }}>✕ Close</button>
          {lightbox.image ? (
            <img src={lightbox.image} alt={lightbox.name} style={{ maxWidth: '90vw', maxHeight: '60vh', borderRadius: 12, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          ) : (
            <div style={{ width: 280, height: 280, borderRadius: 12, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🛍️</div>
          )}
          <div style={{ textAlign: 'center', marginTop: 20, color: '#fff' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{lightbox.name}</div>
            <div style={{ fontSize: 15, color: primary, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>{naira(lightbox.price)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
