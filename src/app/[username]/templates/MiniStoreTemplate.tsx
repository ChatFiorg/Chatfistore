'use client';
import { useState, useMemo } from 'react';
import AccountSheet from '@/components/AccountSheet';

const BASE_URL = 'https://pay.chatfi.pro/api';

interface Product { id: string; name: string; description: string; price: number; image: string; stock: number | null; active: boolean; }
interface Store { username: string; name: string; description: string; logo: string; banner: string; category: string; theme: { primary: string; bg: string }; contact: { whatsapp?: string; email?: string; twitter?: string }; products: Product[]; }
interface CartItem { product: Product; qty: number; }

const naira = (n: number) => '₦' + Number(n).toLocaleString('en-NG');

export default function Template4_MiniStore({ store, username }: { store: Store; username: string }) {
  const accent = store.theme?.primary || '#C7F284';
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [sheet, setSheet] = useState<'cart' | 'search' | 'msg' | 'delivery' | 'success' | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', state: '' });
  const [paying, setPaying] = useState(false);
  const [payLink, setPayLink] = useState('');
  const [error, setError] = useState('');

  const cartItems: CartItem[] = useMemo(() =>
    store.products.filter(p => (cart[p.id] || 0) > 0).map(p => ({ product: p, qty: cart[p.id] })),
    [cart, store.products]);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  const setQty = (id: string, qty: number) => setCart(c => qty <= 0 ? { ...c, [id]: 0 } : { ...c, [id]: qty });

  const addToCart = (id: string) => {
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
    showToast('Added to cart ✓');
  };

  let toastTimer: any;
  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToast(''), 2000);
  };

  const filtered = store.products.filter(p => p.active && (!search || p.name.toLowerCase().includes(search.toLowerCase())));

  const checkout = async () => {
    if (!form.name || !form.phone || !form.address) { setError('Please fill all required fields'); return; }
    setPaying(true); setError('');
    try {
      const links: string[] = [];
      for (const item of cartItems) {
        for (let i = 0; i < item.qty; i++) {
          const res = await fetch(`${BASE_URL}/store/${username}/charge`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.product.id,
              buyerName: form.name,
              buyerPhone: form.phone,
              buyerDelivery: `${form.address}${form.state ? ', ' + form.state : ''}`,
            }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          links.push(data.paymentLink);
        }
      }
      setPayLink(links[0]); setSheet('success');
    } catch (e: any) { setError(e.message || 'Failed'); } finally { setPaying(false); }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f4f4f4', color: '#111', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: 'DM Sans', sans-serif; }
        .p-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); transform: translateY(-1px); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#fff', borderBottom: '1px solid #ebebeb', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#0a0a0a', flexShrink: 0 }}>
          {store.logo ? <img src={store.logo} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} /> : store.name?.[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.name}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>store.chatfi.pro/{username}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setSheet('search')} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#f5f5f5', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button aria-label="Account" onClick={() => setAccountOpen(true)} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#f5f5f5', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button onClick={() => setSheet('cart')} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#f5f5f5', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {itemCount > 0 && <span style={{ position: 'absolute', top: -3, right: -3, width: 17, height: 17, borderRadius: '50%', backgroundColor: '#0a0a0a', color: accent, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{itemCount}</span>}
          </button>
        </div>
      </div>
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} username={username} accent={accent} />

      {/* BANNER */}
      {store.banner ? (
        <div style={{ height: 160, overflow: 'hidden' }}>
          <img src={store.banner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ background: `linear-gradient(135deg, ${accent}33 0%, ${accent} 100%)`, padding: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.2 }}>{store.name}</h2>
            <p style={{ fontSize: 12, color: '#3a5a00', marginTop: 5 }}>{store.description || `Shop our collection`}</p>
          </div>
          {store.contact?.whatsapp && (
            <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ backgroundColor: '#0a0a0a', color: accent, border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Chat with us
            </a>
          )}
        </div>
      )}

      {/* CATEGORY CHIPS */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['All Products', 'In Stock', 'Low Stock'].map(cat => (
            <button key={cat} style={{ backgroundColor: cat === 'All Products' ? '#0a0a0a' : '#f5f5f5', color: cat === 'All Products' ? accent : '#666', border: cat === 'All Products' ? '1px solid #0a0a0a' : '1px solid #e5e5e5', padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: cat === 'All Products' ? 600 : 500, whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION HEAD */}
      <div style={{ padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>All Products</h3>
        <span style={{ fontSize: 12, color: '#888' }}>{filtered.length} items</span>
      </div>

      {/* PRODUCT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, padding: '0 12px 140px' }}>
        {filtered.map(product => {
          const qty = cart[product.id] || 0;
          const soldOut = product.stock === 0;
          const lowStock = product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= 3;
          return (
            <div key={product.id} className="p-card" style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.06)', transition: 'box-shadow .2s, transform .15s', border: '1px solid transparent' }}>
              <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {product.image ? <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
                {lowStock && !soldOut && <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#0a0a0a', color: accent, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Only {product.stock} left</span>}
                {soldOut && <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#666', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sold Out</span>}
              </div>
              <div style={{ padding: '10px 11px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.35 }}>{product.name}</div>
                {product.description && <div style={{ fontSize: 11, color: '#888', marginTop: 3, lineHeight: 1.4 }}>{product.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{naira(product.price)}</span>
                  {!soldOut && qty === 0 && (
                    <button onClick={() => addToCart(product.id)} style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, backgroundColor: accent, border: 'none', fontSize: 18, fontWeight: 700, color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}>+</button>
                  )}
                  {!soldOut && qty > 0 && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 0, backgroundColor: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '4px 8px', backgroundColor: 'transparent', border: 'none', color: '#111', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '4px 8px', backgroundColor: 'transparent', border: 'none', color: '#111', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, backgroundColor: '#fff', borderTop: '1px solid #ebebeb', padding: '12px 16px', display: 'flex', gap: 10, boxShadow: '0 -4px 20px rgba(0,0,0,.08)' }}>
        {store.contact?.whatsapp && (
          <a href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ flex: 1, backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', color: '#555', padding: 13, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Message
          </a>
        )}
        <button onClick={() => setSheet('cart')} style={{ flex: 2, backgroundColor: '#0a0a0a', color: accent, border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
          {itemCount > 0 ? `View Cart (${itemCount}) · ${naira(subtotal)}` : 'View Cart'}
        </button>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0a0a0a', color: accent, padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap', animation: 'toastIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      {/* OVERLAY + SHEETS */}
      {sheet && (
        <div onClick={() => !paying && setSheet(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.25s' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s cubic-bezier(.32,1,.23,1)', paddingBottom: 24 }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: '#e0e0e0', margin: '12px auto 0' }} />

            {/* CART SHEET */}
            {(sheet === 'cart' || sheet === 'delivery' || sheet === 'success') && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid #ebebeb' }}>
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{sheet === 'cart' ? `Cart (${itemCount})` : sheet === 'delivery' ? 'Delivery Details' : 'Order Placed!'}</span>
                  <button onClick={() => setSheet(null)} style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#f5f5f5', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                {sheet === 'cart' && (
                  <div style={{ padding: '0 16px' }}>
                    {cartItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                        </div>
                        <p style={{ fontSize: 14 }}>Your cart is empty.<br />Add some products to get started.</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ paddingTop: 12 }}>
                          {cartItems.map(({ product, qty }) => (
                            <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                              {product.image ? <img src={product.image} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: '#f5f5f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛍️</div>}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                                <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{naira(product.price)} each</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                                <button onClick={() => setQty(product.id, qty - 1)} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: '#555' }}>−</button>
                                <span style={{ padding: '0 6px', fontSize: 13, fontWeight: 700 }}>{qty}</span>
                                <button onClick={() => setQty(product.id, qty + 1)} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: '#555' }}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: '#888', fontSize: 13 }}>Subtotal</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{naira(subtotal)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #ebebeb', marginTop: 4 }}>
                            <span style={{ fontWeight: 700 }}>Total</span>
                            <span style={{ fontWeight: 800, fontSize: 16 }}>{naira(subtotal)}</span>
                          </div>
                        </div>
                        <button onClick={() => setSheet('delivery')} style={{ width: '100%', marginTop: 12, padding: '14px', backgroundColor: '#0a0a0a', color: accent, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                          Checkout → Pay {naira(subtotal)}
                        </button>
                        <button onClick={() => { setCart({}); }} style={{ width: '100%', marginTop: 8, padding: '12px', backgroundColor: 'transparent', color: '#aaa', border: 'none', fontSize: 13, cursor: 'pointer' }}>
                          Clear cart
                        </button>
                      </>
                    )}
                  </div>
                )}

                {sheet === 'delivery' && (
                  <div style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSheet('cart')} style={{ backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>← Back to cart</button>
                    {[
                      { key: 'name', placeholder: 'Full Name *' },
                      { key: 'phone', placeholder: 'Phone Number *' },
                      { key: 'address', placeholder: 'Delivery Address *' },
                      { key: 'state', placeholder: 'State / City' },
                    ].map(f => (
                      <input key={f.key} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                        style={{ width: '100%', padding: '13px 14px', backgroundColor: '#f9f9f9', border: '1px solid #ebebeb', borderRadius: 10, fontSize: 14, marginBottom: 10, outline: 'none', color: '#111' }} />
                    ))}
                    <div style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                      {cartItems.map(({ product, qty }) => (
                        <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#888', fontSize: 13 }}>{product.name} × {qty}</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{naira(product.price * qty)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #ebebeb', marginTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontWeight: 800, fontSize: 16 }}>{naira(subtotal)}</span>
                      </div>
                    </div>
                    {error && <p style={{ color: '#E53E3E', fontSize: 13, marginBottom: 10 }}>{error}</p>}
                    <button onClick={checkout} disabled={paying} style={{ width: '100%', padding: '14px', backgroundColor: '#0a0a0a', color: accent, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
                      {paying ? 'Creating payment...' : `Pay ${naira(subtotal)}`}
                    </button>
                  </div>
                )}

                {sheet === 'success' && (
                  <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#f0fff4', border: '2px solid #1FAE63', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1FAE63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Order Placed!</div>
                    <p style={{ color: '#666', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Complete your payment via ChatFi Pay. Your order will be confirmed once payment is received.</p>
                    <a href={payLink} target="_blank" style={{ display: 'block', padding: '14px', backgroundColor: '#0a0a0a', color: accent, textDecoration: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
                      Complete Payment →
                    </a>
                    <button onClick={() => { setSheet(null); setCart({}); setForm({ name: '', phone: '', address: '', state: '' }); }} style={{ width: '100%', padding: '12px', backgroundColor: '#f5f5f5', color: '#666', border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>
                      Back to Store
                    </button>
                  </div>
                )}
              </>
            )}

            {/* SEARCH SHEET */}
            {sheet === 'search' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid #ebebeb' }}>
                  <span style={{ fontSize: 17, fontWeight: 700 }}>Search Products</span>
                  <button onClick={() => setSheet(null)} style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#f5f5f5', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#f5f5f5', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: 14, color: '#111' }} />
                  </div>
                  {search && (
                    <div>
                      {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa', fontSize: 14 }}>No products found for "{search}"</div>
                      ) : filtered.map(p => (
                        <div key={p.id} onClick={() => { addToCart(p.id); setSheet(null); setSearch(''); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}>
                          {p.image ? <img src={p.image} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#f5f5f5', flexShrink: 0 }} />}
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{naira(p.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
