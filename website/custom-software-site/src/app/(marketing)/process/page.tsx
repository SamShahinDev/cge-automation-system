import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Our Process | 4 Phases to Your Custom Software | Crowned Gladiator',
  description: 'Our proven 4-phase process for building custom software. From discovery to launch in 4-12 weeks. See exactly how we work.',
  openGraph: {
    title: 'Complex Problems. Simple Process. | Crowned Gladiator',
    description: 'From idea to launch in 4-12 weeks. See our proven development process.',
  },
};

export default function ProcessPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Components will be added here */}
      </main>
      <Footer />
    </>
  );
}
