export default function Home() {
  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#C7F284', fontSize: 32, fontWeight: 700, margin: 0 }}>ChatFi Store</h1>
      <p style={{ color: '#7d8590', fontSize: 15, marginTop: 8 }}>store.chatfi.pro/yourname</p>
      <a href="https://chatfi.pro" style={{ color: '#e6edf3', fontSize: 14, marginTop: 20, textDecoration: 'none', border: '1px solid #1a1a1a', padding: '10px 20px', borderRadius: 20 }}>Open ChatFi App →</a>
    </div>
  );
}
