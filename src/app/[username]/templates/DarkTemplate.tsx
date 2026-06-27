'use client';
import { useState, useEffect, useMemo } from 'react';
import { NIGERIA_STATES } from '@/lib/nigeria-states';

const BASE_URL = 'https://pay.chatfi.pro/api';
const STATE_NAMES = Object.keys(NIGERIA_STATES);

interface Product { id: string; name: string; description: string; price: number; image: string; stock: number | null; active: boolean; }
interface Store { username: string; name: string; description: string; logo: string; banner: string; category: string; theme: { primary: string; bg: string }; contact: { whatsapp?: string; email?: string; twitter?: string }; products: Product[]; }

function hexToRgba(hex: string, alpha: number) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function IconBag({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
}
function IconSearch({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function IconClose({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function IconMinus({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IconPlus({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IconPin({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconImageOff({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20" /><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" /><path d="M13.5 13.5 16 16" /><path d="M21 15.34V5a2 2 0 0 0-2-2H9.66" /><path d="M3 9v10a2 2 0 0 0 2 2h10" /></svg>;
}
function IconWhatsApp({ size = 16 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={size} height={size} alt="WhatsApp" style={{ display: 'block' }} />;
}
function IconGmail({ size = 16 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" width={size} height={size} alt="Gmail" style={{ display: 'block' }} />;
}
function IconXLogo({ size = 14 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/X_icon_2.svg" width={size} height={size} alt="X" style={{ display: 'block', filter: 'invert(1)' }} />;
}

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === 0) return <span style={{ background: '#222', color: '#666', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Sold out</span>;
  if (stock !== null && stock <= 5) return <span style={{ background: 'rgba(255,77,46,0.15)', color: '#ff4d2e', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{stock} left</span>;
  return <span style={{ background: 'rgba(197,242,70,0.15)', color: '#c5f246', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>In stock</span>;
}

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .dk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; }
  @media (min-width: 640px) { .dk-grid { grid-template-columns: repeat(3, 1fr); } }
  .dk-card:hover img { transform: scale(1.05); }
  .sheet-field { width: 100%; padding: 12px; background-color: #1a1a1a; color: #fff; border: 1px solid #333; border-radius: 10px; font-size: 14px; box-sizing: border-box; font-family: inherit; }
  .sheet-field:focus { outline: none; border-color: #fff; }
  select.sheet-field { appearance: none; -webkit-appearance: none; }
`;

export default function DarkTemplate({ store, username }: { store: Store; username: string }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrLga, setAddrLga] = useState('');
  const [street, setStreet] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [email, setEmail] = useState('');
  const [buying, setBuying] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const primary = store.theme?.primary || '#c5f246';
  const initial = store.name?.[0]?.toUpperCase() || 'S';

  useEffect(() => {
    const el = document.getElementById('dk-scroll');
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 100);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartOpen) { const id = requestAnimationFrame(() => setCartVisible(true)); return () => cancelAnimationFrame(id); }
    else setCartVisible(false);
  }, [cartOpen]);

  useEffect(() => {
    if (selectedProduct) { const id = requestAnimationFrame(() => setSheetVisible(true)); return () => cancelAnimationFrame(id); }
  }, [selectedProduct]);

  const setQty = (id: string, qty: number) => setCart(c => { const n = { ...c }; if (qty <= 0) delete n[id]; else n[id] = qty; return n; });
  const cartItems = useMemo(() => Object.entries(cart).map(([id, qty]) => ({ product: store.products.find(p => p.id === id), qty })).filter((i): i is { product: Product; qty: number } => !!i.product), [cart, store.products]);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + (subtotal > 0 ? 1500 : 0);
  const lgaOptions = addrState ? NIGERIA_STATES[addrState] || [] : [];
  const checkoutTotal = selectedProduct ? selectedProduct.price * quantity : 0;
  const maxQty = selectedProduct?.stock ?? Infinity;
  const filteredProducts = store.products.filter(p => p.active !== false && p.name.toLowerCase().includes(search.toLowerCase()));

  const closeCart = () => { setCartVisible(false); setTimeout(() => setCartOpen(false), 280); };
  const openCheckout = (product: Product) => { closeCart(); setTimeout(() => { setQuantity(1); setBuyerName(''); setBuyerPhone(''); setAddrState(''); setAddrLga(''); setStreet(''); setHouseNo(''); setEmail(''); setPaymentLink(''); setError(''); setLocationError(''); setSelectedProduct(product); }, 300); };
  const closeSheet = () => { setSheetVisible(false); setTimeout(() => setSelectedProduct(null), 280); };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Not supported'); return; }
    setDetecting(true); setLocationError('');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await res.json();
        const addr = data?.address || {};
        const matchedState = STATE_NAMES.find(s => (addr.state || '').toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes((addr.state || '').toLowerCase()));
        if (matchedState) setAddrState(matchedState);
        const road = [addr.road, addr.suburb || addr.neighbourhood].filter(Boolean).join(', ');
        if (road) setStreet(road);
        if (!matchedState) setLocationError('Please confirm State/LGA below');
      } catch { setLocationError('Could not detect address'); } finally { setDetecting(false); }
    }, () => { setLocationError('Permission denied'); setDetecting(false); });
  };

  const confirmBuy = async () => {
    if (!selectedProduct) return;
    if (!buyerName.trim() || !buyerPhone.trim() || !addrState || !addrLga || !street.trim()) { setError('Please fill in name, phone, state, LGA, and street'); return; }
    setBuying(true); setError('');
    const fullAddress = [houseNo.trim(), street.trim(), addrLga, addrState].filter(Boolean).join(', ');
    try {
      const res = await fetch(`/api/charge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, productId: selectedProduct.id, quantity, buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), deliveryAddress: fullAddress, email: email.trim() || undefined }) });
      const data = await res.json();
      if (data.paymentLink) setPaymentLink(data.paymentLink);
      else setError(data.error || 'Failed to create payment');
    } catch { setError('Network error'); } finally { setBuying(false); }
  };

  return (
    <div id="dk-scroll" style={{ height: '100dvh', overflowY: 'auto', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: `1px solid ${scrolled ? '#1a1a1a' : 'transparent'}`, transition: 'all 220ms ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: scrolled ? 1 : 0, transition: 'opacity 200ms ease' }}>
          {store.logo ? <img src={store.logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 28, height: 28, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: 12 }}>{initial}</div>}
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.04em', color: '#fff' }}>{store.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button aria-label="Search" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(255,255,255,0.08)' }}>
            <IconSearch />
          </button>
          <button onClick={() => setCartOpen(true)} aria-label="Cart" style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(255,255,255,0.08)' }}>
            <IconBag size={18} color="#fff" />
            {itemCount > 0 && <span style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, borderRadius: '50%', background: primary, color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ padding: '40px 16px 32px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          {store.logo ? <img src={store.logo} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: `2px solid ${primary}` }} /> : <div style={{ width: 64, height: 64, borderRadius: 12, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: primary, border: `2px solid ${primary}` }}>{initial}</div>}
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: '0.03em', color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>{store.name}</h1>
            {store.category && <span style={{ background: hexToRgba(primary, 0.15), color: primary, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{store.category}</span>}
          </div>
        </div>
        {store.description && <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>{store.description}</p>}

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#444' }}><IconSearch size={16} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#111', border: '1px solid #222', borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Products */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.04em', color: '#fff', margin: 0 }}>PRODUCTS</h2>
          <span style={{ color: '#444', fontSize: 12 }}>{filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="dk-grid" style={{ background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid #1a1a1a' }}>
          {filteredProducts.map(product => {
            const soldOut = product.stock === 0;
            const showImg = product.image && !imgErrors[product.id];
            return (
              <div key={product.id} className="dk-card" style={{ background: '#0a0a0a', borderRight: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#111' }}>
                  {showImg ? <img src={product.image} alt={product.name} onError={() => setImgErrors(p => ({ ...p, [product.id]: true }))} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconImageOff /></div>}
                  <div style={{ position: 'absolute', top: 8, left: 8 }}><StockBadge stock={product.stock} /></div>
                  {soldOut && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />}
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                  <p style={{ margin: '0 0 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: primary }}>₦{product.price.toLocaleString()}</p>
                  <button onClick={() => !soldOut && openCheckout(product)} disabled={soldOut} style={{ width: '100%', padding: '8px', background: soldOut ? '#1a1a1a' : primary, color: soldOut ? '#444' : '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: soldOut ? 'not-allowed' : 'pointer' }}>
                    {soldOut ? 'Sold out' : 'Buy now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '28px 16px 40px', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {store.logo ? <img src={store.logo} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: primary }}>{initial}</div>}
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#fff', letterSpacing: '0.03em' }}>{store.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {store.contact?.whatsapp && <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #222' }}><IconWhatsApp size={14} /> WhatsApp</a>}
          {store.contact?.email && <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #222' }}><IconGmail size={14} /> Email</a>}
          {store.contact?.twitter && <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #222' }}><IconXLogo size={14} /> {store.contact.twitter}</a>}
        </div>
        <p style={{ color: '#333', fontSize: 12, margin: 0 }}>Powered by <a href="https://chatfi.pro" style={{ color: primary, textDecoration: 'none', fontWeight: 600 }}>ChatFi</a></p>
      </footer>

      {/* Floating WhatsApp */}
      {store.contact?.whatsapp && (
        <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ position: 'fixed', right: 16, bottom: itemCount > 0 ? 88 : 20, width: 52, height: 52, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(37,211,102,0.4)', transition: 'bottom 200ms ease', textDecoration: 'none', zIndex: 29 }}>
          <IconWhatsApp size={28} />
        </a>
      )}

      {/* Floating cart */}
      {itemCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid #1a1a1a', zIndex: 30 }}>
          <button onClick={() => setCartOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: primary, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ background: 'rgba(0,0,0,0.2)', color: '#000', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{itemCount}</span><span style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>View Cart</span></span>
            <span style={{ color: '#000', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>₦{subtotal.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      {cartOpen && (
        <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: cartVisible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)', transition: 'background 0.28s ease', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#111', borderRadius: '20px 20px 0 0', maxHeight: '80vh', overflowY: 'auto', transform: cartVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s ease', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', alignSelf: 'center', margin: '10px auto 4px', display: 'block' }} />
            <div style={{ padding: '0 16px 16px' }}>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '12px 0 16px' }}>Cart ({itemCount})</h3>
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '12px', background: '#1a1a1a', borderRadius: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#222', overflow: 'hidden', flexShrink: 0 }}>
                    {product.image && <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: primary, fontFamily: "'JetBrains Mono', monospace" }}>₦{(product.price * qty).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setQty(product.id, qty - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #333', background: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconMinus /></button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #333', background: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconPlus /></button>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Subtotal</span>
                  <span style={{ color: '#fff', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>₦{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Delivery</span>
                  <span style={{ color: '#fff', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>₦1,500</span>
                </div>
                {cartItems.map(({ product }) => (
                  <button key={product.id} onClick={() => openCheckout(product)} style={{ width: '100%', padding: '13px', background: primary, color: '#000', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <IconBag size={14} color="#000" /> Checkout {product.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout sheet */}
      {selectedProduct && (
        <div onClick={closeSheet} style={{ position: 'fixed', inset: 0, background: sheetVisible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)', transition: 'background 0.28s ease', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#111', borderRadius: '20px 20px 0 0', maxHeight: '88vh', overflowY: 'auto', transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s ease', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '10px auto 4px', display: 'block' }} />
            <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 14, background: '#1a1a1a', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}><IconClose size={16} /></button>
            {paymentLink ? (
              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Payment Ready</h3>
                <p style={{ color: '#666', fontSize: 13, margin: '0 0 16px' }}>Tap below to complete your payment</p>
                <a href={paymentLink} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '14px', background: primary, color: '#000', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <IconBag size={14} color="#000" /> Pay ₦{checkoutTotal.toLocaleString()}
                </a>
                <button onClick={closeSheet} style={{ width: '100%', marginTop: 8, padding: '12px', background: 'transparent', color: '#666', border: '1px solid #222', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, paddingRight: 36 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 10, background: '#1a1a1a', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedProduct.image && !imgErrors[selectedProduct.id] ? <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconImageOff size={20} />}
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{selectedProduct.name}</h3>
                    <span style={{ color: primary, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>₦{selectedProduct.price.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #222', borderRadius: 10, padding: '8px 12px', marginBottom: 18 }}>
                  <span style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #333', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', color: quantity <= 1 ? '#444' : '#fff' }}><IconMinus size={14} /></button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', minWidth: 18, textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #333', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer', color: quantity >= maxQty ? '#444' : '#fff' }}><IconPlus size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                  <input className="sheet-field" placeholder="Full name" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                  <input className="sheet-field" placeholder="Phone number" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
                  <button onClick={handleDetectLocation} disabled={detecting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#1a1a1a', border: '1px dashed #333', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: detecting ? 'not-allowed' : 'pointer' }}>
                    <IconPin size={13} /> {detecting ? 'Detecting...' : 'Use my location'}
                  </button>
                  {locationError && <p style={{ color: '#d97706', fontSize: 12, margin: 0 }}>{locationError}</p>}
                  <select className="sheet-field" value={addrState} onChange={e => { setAddrState(e.target.value); setAddrLga(''); }}>
                    <option value="">Select state</option>
                    {STATE_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="sheet-field" value={addrLga} onChange={e => setAddrLga(e.target.value)} disabled={!addrState}>
                    <option value="">{addrState ? 'Select LGA' : 'Select state first'}</option>
                    {lgaOptions.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input className="sheet-field" placeholder="Street address" value={street} onChange={e => setStreet(e.target.value)} />
                  <input className="sheet-field" placeholder="House No. (optional)" value={houseNo} onChange={e => setHouseNo(e.target.value)} />
                  <input className="sheet-field" placeholder="Email (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {error && <p style={{ color: '#dc2626', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Total</span>
                  <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>₦{checkoutTotal.toLocaleString()}</span>
                </div>
                <button onClick={confirmBuy} disabled={buying} style={{ width: '100%', padding: '14px', background: primary, color: '#000', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1 }}>
                  {buying ? 'Creating payment...' : `Proceed to Pay`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
