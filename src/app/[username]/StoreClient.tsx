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

// SVG Icons
const Icons = {
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  cart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  star: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  package: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  zap: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  whatsapp: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  twitter: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  user: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mappin: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  map: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  bag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  image: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
};

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

  const [modal, setModal] = useState<'cart' | 'delivery' | 'success' | null>(null);
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

  const ic = (svg: React.ReactNode, color?: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: color || 'currentColor' }}>{svg}</span>
  );

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: T.text, transition: 'background 0.2s, color 0.2s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${T.muted}; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        button { font-family: inherit; }
      `}</style>

      {/* HEADER */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setDark(d => !d)} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text }}>
              {ic(dark ? Icons.sun : Icons.moon)}
            </button>
            {itemCount > 0 && (
              <button onClick={() => setModal('cart')} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {ic(Icons.cart, T.primaryText)}
                <span>{itemCount} · {naira(subtotal)}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 120px' }}>

        {/* BANNER */}
        {store.banner && (
          <div style={{ margin: '16px 0', borderRadius: 12, overflow: 'hidden', height: 160 }}>
            <img src={store.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* STORE INFO */}
        <div style={{ marginTop: store.banner ? 0 : 16, marginBottom: 20 }}>
          {store.description && <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{store.description}</p>}

          {/* Trust bar */}
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}`, marginBottom: 14 }}>
            {[
              { icon: Icons.star, value: '4.8', label: 'Rating', color: '#FFC24D' },
              { icon: Icons.package, value: '120+', label: 'Orders', color: '#1FAE63' },
              { icon: Icons.zap, value: '<1hr', label: 'Replies', color: primary },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, backgroundColor: T.surface, padding: '10px 4px', textAlign: 'center', borderLeft: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {ic(s.icon, s.color)}
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {store.contact?.whatsapp && (
              <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0d1a0d', color: '#1FAE63', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #1a2e1a' }}>
                {ic(Icons.whatsapp, '#1FAE63')} WhatsApp
              </a>
            )}
            {store.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.surfaceSoft, color: T.text, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${T.border}` }}>
                {ic(Icons.mail)} Email
              </a>
            )}
            {store.contact?.twitter && (
              <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.surfaceSoft, color: T.text, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${T.border}` }}>
                {ic(Icons.twitter)} {store.contact.twitter}
              </a>
            )}
          </div>
        </div>

        {/* PRODUCTS */}
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
                <div onClick={() => setLightbox(product)} style={{ position: 'relative', aspectRatio: '1', backgroundColor: T.surfaceSoft, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: T.border }}>{ic(Icons.image)}</span>
                  )}
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    {soldOut ? (
                      <span style={{ backgroundColor: T.surfaceSoft, color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>Sold out</span>
                    ) : lowStock ? (
                      <span style={{ backgroundColor: 'rgba(255,77,46,0.15)', color: '#FF4D2E', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>Low stock</span>
                    ) : (
                      <span style={{ backgroundColor: 'rgba(31,174,99,0.15)', color: '#1FAE63', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>In stock</span>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{product.name}</div>
                  {product.description && <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, lineHeight: 1.4 }}>{product.description}</div>}
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: T.text, marginBottom: 10 }}>{naira(product.price)}</div>
                  {soldOut ? (
                    <div style={{ width: '100%', padding: '8px', backgroundColor: T.surfaceSoft, color: T.muted, textAlign: 'center', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Unavailable</div>
                  ) : qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surfaceSoft, borderRadius: 6, overflow: 'hidden' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '8px 14px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '8px 14px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => setQty(product.id, 1)} style={{ width: '100%', padding: '8px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {ic(Icons.bag, T.primaryText)} Add to cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            {store.contact?.email && <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 12, textDecoration: 'none' }}>{ic(Icons.mail)} Email</a>}
            {store.contact?.twitter && <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 12, textDecoration: 'none' }}>{ic(Icons.twitter)} {store.contact.twitter}</a>}
          </div>
          <p style={{ color: T.muted, fontSize: 11 }}>Powered by <span style={{ color: primary, fontWeight: 600 }}>ChatFi</span></p>
        </div>
      </div>

      {/* FLOATING CART BAR */}
      {itemCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', backgroundColor: T.surface, borderTop: `1px solid ${T.border}`, zIndex: 30 }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <button onClick={() => setModal('cart')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{itemCount} item{itemCount > 1 ? 's' : ''} · {naira(subtotal)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>View Cart {ic(Icons.arrowRight, T.primaryText)}</span>
            </button>
          </div>
        </div>
      )}

      {/* WHATSAPP FAB */}
      {store.contact?.whatsapp && (
        <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ position: 'fixed', right: 16, bottom: itemCount > 0 ? 90 : 24, width: 52, height: 52, borderRadius: 26, backgroundColor: '#1FAE63', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', zIndex: 25, boxShadow: '0 8px 22px rgba(31,174,99,0.4)' }}>
          {ic(Icons.whatsapp, '#fff')}
        </a>
      )}

      {/* BOTTOM SHEET */}
      {modal && (
        <div onClick={() => { if (!paying) setModal(null); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40, animation: 'fadeIn 0.2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.surface, borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.3s ease', paddingBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.border }} />
            </div>

            {/* CART */}
            {modal === 'cart' && (
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Your Cart</div>
                  <button onClick={() => setModal(null)} style={{ backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', color: T.muted, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {ic(Icons.close)} Close
                  </button>
                </div>
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: T.surfaceSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>{ic(Icons.bag)}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{product.name}</div>
                      <div style={{ fontSize: 13, color: primary, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{naira(product.price)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: T.surfaceSoft, borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: T.text, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
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
                <button onClick={() => setModal('delivery')} style={{ width: '100%', marginTop: 16, padding: '15px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Proceed to Checkout {ic(Icons.arrowRight, T.primaryText)}
                </button>
              </div>
            )}

            {/* DELIVERY */}
            {modal === 'delivery' && (
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => setModal('cart')} style={{ backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 10px', color: T.text, cursor: 'pointer', fontSize: 13 }}>← Back</button>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Delivery Details</div>
                </div>
                {[
                  { key: 'name', placeholder: 'Full name *', icon: Icons.user },
                  { key: 'phone', placeholder: 'Phone number *', icon: Icons.phone },
                  { key: 'address', placeholder: 'Delivery address *', icon: Icons.mappin },
                  { key: 'state', placeholder: 'State / City', icon: Icons.map },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: T.surfaceSoft, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                    {ic(f.icon, T.muted)}
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

            {/* SUCCESS */}
            {modal === 'success' && (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(31,174,99,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {ic(Icons.check, '#1FAE63')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>Order Created!</div>
                <p style={{ color: T.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Complete your payment via ChatFi Pay. Your order will be confirmed once payment is received.</p>
                <a href={payLink} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', backgroundColor: primary, color: T.primaryText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', marginBottom: 10 }}>
                  Complete Payment {ic(Icons.arrowRight, T.primaryText)}
                </a>
                <button onClick={() => { setModal(null); setCart({}); setForm({ name: '', phone: '', address: '', state: '' }); }} style={{ width: '100%', padding: '13px', backgroundColor: T.surfaceSoft, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Back to Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.93)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {ic(Icons.close, '#fff')} Close
          </button>
          {lightbox.image ? (
            <img src={lightbox.image} alt={lightbox.name} style={{ maxWidth: '90vw', maxHeight: '60vh', borderRadius: 12, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          ) : (
            <div style={{ width: 280, height: 280, borderRadius: 12, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>{ic(Icons.image)}</div>
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
