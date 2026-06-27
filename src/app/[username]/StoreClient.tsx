'use client';
import { useState, useEffect } from 'react';
import { NIGERIA_STATES } from '@/lib/nigeria-states';

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

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconMinus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function StoreClient({ store, username }: { store: Store; username: string }) {
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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const primary = store.theme?.primary || '#C7F284';
  const tint = hexToRgba(primary, 0.14);

  useEffect(() => {
    if (selectedProduct) {
      const id = requestAnimationFrame(() => setSheetVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [selectedProduct]);

  const handleBuy = (product: Product) => {
    setQuantity(1);
    setBuyerName('');
    setBuyerPhone('');
    setAddrState('');
    setAddrLga('');
    setStreet('');
    setHouseNo('');
    setEmail('');
    setPaymentLink('');
    setError('');
    setLocationError('');
    setSelectedProduct(product);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setTimeout(() => setSelectedProduct(null), 280);
  };

  const maxQty = selectedProduct?.stock ?? Infinity;
  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location not supported on this browser');
      return;
    }
    setDetecting(true);
    setLocationError('');
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
        } catch {
          setLocationError('Could not detect address — please fill manually');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setLocationError('Location permission denied — please fill manually');
        setDetecting(false);
      }
    );
  };

  const confirmBuy = async () => {
    if (!selectedProduct) return;
    if (!buyerName.trim() || !buyerPhone.trim() || !addrState || !addrLga || !street.trim()) {
      setError('Please fill in your name, phone, state, LGA, and street address');
      return;
    }
    setBuying(true);
    setError('');
    const fullAddress = [houseNo.trim(), street.trim(), addrLga, addrState].filter(Boolean).join(', ');
    try {
      const res = await fetch(`${BASE_URL}/store/${username}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          buyerAddress: fullAddress,
          buyerEmail: email.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPaymentLink(data.paymentLink);
    } catch (e: any) {
      setError(e.message || 'Failed to create payment');
    } finally {
      setBuying(false);
    }
  };

  const lgaOptions = addrState ? NIGERIA_STATES[addrState] || [] : [];

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
        .sheet-field { width: 100%; padding: 12px; background-color: #fafafa; color: #111; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 14px; box-sizing: border-box; font-family: inherit; }
        .sheet-field:focus { outline: none; border-color: #111; }
        select.sheet-field { appearance: none; -webkit-appearance: none; }
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
        <div
          onClick={closeSheet}
          style={{ position: 'fixed', inset: 0, backgroundColor: sheetVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)', transition: 'background-color 0.28s ease', zIndex: 50 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0,
              backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
              maxHeight: '88vh', overflowY: 'auto',
              transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.28s ease',
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginTop: 10, marginBottom: 4 }} />

            <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 14, background: '#f4f4f4', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}>
              <IconClose size={16} />
            </button>

            {paymentLink ? (
              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ color: '#111', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Payment Ready</h3>
                <p style={{ color: '#777', fontSize: 13, margin: '0 0 16px' }}>Tap below to complete your payment via ChatFi Pay</p>
                <a href={paymentLink} target="_blank"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '14px', backgroundColor: '#111', color: '#fff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' }}>
                  <IconBag size={14} /> Pay ₦{total.toLocaleString()}
                </a>
                <button onClick={closeSheet}
                  style={{ width: '100%', marginTop: 8, padding: '12px', backgroundColor: 'transparent', color: '#777', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Close
                </button>
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
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', color: quantity <= 1 ? '#ccc' : '#111' }}>
                      <IconMinus size={14} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111', minWidth: 18, textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer', color: quantity >= maxQty ? '#ccc' : '#111' }}>
                      <IconPlus size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                  <input className="sheet-field" placeholder="Full name" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                  <input className="sheet-field" placeholder="Phone number" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', backgroundColor: '#fff', border: '1px dashed #ccc', borderRadius: 10, color: '#111', fontSize: 13, fontWeight: 600, cursor: detecting ? 'not-allowed' : 'pointer' }}
                  >
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
                  <span style={{ color: '#111', fontSize: 18, fontWeight: 800 }}>₦{total.toLocaleString()}</span>
                </div>

                <button onClick={confirmBuy} disabled={buying}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#111', color: '#fff', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
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
