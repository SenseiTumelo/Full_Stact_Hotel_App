import type { ReactNode } from 'react';

type TextProps = {
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
  children: ReactNode;
};

const styles = {
  heading:    { tag: 'h1', style: { fontSize: 32, margin: 0 } },
  subheading: { tag: 'h2', style: { fontSize: 20, margin: 0 } },
  body:       { tag: 'p',  style: { fontSize: 16, margin: 0 } },
  caption:    { tag: 'p',  style: { fontSize: 13, margin: 0, color: 'var(--color-muted)' } },
} as const;

export default function Text({ variant = 'body', children }: TextProps) {
  const { tag: Tag, style } = styles[variant];
  return <Tag style={style}>{children}</Tag>;
}