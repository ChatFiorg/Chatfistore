'use client';
import { useState, useEffect, useMemo } from 'react';
import { NIGERIA_STATES } from '@/lib/nigeria-states';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import AccountSheet from '@/components/AccountSheet';

const BASE_URL = 'https://pay.chatfi.pro/api';
const STATE_NAMES = Object.keys(NIGERIA_STATES);

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
  template?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getTheme(template: string) {
  if (template === 'dark') return {
    bg: '#08080A',
    ink: '#111113',
    surface: '#18181B',
    surfaceSoft: '#27272A',
    divider: '#27272A',
    bone: '#FAFAFA',
    mute: '#71717A',
    signal: '#FF4D2E',
    signalSoft: 'rgba(255,77,46,0.15)',
    mint: '#1FAE63',
    mintSoft: 'rgba(31,174,99,0.15)',
  };
  if (template === 'combo') return {
    bg: '#0F0A1E',
    ink: '#160D2E',
    surface: '#1E1340',
    surfaceSoft: '#2A1D56',
    divider: '#2A1D56',
    bone: '#F0EAFF',
    mute: '#9B8FC4',
    signal: '#8B5CF6',
    signalSoft: 'rgba(139,92,246,0.15)',
    mint: '#1FAE63',
    mintSoft: 'rgba(31,174,99,0.15)',
  };
  // clean (default light)
  return {
    bg: '#fafafa',
    ink: '#FFFFFF',
    surface: '#F7F6F2',
    surfaceSoft: '#EFEDE7',
    divider: '#E4E2DC',
    bone: '#15161A',
    mute: '#76777E',
    signal: '#FF4D2E',
    signalSoft: 'rgba(255,77,46,0.12)',
    mint: '#1FAE63',
    mintSoft: 'rgba(31,174,99,0.12)',
  };
}



const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.85); opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (min-width: 640px) { .product-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
  @media (min-width: 960px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
  .pcard { transition: box-shadow 0.15s ease, transform 0.15s ease; }
  .pcard:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.07); transform: translateY(-2px); }
  .pcard:hover img { transform: scale(1.04); }
  .sheet-field { width: 100%; padding: 12px; background-color: #fafafa; color: #111; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 14px; box-sizing: border-box; font-family: inherit; }
  .sheet-field:focus { outline: none; border-color: #111; }
  select.sheet-field { appearance: none; -webkit-appearance: none; }
`;

// ── Icons ──
function IconChat({ size = 16 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={size} height={size} alt="WhatsApp" style={{ display: 'block' }} />;
}
function IconMail({ size = 16 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" width={size} height={size} alt="Gmail" style={{ display: 'block' }} />;
}
function IconX({ size = 14 }: { size?: number }) {
  return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/X_icon_2.svg" width={size} height={size} alt="X" style={{ display: 'block' }} />;
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
function IconNaira({ size = 16, color = '#111' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v18" />
      <path d="M19 3v18" />
      <path d="M5 3l14 18" />
      <path d="M3 9h18" />
      <path d="M3 14h18" />
    </svg>
  );
}
function IconCoin({ size = 16, color = '#111' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.2c0 1.3-1 1.8-2.5 2.3s-2.5 1-2.5 2.3c0 1.1 1.1 2.2 2.5 2.2s2.5-1.1 2.5-2.5" />
    </svg>
  );
}
function IconSearch({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconImageOff({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c4c4c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 20 20" /><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
      <path d="M13.5 13.5 16 16" /><path d="M21 15.34V5a2 2 0 0 0-2-2H9.66" />
      <path d="M3 9v10a2 2 0 0 0 2 2h10" />
    </svg>
  );
}
function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconMinus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconPlus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconPin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconArrowLeft({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}
function IconTrash({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function IconStar() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFC24D" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function IconPackage() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1FAE63" strokeWidth="2" strokeLinecap="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>;
}
function IconClock() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4D2E" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function BadgeCheck() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 3.2L18 4l.8 3.8L22 10l-2.4 2 .8 4-3.8-.4L14 18l-2-3.2L10 18l-2.6-2.4-3.8.4.8-4L2 10l3.2-2.2L6 4l3.6 1.2z" fill="#1FAE63" opacity="0.2" />
      <path d="M12 2l2.4 3.2L18 4l.8 3.8L22 10l-2.4 2 .8 4-3.8-.4L14 18l-2-3.2L10 18l-2.6-2.4-3.8.4.8-4L2 10l3.2-2.2L6 4l3.6 1.2z" fill="none" stroke="#1FAE63" strokeWidth="1.5" />
      <polyline points="8.5 12 11 14.5 15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Stock badge ──
function StockBadge({ stock }: { stock: number | null }) {
  if (stock === 0) return (
    <span style={{ background: '#EFEDE7', color: '#76777E', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Sold out</span>
  );
  if (stock !== null && stock <= 5) return (
    <span style={{ background: 'rgba(255,77,46,0.12)', color: '#FF4D2E', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{stock} left</span>
  );
  return (
    <span style={{ background: 'rgba(31,174,99,0.12)', color: '#1FAE63', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>In stock</span>
  );
}

export default function StoreClient({ store, username }: { store: Store; username: string }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // checkout sheet state
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
  const [paymentMethod, setPaymentMethod] = useState<'naira' | 'usdc'>('naira');  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [error, setError] = useState('');

  const C = getTheme((store as any).template || 'clean');
  const primary = store.theme?.primary || '#FF4D2E';
  const tint = hexToRgba(primary, 0.14);
  const initial = store.name?.[0]?.toUpperCase() || 'S';
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  const openRatingModal = () => { setRatingModalOpen(true); requestAnimationFrame(() => setRatingModalVisible(true)); };
  const closeRatingModal = () => { setRatingModalVisible(false); setTimeout(() => setRatingModalOpen(false), 280); };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const q = query(collection(db, 'store_ratings'), where('username', '==', username));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const ratings = snap.docs.map(d => d.data().rating as number);
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setAvgRating(avg);
          setRatingCount(ratings.length);
        }
      } catch (e) { console.error(e); }
    };
    fetchRatings();
  }, [username]);

  const submitRating = async (star: number) => {
    if (ratingSubmitted) return;
    setUserRating(star);
    setRatingSubmitted(true);
    try {
      await addDoc(collection(db, 'store_ratings'), {
        username,
        rating: star,
        createdAt: serverTimestamp(),
      });
      const newCount = ratingCount + 1;
      const newAvg = (avgRating * ratingCount + star) / newCount;
      setAvgRating(newAvg);
      setRatingCount(newCount);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const el = document.getElementById('store-scroll');
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 160);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartOpen) {
      const id = requestAnimationFrame(() => setCartVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setCartVisible(false);
    }
  }, [cartOpen]);

  useEffect(() => {
    if (selectedProduct) {
      const id = requestAnimationFrame(() => setSheetVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [selectedProduct]);

  const setQty = (id: string, qty: number) => setCart(c => {
    const next = { ...c };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    return next;
  });

  const cartItems = useMemo(() =>
    Object.entries(cart)
      .map(([id, qty]) => ({ product: store.products.find(p => p.id === id), qty }))
      .filter((i): i is { product: Product; qty: number } => !!i.product),
    [cart, store.products]
  );

  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const deliveryFee = subtotal > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  const lgaOptions = addrState ? NIGERIA_STATES[addrState] || [] : [];
  const checkoutTotal = selectedProduct ? selectedProduct.price * quantity : 0;
  const maxQty = selectedProduct?.stock ?? Infinity;

  const closeCart = () => {
    setCartVisible(false);
    setTimeout(() => setCartOpen(false), 280);
  };

  const openCheckout = (product: Product) => {
    closeCart();
    setTimeout(() => {
      setQuantity(1);
      setBuyerName(''); setBuyerPhone(''); setAddrState(''); setAddrLga('');
      setStreet(''); setHouseNo(''); setEmail(''); setPaymentLink(''); setError(''); setLocationError('');
      setSelectedProduct(product);
    }, 300);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setTimeout(() => setSelectedProduct(null), 280);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Location not supported on this browser'); return; }
    setDetecting(true); setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const addr = data?.address || {};
          const detectedState = addr.state || '';
          const matchedState = STATE_NAMES.find(s =>
            detectedState.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(detectedState.toLowerCase())
          );
          if (matchedState) setAddrState(matchedState);
          const roadPart = [addr.road, addr.suburb || addr.neighbourhood].filter(Boolean).join(', ');
          if (roadPart) setStreet(roadPart);
          if (!matchedState) setLocationError('Detected your location, but please confirm State/LGA below');
        } catch { setLocationError('Could not detect address — please fill manually'); }
        finally { setDetecting(false); }
      },
      () => { setLocationError('Location permission denied — please fill manually'); setDetecting(false); }
    );
  };

  const confirmBuy = async () => {
    if (!selectedProduct) return;
    if (!buyerName.trim() || !buyerPhone.trim() || !addrState || !addrLga || !street.trim()) {
      setError('Please fill in your name, phone, state, LGA, and street address'); return;
    }
    setBuying(true); setError('');
    const fullAddress = [houseNo.trim(), street.trim(), addrLga, addrState].filter(Boolean).join(', ');
    try {
      if (paymentMethod === 'naira') {
        const callbackUrl = `https://${username}.chatfi.pro/order`;
        const res = await fetch(`/api/charge-naira`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, productId: selectedProduct.id, buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), buyerDelivery: fullAddress, buyerEmail: email.trim() || `${buyerPhone.trim()}@chatfi.pro`, callbackUrl }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAuthorizationUrl(data.authorizationUrl);
      } else {
        const res = await fetch(`/api/charge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, productId: selectedProduct.id, quantity, buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), buyerAddress: fullAddress, buyerEmail: email.trim() || null }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPaymentLink(data.paymentLink);
      }
    } catch (e: any) { setError(e.message || 'Failed to create payment'); }
    finally { setBuying(false); }
  };

  return (
    <div id="store-scroll" style={{ backgroundColor: C.bg, minHeight: '100vh', height: '100vh', overflowY: 'auto', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <style>{FONTS}</style>

      {/* ── Sticky nav ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${scrolled ? C.divider : 'transparent'}`,
        transition: 'background 220ms ease, border-color 220ms ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: scrolled ? 1 : 0, transform: scrolled ? 'translateY(0)' : 'translateY(-4px)', transition: 'opacity 200ms ease, transform 200ms ease' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>
            {initial}
          </div>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.04em', color: C.bone, margin: 0 }}>{store.name.toUpperCase()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button aria-label="Search" onClick={() => { const el = document.getElementById('store-search'); if (el) { el.scrollIntoView({ behavior: 'smooth' }); el.focus(); } }} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bone, background: scrolled ? 'transparent' : 'rgba(255,255,255,0.55)', backdropFilter: scrolled ? 'none' : 'blur(4px)' }}>
            <IconSearch />
          </button>
          <button aria-label="Account" onClick={() => setAccountOpen(true)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bone, background: scrolled ? 'transparent' : 'rgba(255,255,255,0.55)', backdropFilter: scrolled ? 'none' : 'blur(4px)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button onClick={() => setCartOpen(true)} aria-label="Cart" style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bone, background: scrolled ? 'transparent' : 'rgba(255,255,255,0.55)', backdropFilter: scrolled ? 'none' : 'blur(4px)' }}>
            <IconBag size={18} color={C.bone} />
            {itemCount > 0 && <span style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, borderRadius: '50%', background: C.signal, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>}
          </button>
        </div>
      </header>

      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} username={username} accent={primary} />

      {/* ── Hero gradient banner ── */}
      <div style={{
        position: 'relative', width: '100%', height: 190, overflow: 'visible',
        background: `radial-gradient(120% 100% at 0% 0%, ${hexToRgba(primary, 0.22)}, transparent 55%), radial-gradient(110% 90% at 100% 0%, rgba(31,174,99,0.12), transparent 50%), linear-gradient(165deg, #FBEEE6, ${C.ink} 75%)`,
      }}>
        <p style={{ position: 'absolute', right: -8, top: -24, userSelect: 'none', pointerEvents: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 168, lineHeight: 1, color: 'rgba(17,17,20,0.05)', letterSpacing: '-0.02em', margin: 0 }}>
          {initial}{initial}
        </p>
      </div>

      {/* ── Store identity — logo lifts out of banner ── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -36, marginBottom: 14, position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          {store.logo ? (
            <img src={store.logo} alt="" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', flexShrink: 0, border: `3px solid ${C.ink}`, boxShadow: `0 0 0 2px ${hexToRgba(primary, 0.5)}, 0 2px 14px rgba(0,0,0,0.1)` }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: 16, flexShrink: 0, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: primary, fontWeight: 800, border: `3px solid ${C.ink}`, boxShadow: `0 0 0 2px ${hexToRgba(primary, 0.5)}, 0 2px 14px rgba(0,0,0,0.1)` }}>
              {initial}
            </div>
          )}
          {/* Name + badge + category */}
          <div style={{ paddingBottom: 4, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: '0.02em', color: C.bone, margin: 0, lineHeight: 1 }}>{store.name}</h1>
              <BadgeCheck />
            </div>
            {store.category && (
              <span style={{ display: 'inline-block', background: C.surfaceSoft, color: C.bone, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em', width: 'fit-content', border: `1px solid ${C.divider}` }}>
                {store.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {store.description && (
          <p style={{ color: C.mute, fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>{store.description}</p>
        )}

        {/* Trust signals */}
        <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.divider}`, background: C.surface, marginBottom: 16 }}>
          {[
            { icon: <IconStar />, value: avgRating > 0 ? avgRating.toFixed(1) : '—', label: 'Rating' },
            { icon: <IconClock />, value: '<1hr', label: 'Replies' },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '12px 0', borderLeft: i > 0 ? `1px solid ${C.divider}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {s.icon}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: C.bone }}>{s.value}</span>
              </div>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.mute }}>{s.label}</span>
            </div>
          ))}
        </div>


        {/* Tap to rate */}
        {!ratingSubmitted && (
          <button onClick={openRatingModal} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', background: C.surface, borderRadius: 10, border: `1px solid ${C.divider}`, cursor: 'pointer', width: '100%' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFC24D" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.mute }}>Rate this store · {ratingCount} ratings</span>
          </button>
        )}
        {ratingSubmitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', background: C.mintSoft, borderRadius: 10, border: `1px solid ${C.divider}` }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill={s <= userRating ? '#FFC24D' : 'none'} stroke="#FFC24D" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.mint }}>Thanks for rating!</span>
          </div>
        )}

        {/* Products header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.04em', color: C.bone, margin: 0 }}>PRODUCTS</h2>
          <span style={{ color: C.mute, fontSize: 12 }}>{store.products.length} item{store.products.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Product grid */}
        {store.products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 56, color: '#999', backgroundColor: C.ink, borderRadius: 16, border: `1px solid ${C.divider}` }}>No products yet</div>
        ) : (
          <div className="product-grid" style={{ paddingBottom: 120 }}>
            {store.products.map(product => {
              const soldOut = product.stock === 0;
              const showImg = product.image && !imgErrors[product.id];
              const qty = cart[product.id] || 0;
              return (
                <div key={product.id} className="pcard" style={{ backgroundColor: C.ink, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.divider}` }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#f4f4f4', overflow: 'hidden' }}>
                    {showImg ? (
                      <img src={product.image} alt={product.name} onError={() => setImgErrors(prev => ({ ...prev, [product.id]: true }))} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconImageOff /></div>
                    )}
                    <div style={{ position: 'absolute', top: 8, left: 8 }}><StockBadge stock={product.stock} /></div>
                    {soldOut && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.55)' }} />}
                  </div>
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <h3 style={{ color: C.bone, fontSize: 14, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                      {product.description && <p style={{ color: C.mute, fontSize: 12, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</p>}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone, fontWeight: 700, fontSize: 15 }}>₦{product.price.toLocaleString()}</span>
                    {soldOut ? (
                      <button disabled style={{ width: '100%', padding: '9px', background: '#EFEDE7', color: '#76777E', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'not-allowed' }}>Unavailable</button>
                    ) : qty > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surfaceSoft, borderRadius: 8, overflow: 'hidden' }}>
                        <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', color: C.bone, display: 'flex' }}><IconMinus /></button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.bone }}>{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', color: C.bone, display: 'flex' }}><IconPlus /></button>
                      </div>
                    ) : (
                      <button onClick={() => setQty(product.id, 1)} style={{ width: '100%', padding: '9px', background: C.signal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <IconBag size={13} color="#fff" /> Add to cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Floating cart bar ── */}
      {itemCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${C.divider}`, zIndex: 30 }}>
          <button onClick={() => setCartOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: C.signal, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, color: '#fff' }}>{itemCount}</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>₦{subtotal.toLocaleString()}</span>
            </span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>View Cart →</span>
          </button>
        </div>
      )}

      {/* ── WhatsApp FAB ── */}
      {store.contact?.whatsapp && (
        <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ position: 'fixed', right: 16, bottom: itemCount > 0 ? 88 : 20, width: 52, height: 52, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(31,174,99,0.4)', transition: 'bottom 200ms ease', textDecoration: 'none', zIndex: 29 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.mint, animation: 'pulseRing 2.2s ease-out infinite' }} />
          <IconChat size={22} />
        </a>
      )}

      {/* ── Cart sheet ── */}
      {cartOpen && (
        <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: cartVisible ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)', transition: 'background 0.28s ease', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: C.ink, borderRadius: '20px 20px 0 0', maxHeight: '82vh', overflowY: 'auto', transform: cartVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s ease', paddingBottom: 32 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.divider, margin: '10px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.04em', color: C.bone, margin: 0 }}>YOUR CART</p>
              <button onClick={closeCart} style={{ background: C.surfaceSoft, border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.bone }}><IconClose /></button>
            </div>
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.surface, borderRadius: 12, border: `1px solid ${C.divider}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f0f0f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.image && !imgErrors[product.id] ? (
                      <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <IconImageOff size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: C.bone, fontSize: 13, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone, fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>₦{(product.price * qty).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surfaceSoft, borderRadius: 8, padding: '4px 8px' }}>
                    <button onClick={() => setQty(product.id, qty - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.bone, display: 'flex', padding: 2 }}><IconMinus /></button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.bone, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.bone, display: 'flex', padding: 2 }}><IconPlus /></button>
                  </div>
                  <button onClick={() => setQty(product.id, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, display: 'flex', padding: 4 }}><IconTrash /></button>
                </div>
              ))}
            </div>
            <div style={{ margin: '16px 20px 0', padding: 16, background: C.surface, borderRadius: 12, border: `1px solid ${C.divider}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.mute, fontSize: 13 }}>Subtotal</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone, fontSize: 13, fontWeight: 600 }}>₦{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.mute, fontSize: 13 }}>Delivery fee</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone, fontSize: 13, fontWeight: 600 }}>₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div style={{ height: 1, background: C.divider }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.bone, fontSize: 14, fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.bone, fontSize: 16, fontWeight: 700 }}>₦{total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cartItems.map(({ product }) => (
                <button key={product.id} onClick={() => openCheckout(product)} style={{ width: '100%', padding: '13px', background: C.signal, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <IconBag size={14} color="#fff" /> Checkout {product.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.divider}`, background: C.surface, padding: '28px 16px 40px', marginTop: 32 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {store.logo ? (
              <img src={store.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: primary }}>{initial}</div>
            )}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: C.bone, letterSpacing: '0.03em' }}>{store.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {store.contact?.whatsapp && (
              <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.ink, color: C.bone, padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.divider}` }}>
                <IconChat size={14} /> WhatsApp
              </a>
            )}
            {store.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.ink, color: C.bone, padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.divider}` }}>
                <IconMail size={14} /> Email
              </a>
            )}
            {store.contact?.twitter && (
              <a href={`https://twitter.com/${store.contact.twitter.replace('@', '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.ink, color: C.bone, padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.divider}` }}>
                <IconX size={14} /> {store.contact.twitter}
              </a>
            )}
          </div>
          <p style={{ color: C.mute, fontSize: 12, margin: 0 }}>Powered by <a href="https://chatfi.pro" style={{ color: primary, textDecoration: 'none', fontWeight: 600 }}>ChatFi</a></p>
        </div>
      </footer>

      {/* ── Checkout sheet ── */}
      {selectedProduct && (
        <div onClick={closeSheet} style={{ position: 'fixed', inset: 0, backgroundColor: sheetVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)', transition: 'background-color 0.28s ease', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '88vh', overflowY: 'auto', transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s ease', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginTop: 10, marginBottom: 4 }} />
            <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 14, background: '#f4f4f4', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}><IconClose size={16} /></button>
            {(paymentLink || authorizationUrl) ? (
              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ color: '#111', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Payment Ready</h3>
                <p style={{ color: '#777', fontSize: 13, margin: '0 0 16px' }}>Tap below to complete your payment via ChatFi Pay</p>
                <a href={authorizationUrl || paymentLink} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '14px', backgroundColor: C.signal, color: '#fff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' }}>
                  <IconBag size={14} /> Pay ₦{checkoutTotal.toLocaleString()}
                </a>
                <button onClick={closeSheet} style={{ width: '100%', marginTop: 8, padding: '12px', backgroundColor: 'transparent', color: '#777', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, paddingRight: 36 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 10, backgroundColor: '#f4f4f4', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedProduct.image && !imgErrors[selectedProduct.id] ? (
                      <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <IconImageOff size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: '#111', fontSize: 15, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProduct.name}</h3>
                    <span style={{ color: '#111', fontSize: 14, fontWeight: 700 }}>₦{selectedProduct.price.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: '8px 12px', marginBottom: 18 }}>
                  <span style={{ color: '#555', fontSize: 13, fontWeight: 600 }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', color: quantity <= 1 ? '#ccc' : '#111' }}><IconMinus size={14} /></button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111', minWidth: 18, textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer', color: quantity >= maxQty ? '#ccc' : '#111' }}><IconPlus size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                  <input className="sheet-field" placeholder="Full name" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                  <input className="sheet-field" placeholder="Phone number" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
                  <button type="button" onClick={handleDetectLocation} disabled={detecting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', backgroundColor: '#fff', border: '1px dashed #ccc', borderRadius: 10, color: '#111', fontSize: 13, fontWeight: 600, cursor: detecting ? 'not-allowed' : 'pointer' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
                  <span style={{ color: '#777', fontSize: 13 }}>Total</span>
                  <span style={{ color: '#111', fontSize: 18, fontWeight: 800 }}>₦{checkoutTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button type="button" onClick={() => setPaymentMethod('naira')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: paymentMethod === 'naira' ? `2px solid ${C.signal}` : '1px solid #e5e5e5', backgroundColor: paymentMethod === 'naira' ? '#fff7f5' : '#fff', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><IconNaira size={13} /> Pay with Naira</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('usdc')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: paymentMethod === 'usdc' ? `2px solid ${C.signal}` : '1px solid #e5e5e5', backgroundColor: paymentMethod === 'usdc' ? '#fff7f5' : '#fff', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><IconCoin size={13} /> Pay with USDC</span>
                  </button>
                </div>
                <button onClick={confirmBuy} disabled={buying} style={{ width: '100%', padding: '14px', backgroundColor: C.signal, color: '#fff', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {buying ? 'Creating payment...' : <><IconBag size={14} /> Proceed to Pay</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
