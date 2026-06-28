import { notFound } from 'next/navigation';
import StoreClient from './StoreClient';
import DarkTemplate from './templates/DarkTemplate';
import ComboTemplate from './templates/ComboTemplate';

const BASE_URL = 'https://pay.chatfi.pro/api';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const res = await fetch(`${BASE_URL}/store/${username}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Store not found' };
    const store = await res.json();
    return {
      title: store.name,
      description: store.description || `Shop at ${store.name} on ChatFi Store`,
      openGraph: { title: store.name, description: store.description, images: store.banner ? [store.banner] : [] },
      icons: {
        icon: store.logo || '/favicon.ico',
        apple: store.logo || '/favicon.ico',
      },
    };
  } catch {
    return { title: 'ChatFi Store' };
  }
}

export default async function StorePage({ params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const res = await fetch(`${BASE_URL}/store/${username}`, { cache: 'no-store' });
    if (!res.ok) notFound();
    const store = await res.json();
    if (store.error) notFound();

    const template = store.template || 'clean';

    // Dark template — bold dark UI
    if (template === 'dark') return <DarkTemplate store={store} username={username} />;

    if (template === 'combo') return <ComboTemplate store={store} username={username} />;

    // Clean — light minimal (default)
    return <StoreClient store={store} username={username} />;
  } catch {
    notFound();
  }
}
