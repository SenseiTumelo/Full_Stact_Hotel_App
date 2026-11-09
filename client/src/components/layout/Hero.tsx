import type { ReactNode } from 'react';
import { ArrowDown, MapPin } from 'lucide-react';

type HeroProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function Hero({ title, subtitle, children }: HeroProps) {
  return (
    <section className="hero hero-home">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker"><MapPin size={14} /> Find your kind of getaway</span>
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
          <a className="hero-explore-link" href="#stays">Explore stays <ArrowDown size={15} /></a>
        </div>
        <div className="hero-slot">{children}</div>
      </div>
    </section>
  );
}
