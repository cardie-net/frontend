import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Decks',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
