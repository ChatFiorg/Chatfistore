export default function NotFound() {
  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#e6edf3', fontSize: 48, fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ color: '#7d8590', fontSize: 16, marginTop: 8 }}>Store not found</p>
      <a href="https://chatfi.pro" style={{ color: '#C7F284', fontSize: 14, marginTop: 16, textDecoration: 'none' }}>← Back to ChatFi</a>
    </div>
  );
}
