import { notFound } from 'next/navigation';
import StoreClient from './StoreClient';

const BASE_URL = 'https://pay.chatfi.pro/api';

export async function generateMetadata({ params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/store/${params.username}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Store not found' };
    const store = await res.json();
    return {
      title: store.name,
      description: store.description || `Shop at ${store.name} on ChatFi Store`,
      openGraph: { title: store.name, description: store.description, images: store.banner ? [store.banner] : [] },
    };
  } catch {
    return { title: 'ChatFi Store' };
  }
}

export default async function StorePage({ params }: { params: { username: string } }) {
  try {
    const res = await fetch(`${BASE_URL}/store/${params.username}`, { cache: 'no-store' });
    if (!res.ok) notFound();
    const store = await res.json();
    if (store.error) notFound();
    return <StoreClient store={store} username={params.username} />;
  } catch {
    notFound();
  }
}
