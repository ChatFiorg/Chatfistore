'use client';
import { useState, useMemo } from 'react';
import { NIGERIA_STATES } from '@/lib/nigeria-states';

const BASE_URL = 'https://pay.chatfi.pro/api';
const STATE_NAMES = Object.keys(NIGERIA_STATES);

interface Product { id: string; name: string; description: string; price: number; image: string; stock: number | null; active: boolean; }
interface Store { username: string; name: string; description: string; logo: string; banner: string; category: string; theme: { primary: string; bg: string }; contact: { whatsapp?: string; phone?: string; email?: string; twitter?: string }; products: Product[]; }
interface CartItem { product: Product; qty: number; }

const naira = (n: number) => `₦${Number(n).toLocaleString('en-NG')}`;

function IconWhatsApp() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>; }
function IconCart({ size = 22 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>; }
function IconSearch({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconClose({ size = 18 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconHome({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconTag({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function IconUser({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IconPin({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function IconPhone({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function IconMail({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function IconMinus({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconPlus({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconMap({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }

export default function ComboTemplate({ store, username }: { store: Store; username: string }) {
  const primary = store.theme?.primary || '#E53E3E';
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'instock' | 'low'>('all');
  const [modal, setModal] = useState<'cart' | 'delivery' | 'success' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModal, setProductModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', state: '', lga: '', street: '', house: '', email: '' });
  const [paying, setPaying] = useState(false);
  const [payLink, setPayLink] = useState('');
  const [error, setError] = useState('');
  const [detecting, setDetecting] = useState(false);

  const cartItems: CartItem[] = useMemo(() =>
    store.products.filter(p => (cart[p.id] || 0) > 0).map(p => ({ product: p, qty: cart[p.id] })),
    [cart, store.products]);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  const setQty = (id: string, qty: number) => setCart(c => qty <= 0 ? { ...c, [id]: 0 } : { ...c, [id]: qty });

  const filtered = store.products.filter(p => {
    if (!p.active) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'instock' && p.stock === 0) return false;
    if (filter === 'low' && !(p.stock !== null && p.stock !== undefined && p.stock > 0 && p.stock <= 3)) return false;
    return true;
  });

  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const data = await res.json();
        const addr = data.address;
        setForm(f => ({ ...f, street: addr.road || addr.suburb || '', state: addr.state || '', lga: addr.county || addr.city || '' }));
      } catch {}
      setDetecting(false);
    }, () => setDetecting(false));
  };

  const checkout = async () => {
    if (!form.name || !form.phone || !form.state || !form.lga || !form.street) {
      setError('Please fill in your name, phone, state, LGA, and street address');
      return;
    }
    setPaying(true); setError('');
    const fullAddress = [form.house, form.street, form.lga, form.state].filter(Boolean).join(', ');
    try {
      const res = await fetch(`${BASE_URL}/store/${username}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(({ product, qty }) => ({ productId: product.id, quantity: qty })),
          buyerName: form.name,
          buyerPhone: form.phone,
          buyerAddress: fullAddress,
          buyerEmail: form.email || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPayLink(data.paymentLink);
      setModal('success');
    } catch (e: any) {
      setError(e.message || 'Failed to create payment');
    } finally { setPaying(false); }
  };

  const lgas = form.state ? (NIGERIA_STATES as any)[form.state] || [] : [];

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100dvh', paddingBottom: 72, fontFamily: 'Inter, system-ui, sans-serif', color: '#111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { font-family: inherit; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .pcard:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); transition: all 0.2s; }
      `}</style>

      {/* HEADER */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo */}
          <a href={`/store/${username}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            {store.logo ? (
              <img src={store.logo} alt="logo" style={{ height: 44, width: 44, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ height: 44, width: 44, borderRadius: 8, backgroundColor: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
                {store.name?.[0] || 'S'}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111', lineHeight: 1.2 }}>{store.name}</div>
              {store.category && <div style={{ fontSize: 11, color: primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{store.category}</div>}
            </div>
          </a>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: 220, display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: '0 10px', border: '1px solid #e5e5e5', gap: 6 }}>
            <IconSearch size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: 13, padding: '9px 0', color: '#111' }} />
          </div>
          {/* Cart */}
          <button onClick={() => setModal('cart')} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, backgroundColor: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
            <IconCart size={18} />
            <span style={{ display: 'none' }}>Cart</span>
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff', color: primary, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>
            )}
          </button>
        </div>

        {/* Category nav */}
        <div style={{ borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 0, overflowX: 'auto' }}>
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'instock' as const, label: 'In Stock' },
              { key: 'low' as const, label: 'Low Stock' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)} style={{ padding: '10px 16px', border: 'none', backgroundColor: 'transparent', fontSize: 13, fontWeight: 600, color: filter === key ? '#111' : '#555', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: filter === key ? `2px solid ${primary}` : '2px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>

        {/* BANNER */}
        {store.banner && (
          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20, height: 180 }}>
            <img src={store.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* STORE INFO ROW */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, backgroundColor: '#fff', borderRadius: 10, padding: 14, border: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Contact Us</div>
            {store.contact?.whatsapp && (
              <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#25D366', textDecoration: 'none', fontSize: 13 }}>
                <IconWhatsApp /> {store.contact.whatsapp}
              </a>
            )}
            {store.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', textDecoration: 'none', fontSize: 13 }}>
                <IconMail /> {store.contact.email}
              </a>
            )}
            {store.contact?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 13 }}>
                <IconPhone /> {(store.contact as any).phone}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200, backgroundColor: '#fff', borderRadius: 10, padding: 14, border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6 }}>About</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{store.description || `Welcome to ${store.name}`}</div>
          </div>
        </div>

        {/* PRODUCTS HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            {search ? `Results for "${search}"` : 'All Products'}
            <span style={{ fontSize: 13, fontWeight: 400, color: '#888', marginLeft: 8 }}>({filtered.length} items)</span>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#888', backgroundColor: '#fff', borderRadius: 10 }}>No products found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map(product => {
              const qty = cart[product.id] || 0;
              const soldOut = product.stock === 0;
              const lowStock = product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= 3;
              return (
                <div key={product.id} className="pcard" style={{ backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e5e5', cursor: 'pointer' }} onClick={() => { setSelectedProduct(product); setProductModal(true); }}>
                  <div style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 32 }}>
                        <IconCart size={32} />
                      </div>
                    )}
                    {soldOut && <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#666', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Sold Out</div>}
                    {lowStock && !soldOut && <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#ff4d2e', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{product.stock} left</div>}
                    {qty > 0 && <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', backgroundColor: primary, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</div>}
                  </div>
                  <div style={{ padding: '10px 10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
                    {product.description && <div style={{ fontSize: 11, color: '#888', marginBottom: 6, lineHeight: 1.4 }}>{product.description}</div>}
                    <div style={{ fontSize: 15, fontWeight: 800, color: primary, marginBottom: 8 }}>{naira(product.price)}</div>
                    {soldOut ? (
                      <div style={{ width: '100%', padding: '6px', backgroundColor: '#f0f0f0', color: '#888', textAlign: 'center', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Unavailable</div>
                    ) : qty > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${primary}`, borderRadius: 6, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: 'none', color: primary, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: 'none', color: primary, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setQty(product.id, 1); }} style={{ width: '100%', padding: '7px', backgroundColor: primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div style={{ marginTop: 40, padding: '24px 0', borderTop: '1px solid #e5e5e5', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{store.name}</div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{store.description}</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Contact</div>
            {store.contact?.whatsapp && <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{store.contact.whatsapp}</div>}
            {store.contact?.email && <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{store.contact.email}</div>}
          </div>
          <div style={{ width: '100%', textAlign: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#888' }}>
            Powered by <span style={{ color: primary, fontWeight: 700 }}>ChatFi</span>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', display: 'flex', zIndex: 20, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: <IconHome />, label: 'Home', action: () => {} },
          { icon: <IconTag />, label: 'Products', action: () => {} },
          { icon: <IconCart />, label: `Cart${itemCount > 0 ? ` (${itemCount})` : ''}`, action: () => setModal('cart') },
        ].map(({ icon, label, action }) => (
          <button key={label} onClick={action} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: label.startsWith('Cart') && itemCount > 0 ? primary : '#888', fontSize: 10, fontWeight: 600 }}>
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* PRODUCT MODAL */}
      {productModal && selectedProduct && (
        <div onClick={() => setProductModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'flex', alignItems: 'flex-end', animation: 'fadeIn 0.2s' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.3s', paddingBottom: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#ddd' }} />
            </div>
            {selectedProduct.image && <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 }}>{selectedProduct.name}</div>
              {selectedProduct.description && <div style={{ fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 1.6 }}>{selectedProduct.description}</div>}
              <div style={{ fontSize: 22, fontWeight: 800, color: primary, marginBottom: 16 }}>{naira(selectedProduct.price)}</div>
              {selectedProduct.stock !== null && (
                <div style={{ fontSize: 12, color: selectedProduct.stock > 3 ? '#1FAE63' : '#ff4d2e', marginBottom: 12, fontWeight: 600 }}>
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                </div>
              )}
              {(cart[selectedProduct.id] || 0) > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: `2px solid ${primary}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                  <button onClick={() => setQty(selectedProduct.id, (cart[selectedProduct.id] || 0) - 1)} style={{ padding: '12px 20px', backgroundColor: 'transparent', border: 'none', color: primary, cursor: 'pointer', fontWeight: 700, fontSize: 20 }}>−</button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>{cart[selectedProduct.id]}</span>
                  <button onClick={() => setQty(selectedProduct.id, (cart[selectedProduct.id] || 0) + 1)} style={{ padding: '12px 20px', backgroundColor: 'transparent', border: 'none', color: primary, cursor: 'pointer', fontWeight: 700, fontSize: 20 }}>+</button>
                </div>
              ) : (
                <button onClick={() => { setQty(selectedProduct.id, 1); setProductModal(false); }} style={{ width: '100%', padding: '14px', backgroundColor: primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
                  Add to Cart
                </button>
              )}
              {(cart[selectedProduct.id] || 0) > 0 && (
                <button onClick={() => { setProductModal(false); setModal('cart'); }} style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: primary, border: `2px solid ${primary}`, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  View Cart ({itemCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART / DELIVERY / SUCCESS MODALS */}
      {modal && (
        <div onClick={() => { if (!paying) setModal(null); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, animation: 'fadeIn 0.2s', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '92vh', overflow: 'auto', animation: 'slideUp 0.3s', paddingBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#ddd' }} />
            </div>

            {modal === 'cart' && (
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Shopping Cart ({itemCount})</div>
                  <button onClick={() => setModal(null)} style={{ backgroundColor: '#f5f5f5', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconClose size={16} /></button>
                </div>
                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Your cart is empty</div>
                ) : (
                  <>
                    {cartItems.map(({ product, qty }) => (
                      <div key={product.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                        {product.image ? <img src={product.image} alt={product.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#f5f5f5', flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: primary }}>{naira(product.price)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden', height: 34, flexShrink: 0 }}>
                          <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '0 10px', height: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#555', fontWeight: 700, fontSize: 16 }}>−</button>
                          <span style={{ padding: '0 4px', fontSize: 13, fontWeight: 700 }}>{qty}</span>
                          <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '0 10px', height: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#555', fontWeight: 700, fontSize: 16 }}>+</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#888', fontSize: 13 }}>Subtotal</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{naira(subtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#888', fontSize: 13 }}>Delivery</span>
                        <span style={{ color: '#888', fontSize: 13 }}>Calculated next</span>
                      </div>
                    </div>
                    <button onClick={() => setModal('delivery')} style={{ width: '100%', marginTop: 14, padding: '15px', backgroundColor: primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                      Proceed to Checkout →
                    </button>
                  </>
                )}
              </div>
            )}

            {modal === 'delivery' && (
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setModal('cart')} style={{ backgroundColor: '#f5f5f5', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>← Back</button>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Delivery Details</div>
                </div>

                {[
                  { key: 'name', placeholder: 'Full name *', type: 'text' },
                  { key: 'phone', placeholder: 'Phone number *', type: 'tel' },
                ].map(f => (
                  <input key={f.key} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type} style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 10, color: '#111', outline: 'none' }} />
                ))}

                <button onClick={detectLocation} disabled={detecting} style={{ width: '100%', padding: '11px', backgroundColor: '#f0f0f0', color: '#555', border: '1px dashed #ccc', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <IconPin size={14} /> {detecting ? 'Detecting...' : 'Use my location'}
                </button>

                <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value, lga: '' }))} style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 10, color: form.state ? '#111' : '#888', outline: 'none' }}>
                  <option value="">Select State</option>
                  {STATE_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {lgas.length > 0 && (
                  <select value={form.lga} onChange={e => setForm(p => ({ ...p, lga: e.target.value }))} style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 10, color: form.lga ? '#111' : '#888', outline: 'none' }}>
                    <option value="">Select LGA</option>
                    {lgas.map((l: string) => <option key={l} value={l}>{l}</option>)}
                  </select>
                )}

                <input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} placeholder="Street address *" style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 10, color: '#111', outline: 'none' }} />
                <input value={form.house} onChange={e => setForm(p => ({ ...p, house: e.target.value }))} placeholder="House No. (optional)" style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 10, color: '#111', outline: 'none' }} />
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email (optional)" type="email" style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, marginBottom: 10, color: '#111', outline: 'none' }} />

                <div style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  {cartItems.map(({ product, qty }) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#666', fontSize: 13 }}>{product.name} × {qty}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{naira(product.price * qty)}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, backgroundColor: '#e5e5e5', margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 700, color: primary, fontSize: 16 }}>{naira(subtotal)}</span>
                  </div>
                </div>

                {error && <p style={{ color: '#E53E3E', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</p>}

                <button onClick={checkout} disabled={paying} style={{ width: '100%', padding: '15px', backgroundColor: primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
                  {paying ? 'Creating payment...' : `Pay ${naira(subtotal)}`}
                </button>
              </div>
            )}

            {modal === 'success' && (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid #1FAE63' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1FAE63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Order Placed!</div>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Complete your payment via ChatFi Pay. Your order will be processed once payment is confirmed.</p>
                <a href={payLink} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', backgroundColor: primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', marginBottom: 10 }}>
                  Complete Payment →
                </a>
                <button onClick={() => { setModal(null); setCart({}); setForm({ name: '', phone: '', state: '', lga: '', street: '', house: '', email: '' }); }} style={{ width: '100%', padding: '13px', backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Back to Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
