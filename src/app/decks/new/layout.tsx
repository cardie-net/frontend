import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Deck',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
