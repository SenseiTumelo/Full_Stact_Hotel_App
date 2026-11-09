import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = { icon: LucideIcon; title: string; description: string; children?: ReactNode; compact?: boolean };

export default function EmptyState({ icon: Icon, title, description, children, compact = false }: Props) {
  return (
    <div className={`empty-state${compact ? ' empty-state-compact' : ''}`}>
      <span className="empty-state-icon"><Icon size={22} aria-hidden="true" /></span>
      <div className="empty-state-copy"><strong>{title}</strong><p>{description}</p></div>
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  );
}
