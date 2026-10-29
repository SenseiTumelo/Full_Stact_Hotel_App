import type { ReactNode } from 'react';

type HeroProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function Hero({ title, subtitle, children }: HeroProps) {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        <div className="hero-slot">{children}</div>
      </div>
    </section>
  );
}