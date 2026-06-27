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

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .cb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (min-width: 640px) { .cb-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 960px) { .cb-grid { grid-template-columns: repeat(4, 1fr); } }
  .cb-card { background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #f0f0f0; transition: box-shadow 0.15s ease; }
  .cb-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .cb-card:hover img { transform: scale(1.04); }
  .sheet-field { width: 100%; padding: 12px; background: #fafafa; color: #111; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 14px; font-family: inherit; }
  .sheet-field:focus { outline: none; border-color: #111; }
  select.sheet-field { appearance: none; -webkit-appearance: none; }
  .cb-cat-pill { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; min-width: 60px; }
  .cb-cat-pill span { font-size: 11px; font-weight: 600; color: #333; white-space: nowrap; }
`;

function IconBag({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
}
function IconSearch({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function IconClose({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function IconMinus({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IconPlus({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IconPin({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconHome({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function IconGrid({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
}
function IconUser({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function IconImageOff({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"><path d="m2 2 20 20" /><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" /><path d="M13.5 13.5 16 16" /><path d="M21 15.34V5a2 2 0 0 0-2-2H9.66" /><path d="M3 9v10a2 2 0 0 0 2 2h10" /></svg>;
}
function IconWhatsApp({ size = 16 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={size} height={size} alt="WhatsApp" style={{ display: 'block' }} />;
}

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === 0) return <span style={{ background: '#f5f5f5', color: '#999', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' as const }}>Sold out</span>;
  if (stock !== null && stock <= 5) return <span style={{ background: '#fff3f0', color: '#ff4d2e', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' as const }}>{stock} left</span>;
  return <span style={{ background: '#f0faf4', color: '#1fae63', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' as const }}>In stock</span>;
}

export default function ComboTemplate({ store, username }: { store: Store; username: string }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
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
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'cart'>('home');

  const primary = store.theme?.primary || '#e53935';
  const initial = store.name?.[0]?.toUpperCase() || 'S';

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
  const lgaOptions = addrState ? NIGERIA_STATES[addrState] || [] : [];
  const checkoutTotal = selectedProduct ? selectedProduct.price * quantity : 0;
  const maxQty = selectedProduct?.stock ?? Infinity;
  const filteredProducts = store.products.filter(p => p.active !== false && p.name.toLowerCase().includes(search.toLowerCase()));

  const closeCart = () => { setCartVisible(false); setTimeout(() => setCartOpen(false), 280); };
  const openCheckout = (product: Product) => {
    closeCart();
    setTimeout(() => { setQuantity(1); setBuyerName(''); setBuyerPhone(''); setAddrState(''); setAddrLga(''); setStreet(''); setHouseNo(''); setEmail(''); setPaymentLink(''); setError(''); setLocationError(''); setSelectedProduct(product); }, 300);
  };
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
    if (!buyerName.trim() || !buyerPhone.trim() || !addrState || !addrLga || !street.trim()) { setError('Please fill name, phone, state, LGA and street'); return; }
    setBuying(true); setError('');
    const fullAddress = [houseNo.trim(), street.trim(), addrLga, addrState].filter(Boolean).join(', ');
    try {
      const res = await fetch(`${BASE_URL}/store/${username}/charge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: selectedProduct.id, quantity, buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), deliveryAddress: fullAddress, email: email.trim() || undefined }) });
      const data = await res.json();
      if (data.paymentLink) setPaymentLink(data.paymentLink);
      else setError(data.error || 'Failed to create payment');
    } catch { setError('Network error'); } finally { setBuying(false); }
  };

  // Unique categories from products
  const categories = ['All', ...Array.from(new Set(store.products.map(p => p.name.split(' ')[0]).filter(Boolean)))].slice(0, 8);
  const [activeCategory, setActiveCategory] = useState('All');
  const displayProducts = filteredProducts.filter(p => activeCategory === 'All' || p.name.startsWith(activeCategory));

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: '#f5f5f5', fontFamily: "'Inter', sans-serif", paddingBottom: 70 }} id="combo-scroll">
      <style>{FONTS}</style>

      {/* Top header */}
      <header style={{ background: primary, padding: '0 12px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          {store.logo
            ? <img src={store.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', background: '#fff' }} />
            : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>{initial}</div>
          }
          {/* Search bar */}
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }}><IconSearch size={15} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search in ${store.name}...`} style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8, border: 'none', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
          </div>
          {/* Cart */}
          <button onClick={() => setCartOpen(true)} style={{ position: 'relative', width: 38, height: 38, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <IconBag size={18} color="#fff" />
            {itemCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', color: primary, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* Banner */}
      <div style={{ background: primary, padding: '0 12px 16px' }}>
        {store.banner ? (
          <img src={store.banner} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', height: 140, display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: 140, borderRadius: 12, background: hexToRgba('#ffffff', 0.15), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>{store.name}</span>
            {store.description && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: '0 20px' }}>{store.description}</span>}
          </div>
        )}
      </div>

      {/* Store info strip */}
      <div style={{ background: '#fff', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
        {store.logo
          ? <img src={store.logo} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: `2px solid ${primary}` }} />
          : <div style={{ width: 40, height: 40, borderRadius: 8, background: hexToRgba(primary, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: primary, border: `2px solid ${primary}` }}>{initial}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#111' }}>{store.name}</p>
          {store.category && <span style={{ fontSize: 11, color: primary, fontWeight: 600 }}>{store.category}</span>}
        </div>
        {store.contact?.whatsapp && (
          <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#25D366', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            <IconWhatsApp size={14} /> Chat
          </a>
        )}
      </div>

      {/* Category pills */}
      <div style={{ background: '#fff', padding: '10px 14px', marginBottom: 8, overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${activeCategory === cat ? primary : '#e5e5e5'}`, background: activeCategory === cat ? hexToRgba(primary, 0.08) : '#fff', color: activeCategory === cat ? primary : '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products section */}
      <div style={{ padding: '0 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>Products</span>
          <span style={{ fontSize: 12, color: '#999' }}>{displayProducts.length} item{displayProducts.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="cb-grid">
          {displayProducts.map(product => {
            const soldOut = product.stock === 0;
            const showImg = product.image && !imgErrors[product.id];
            const qty = cart[product.id] || 0;
            return (
              <div key={product.id} className="cb-card">
                <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#f8f8f8' }}>
                  {showImg
                    ? <img src={product.image} alt={product.name} onError={() => setImgErrors(p => ({ ...p, [product.id]: true }))} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconImageOff /></div>}
                  <div style={{ position: 'absolute', top: 6, left: 6 }}><StockBadge stock={product.stock} /></div>
                  {soldOut && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)' }} />}
                </div>
                <div style={{ padding: '10px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: primary, fontFamily: "'JetBrains Mono', monospace" }}>₦{product.price.toLocaleString()}</p>
                  {qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: hexToRgba(primary, 0.08), borderRadius: 8, padding: '4px 8px' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconMinus size={12} /></button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: primary }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconPlus size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={() => !soldOut && setQty(product.id, 1)} disabled={soldOut} style={{ width: '100%', padding: '7px', background: soldOut ? '#f5f5f5' : primary, color: soldOut ? '#aaa' : '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: soldOut ? 'not-allowed' : 'pointer' }}>
                      {soldOut ? 'Sold out' : 'Add to cart'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '20px 14px 16px', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {store.contact?.whatsapp && <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', color: '#333', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #eee' }}><IconWhatsApp size={14} /> WhatsApp</a>}
          {store.contact?.email && <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', color: '#333', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #eee' }}>✉️ Email</a>}
        </div>
        <p style={{ color: '#bbb', fontSize: 11, margin: 0 }}>Powered by <a href="https://chatfi.pro" style={{ color: primary, textDecoration: 'none', fontWeight: 600 }}>ChatFi</a></p>
      </footer>

      {/* Bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', zIndex: 40, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { id: 'home', label: 'Home', icon: <IconHome size={20} color={activeTab === 'home' ? primary : '#999'} /> },
          { id: 'products', label: 'Products', icon: <IconGrid size={20} color={activeTab === 'products' ? primary : '#999'} /> },
          { id: 'cart', label: `Cart${itemCount > 0 ? ` (${itemCount})` : ''}`, icon: <IconBag size={20} color={activeTab === 'cart' ? primary : '#999'} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as typeof activeTab); if (tab.id === 'cart') setCartOpen(true); else document.getElementById('combo-scroll')?.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
            {tab.icon}
            <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === tab.id ? primary : '#999' }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Floating WhatsApp */}
      {store.contact?.whatsapp && (
        <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ position: 'fixed', right: 16, bottom: 80, width: 48, height: 48, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,211,102,0.4)', textDecoration: 'none', zIndex: 35 }}>
          <IconWhatsApp size={26} />
        </a>
      )}

      {/* Cart sheet */}
      {cartOpen && (
        <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: cartVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)', transition: 'background 0.28s ease', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '80vh', overflowY: 'auto', transform: cartVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s ease', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e5e5', margin: '10px auto 4px', display: 'block' }} />
            <div style={{ padding: '4px 16px 16px' }}>
              <h3 style={{ color: '#111', fontSize: 16, fontWeight: 800, margin: '8px 0 16px' }}>Cart ({itemCount})</h3>
              {cartItems.length === 0 && <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Your cart is empty</p>}
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '10px', background: '#fafafa', borderRadius: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f0f0', overflow: 'hidden', flexShrink: 0 }}>
                    {product.image && <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ margin: 0, fontSize: 13, color: primary, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>₦{(product.price * qty).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setQty(product.id, qty - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${primary}`, background: '#fff', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconMinus /></button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111', minWidth: 16, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${primary}`, background: '#fff', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconPlus /></button>
                  </div>
                </div>
              ))}
              {cartItems.length > 0 && (
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#666', fontSize: 13 }}>Subtotal</span>
                    <span style={{ color: '#111', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#666', fontSize: 13 }}>Delivery</span>
                    <span style={{ color: '#111', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>₦1,500</span>
                  </div>
                  {cartItems.map(({ product }) => (
                    <button key={product.id} onClick={() => openCheckout(product)} style={{ width: '100%', padding: '13px', background: primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <IconBag size={14} /> Checkout {product.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout sheet */}
      {selectedProduct && (
        <div onClick={closeSheet} style={{ position: 'fixed', inset: 0, background: sheetVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)', transition: 'background 0.28s ease', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '88vh', overflowY: 'auto', transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s ease', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e5e5', margin: '10px auto 4px', display: 'block' }} />
            <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 14, background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}><IconClose size={16} /></button>
            {paymentLink ? (
              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ color: '#111', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Payment Ready</h3>
                <p style={{ color: '#777', fontSize: 13, margin: '0 0 16px' }}>Tap below to complete your payment</p>
                <a href={paymentLink} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '14px', background: primary, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <IconBag size={14} /> Pay ₦{checkoutTotal.toLocaleString()}
                </a>
                <button onClick={closeSheet} style={{ width: '100%', marginTop: 8, padding: '12px', background: 'transparent', color: '#777', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, paddingRight: 36 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 10, background: '#f4f4f4', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedProduct.image && !imgErrors[selectedProduct.id] ? <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconImageOff size={20} />}
                  </div>
                  <div>
                    <h3 style={{ color: '#111', fontSize: 15, fontWeight: 700, margin: 0 }}>{selectedProduct.name}</h3>
                    <span style={{ color: primary, fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>₦{selectedProduct.price.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: '8px 12px', marginBottom: 18 }}>
                  <span style={{ color: '#555', fontSize: 13, fontWeight: 600 }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${primary}`, background: '#fff', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}><IconMinus size={14} /></button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111', minWidth: 18, textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${primary}`, background: '#fff', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer' }}><IconPlus size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                  <input className="sheet-field" placeholder="Full name" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                  <input className="sheet-field" placeholder="Phone number" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
                  <button onClick={handleDetectLocation} disabled={detecting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#fff', border: '1px dashed #ccc', borderRadius: 10, color: '#111', fontSize: 13, fontWeight: 600, cursor: detecting ? 'not-allowed' : 'pointer' }}>
                    <IconPin size={13} /> {detecting ? 'Detecting location...' : 'Use my location'}
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
                  <span style={{ color: '#777', fontSize: 13 }}>Total</span>
                  <span style={{ color: '#111', fontSize: 18, fontWeight: 800 }}>₦{checkoutTotal.toLocaleString()}</span>
                </div>
                <button onClick={confirmBuy} disabled={buying} style={{ width: '100%', padding: '14px', background: primary, color: '#fff', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1 }}>
                  {buying ? 'Creating payment...' : 'Proceed to Pay'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
