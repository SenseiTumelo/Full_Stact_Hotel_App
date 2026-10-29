import { Link } from 'react-router-dom';

type Crumb = { label: string; to?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, index) => (
        <span key={item.label}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
          {index < items.length - 1 && ' / '}
        </span>
      ))}
    </nav>
  );
}