'use client';
import { useState, useMemo, useEffect } from 'react';

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

const naira = (n: number) => `₦${Number(n).toLocaleString('en-NG')}`;

const ic = {
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  bag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  bagSm: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  checkSm: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  star: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  pkg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  zap: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  whatsapp: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  twitter: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  truck: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  user: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mappin: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  image: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  chevDown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

function Svg({ children, color }: { children: React.ReactNode; color?: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: color || 'currentColor' }}>{children}</span>;
}

function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ width: 40, height: 4, background: '#E4E2DC', borderRadius: 2, margin: '12px auto 0' }} />
        {children}
      </div>
    </div>
  );
}

export default function StoreClient({ store, username }: { store: Store; username: string }) {
  const primary = store.theme?.primary || '#FF4D2E';
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const T = {
    bg: dark ? '#08080A' : '#F7F6F2',
    surface: dark ? '#111113' : '#FFFFFF',
    surfaceSoft: dark ? '#18181B' : '#EFEDE7',
    border: dark ? '#27272A' : '#E4E2DC',
    text: dark ? '#FAFAFA' : '#15161A',
    muted: dark ? '#71717A' : '#76777E',
    primary,
    primaryText: dark ? '#000' : '#fff',
    mint: '#1FAE63',
    mintSoft: 'rgba(31,174,99,0.12)',
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 160);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [cart, setCart] = useState<Record<string, number>>({});
  const cartItems = useMemo(() =>
    store.products.filter(p => (cart[p.id] || 0) > 0).map(p => ({ product: p, qty: cart[p.id] })),
    [cart, store.products]);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const deliveryFee = 1500;

  const setQty = (id: string, qty: number) =>
    setCart(c => qty <= 0 ? { ...c, [id]: 0 } : { ...c, [id]: qty });

  const [sheet, setSheet] = useState<'cart' | 'checkout' | 'success' | null>(null);
  const [lightbox, setLightbox] = useState<Product | null>(null);
  const [openSection, setOpenSection] = useState<string>('order');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);
  const [payLink, setPayLink] = useState('');
  const [error, setError] = useState('');
  const [orderNumber] = useState(() => `CF-${Math.floor(100000 + Math.random() * 900000)}`);

  const deliveryComplete = form.name && form.phone && (deliveryMethod === 'pickup' || form.address);
  const total = subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);

  const checkout = async () => {
    if (!deliveryComplete) { setError('Please fill all required fields'); return; }
    setPaying(true); setError('');
    try {
      const links: string[] = [];
      for (const item of cartItems) {
        for (let i = 0; i < item.qty; i++) {
          const res = await fetch(`${BASE_URL}/store/${username}/charge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: item.product.id, buyerDelivery: { ...form, method: deliveryMethod, note } }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          links.push(data.paymentLink);
        }
      }
      setPayLink(links[0]);
      setSheet('success');
    } catch (e: any) {
      setError(e.message || 'Failed to create payment');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { font-family: inherit; }
        button { font-family: inherit; cursor: pointer; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(1.9); opacity: 0; } }
        input::placeholder, textarea::placeholder { color: ${T.muted}; }
      `}</style>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: scrolled ? (dark ? 'rgba(8,8,10,0.92)' : 'rgba(247,246,242,0.92)') : 'transparent', backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: `1px solid ${scrolled ? T.border : 'transparent'}`, transition: 'background 220ms ease, border-color 220ms ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: scrolled ? 1 : 0, transform: scrolled ? 'translateY(0)' : 'translateY(-4px)', transition: 'opacity 200ms, transform 200ms' }}>
          {store.logo ? (
            <img src={store.logo} alt="logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>{store.name?.[0] || 'S'}</div>
          )}
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.04em', color: T.text }}>{store.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button onClick={() => setDark(d => !d)} style={{ width: 36, height: 36, borderRadius: '50%', background: scrolled ? T.surfaceSoft : 'rgba(255,255,255,0.55)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text }}>
            <Svg>{dark ? ic.sun : ic.moon}</Svg>
          </button>
          <button onClick={() => setSheet('cart')} style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', background: scrolled ? T.surfaceSoft : 'rgba(255,255,255,0.55)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text }}>
            <Svg>{ic.bag}</Svg>
            {itemCount > 0 && <span style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, borderRadius: '50%', background: primary, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>}
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', height: 248, overflow: 'hidden', background: `radial-gradient(120% 100% at 0% 0%, ${primary}38, transparent 55%), linear-gradient(165deg, #FBEEE6, ${T.bg} 75%)` }}>
        <div style={{ position: 'absolute', insetInline: 0, bottom: 0, padding: '56px 16px 16px', background: `linear-gradient(0deg, ${T.bg} 8%, transparent 90%)`, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ width: 68, height: 68, borderRadius: 12, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24, color: primary, boxShadow: `0 0 0 3px ${T.bg}, 0 0 0 4.5px ${primary}88`, flexShrink: 0, overflow: 'hidden' }}>
            {store.logo ? <img src={store.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (store.name?.[0] || 'S')}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.02em', color: T.text, lineHeight: 1 }}>{store.name}</div>
            {store.category && <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: T.surfaceSoft, color: T.text, padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>{store.category}</span>}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 120px' }}>
        <div style={{ marginTop: 16, marginBottom: 20 }}>
          {store.description && <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{store.description}</p>}
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}`, marginBottom: 14 }}>
            {[
              { icon: ic.star, value: '4.8', label: 'Rating', color: '#FFC24D' },
              { icon: ic.pkg, value: '120+', label: 'Orders', color: T.mint },
              { icon: ic.zap, value: '<1hr', label: 'Replies', color: primary },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, background: T.surface, padding: '10px 4px', textAlign: 'center', borderLeft: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Svg color={s.color}>{s.icon}</Svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {store.contact?.whatsapp && (
              <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0d1a0d', color: '#1FAE63', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #1a2e1a' }}>
                <Svg color="#1FAE63">{ic.whatsapp}</Svg> WhatsApp
              </a>
            )}
            {store.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.surfaceSoft, color: T.text, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${T.border}` }}>
                <Svg>{ic.mail}</Svg> Email
              </a>
            )}
            {store.contact?.twitter && (
              <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.surfaceSoft, color: T.text, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${T.border}` }}>
                <Svg>{ic.twitter}</Svg> {store.contact.twitter}
              </a>
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
              <div key={product.id} style={{ background: T.surface, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                <div onClick={() => setLightbox(product)} style={{ position: 'relative', aspectRatio: '1', background: T.surfaceSoft, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image && !product.image.includes('youtube') ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Svg color={T.border}>{ic.image}</Svg>
                  )}
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    {soldOut ? (
                      <span style={{ background: T.surfaceSoft, color: T.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>Sold out</span>
                    ) : lowStock ? (
                      <span style={{ background: `${primary}20`, color: primary, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>Low stock</span>
                    ) : (
                      <span style={{ background: 'rgba(31,174,99,0.15)', color: '#1FAE63', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 7px', borderRadius: 4 }}>In stock</span>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{product.name}</div>
                  {product.description && <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, lineHeight: 1.4 }}>{product.description}</div>}
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: T.text, marginBottom: 10 }}>{naira(product.price)}</div>
                  {soldOut ? (
                    <div style={{ width: '100%', padding: '8px', background: T.surfaceSoft, color: T.muted, textAlign: 'center', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Unavailable</div>
                  ) : qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceSoft, borderRadius: 6, overflow: 'hidden' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '8px 14px', background: 'transparent', border: 'none', color: T.text, fontWeight: 700, fontSize: 16 }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '8px 14px', background: 'transparent', border: 'none', color: T.text, fontWeight: 700, fontSize: 16 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => setQty(product.id, 1)} style={{ width: '100%', padding: '8px', background: primary, color: T.primaryText, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Svg color={T.primaryText}>{ic.bagSm}</Svg> Add to cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff' }}>{store.name?.[0] || 'S'}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{store.name}</span>
          </div>
          <p style={{ fontSize: 11, color: T.muted }}>Powered by ChatFi Pay</p>
        </div>
      </div>

      {itemCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 12, background: dark ? 'rgba(8,8,10,0.95)' : 'rgba(247,246,242,0.95)', borderTop: `1px solid ${T.border}`, backdropFilter: 'blur(12px)', zIndex: 30 }}>
          <button onClick={() => setSheet('cart')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: primary, color: T.primaryText, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
            <span>{itemCount} item{itemCount > 1 ? 's' : ''} · {naira(subtotal)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>View cart <Svg color={T.primaryText}>{ic.arrowRight}</Svg></span>
          </button>
        </div>
      )}

      {store.contact?.whatsapp && (
        <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ position: 'fixed', right: 16, bottom: itemCount > 0 ? 88 : 24, width: 52, height: 52, borderRadius: '50%', background: '#1FAE63', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(31,174,99,0.4)', zIndex: 29, textDecoration: 'none', transition: 'bottom 200ms ease' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#1FAE63', animation: 'pulseRing 2.2s ease-out infinite' }} />
          <Svg color="#fff">{ic.whatsapp}</Svg>
        </a>
      )}

      <BottomSheet open={sheet === 'cart'} onClose={() => setSheet(null)}>
        <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.04em', color: '#15161A' }}>YOUR CART</span>
          <button onClick={() => setSheet(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFEDE7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15161A' }}>
            <Svg>{ic.close}</Svg>
          </button>
        </div>
        {cartItems.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#76777E' }}>
            <p style={{ fontSize: 14 }}>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#F7F6F2', borderRadius: 10, border: '1px solid #E4E2DC' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#EFEDE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image && !product.image.includes('youtube') ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <Svg color="#E4E2DC">{ic.image}</Svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#15161A', marginBottom: 2 }}>{product.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#15161A' }}>{naira(product.price * qty)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#EFEDE7', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                    <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#15161A', fontWeight: 700, fontSize: 16 }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#15161A', minWidth: 20, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#15161A', fontWeight: 700, fontSize: 16 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#76777E' }}>
                <span>Subtotal · {itemCount} item{itemCount > 1 ? 's' : ''}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#15161A', fontWeight: 600 }}>{naira(subtotal)}</span>
              </div>
              <button onClick={() => setSheet('checkout')} style={{ width: '100%', padding: '14px', background: primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Checkout
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === 'checkout'} onClose={() => setSheet('cart')}>
        <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.04em', color: '#15161A' }}>CHECKOUT</span>
          <button onClick={() => setSheet('cart')} style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFEDE7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15161A' }}>
            <Svg>{ic.close}</Svg>
          </button>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#F7F6F2', borderRadius: 10, border: '1px solid #E4E2DC', overflow: 'hidden' }}>
            <button onClick={() => setOpenSection(s => s === 'order' ? '' : 'order')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', color: '#15161A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#EFEDE7', color: '#76777E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15161A' }}>Order details</div>
                  <div style={{ fontSize: 12, color: '#76777E' }}>{itemCount} item{itemCount > 1 ? 's' : ''}</div>
                </div>
              </div>
              <Svg color="#76777E">{ic.chevDown}</Svg>
            </button>
            {openSection === 'order' && (
              <div style={{ padding: '12px 16px 16px', borderTop: '1px dashed #E4E2DC' }}>
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#15161A' }}>
                    <span>{product.name} <span style={{ color: '#76777E' }}>× {qty}</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{naira(product.price * qty)}</span>
                  </div>
                ))}
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note for seller (size, color, etc.)" rows={2} style={{ width: '100%', marginTop: 8, background: '#EFEDE7', border: '1px solid #E4E2DC', borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#15161A', resize: 'none', outline: 'none' }} />
              </div>
            )}
          </div>

          <div style={{ background: '#F7F6F2', borderRadius: 10, border: '1px solid #E4E2DC', overflow: 'hidden' }}>
            <button onClick={() => setOpenSection(s => s === 'delivery' ? '' : 'delivery')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', color: '#15161A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: deliveryComplete ? 'rgba(31,174,99,0.12)' : '#EFEDE7', color: deliveryComplete ? '#1FAE63' : '#76777E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {deliveryComplete ? <Svg>{ic.checkSm}</Svg> : '2'}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15161A' }}>Delivery details</div>
                  <div style={{ fontSize: 12, color: '#76777E' }}>{deliveryMethod === 'pickup' ? 'Self pickup' : 'Delivery to address'}</div>
                </div>
              </div>
              <Svg color="#76777E">{ic.chevDown}</Svg>
            </button>
            {openSection === 'delivery' && (
              <div style={{ padding: '12px 16px 16px', borderTop: '1px dashed #E4E2DC', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['delivery', 'pickup'] as const).map(m => (
                    <button key={m} onClick={() => setDeliveryMethod(m)} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${deliveryMethod === m ? primary : '#E4E2DC'}`, background: deliveryMethod === m ? `${primary}15` : '#EFEDE7', textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#15161A', textTransform: 'capitalize' }}>{m}</div>
                      <div style={{ fontSize: 11, color: '#76777E' }}>{m === 'delivery' ? '+ ₦1,500' : 'Free'}</div>
                    </button>
                  ))}
                </div>
                {[
                  { icon: ic.user, placeholder: 'Full name', key: 'name' },
                  { icon: ic.phone, placeholder: 'Phone number', key: 'phone' },
                  ...(deliveryMethod === 'delivery' ? [{ icon: ic.mappin, placeholder: 'Delivery address', key: 'address' }] : []),
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EFEDE7', border: '1px solid #E4E2DC', borderRadius: 8, padding: '0 12px' }}>
                    <Svg color="#76777E">{f.icon}</Svg>
                    <input value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', fontSize: 14, color: '#15161A' }} />
                  </div>
                ))}
                {deliveryMethod === 'pickup' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#76777E' }}>
                    <Svg>{ic.truck}</Svg> Pickup location shared after order confirmation.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ background: '#F7F6F2', borderRadius: 10, border: '1px solid #E4E2DC', overflow: 'hidden' }}>
            <button onClick={() => setOpenSection(s => s === 'payment' ? '' : 'payment')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', color: '#15161A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#EFEDE7', color: '#76777E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15161A' }}>Payment</div>
                  <div style={{ fontSize: 12, color: '#76777E' }}>Pay with ChatFi</div>
                </div>
              </div>
              <Svg color="#76777E">{ic.chevDown}</Svg>
            </button>
            {openSection === 'payment' && (
              <div style={{ padding: '12px 16px 16px', borderTop: '1px dashed #E4E2DC', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ label: 'Subtotal', value: naira(subtotal) }, { label: 'Delivery fee', value: deliveryMethod === 'delivery' ? naira(deliveryFee) : 'Free' }].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#76777E' }}>
                    <span>{r.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#15161A', fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px dashed #E4E2DC', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#15161A' }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{naira(total)}</span>
                </div>
              </div>
            )}
          </div>

          {error && <p style={{ color: '#FF4D2E', fontSize: 13, textAlign: 'center' }}>{error}</p>}

          <button disabled={!deliveryComplete || paying} onClick={checkout} style={{ width: '100%', padding: '15px', background: deliveryComplete ? primary : '#E4E2DC', color: deliveryComplete ? '#fff' : '#76777E', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>{paying ? 'Processing...' : `Pay ${naira(total)}`}</span>
            <Svg color={deliveryComplete ? '#fff' : '#76777E'}>{ic.check}</Svg>
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'success'} onClose={() => {}}>
        <div style={{ padding: '32px 24px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(31,174,99,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Svg color="#1FAE63">{ic.check}</Svg>
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.04em', color: '#15161A' }}>ORDER PLACED</div>
          <p style={{ fontSize: 14, color: '#76777E' }}>Order <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#15161A' }}>{orderNumber}</span> is confirmed.</p>
          <p style={{ fontSize: 13, color: '#76777E', maxWidth: 280 }}>{store.name} will reach out on <span style={{ color: '#15161A' }}>{form.phone}</span> to confirm your {deliveryMethod}.</p>
          {payLink && (
            <a href={payLink} target="_blank" style={{ width: '100%', display: 'block', padding: '14px', background: primary, color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', marginTop: 8 }}>
              Complete Payment →
            </a>
          )}
          <button onClick={() => { setCart({}); setSheet(null); setForm({ name: '', phone: '', address: '' }); setNote(''); }} style={{ width: '100%', padding: '13px', background: '#EFEDE7', color: '#76777E', border: '1px solid #E4E2DC', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            Back to Store
          </button>
        </div>
      </BottomSheet>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(8,8,10,0.96)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
            <button onClick={() => setLightbox(null)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFEDE7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15161A' }}>
              <Svg>{ic.close}</Svg>
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '100%', maxWidth: 320, aspectRatio: '1', borderRadius: 16, overflow: 'hidden', background: '#18181B' }}>
              {lightbox.image && !lightbox.image.includes('youtube') ? (
                <img src={lightbox.image} alt={lightbox.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Svg color="#333">{ic.image}</Svg>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: '16px 24px 48px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#FAFAFA', marginBottom: 4 }}>{lightbox.name}</div>
            {lightbox.description && <div style={{ fontSize: 13, color: '#71717A', marginBottom: 8 }}>{lightbox.description}</div>}
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#FAFAFA' }}>{naira(lightbox.price)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
