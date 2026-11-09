import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { deleteReviewRequest, fetchAdminReviews } from '../services/api';
import type { AdminReview } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useFeedback } from '../components/ui/FeedbackProvider';
import { ArrowRight, Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const { confirm, notify } = useFeedback();
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchAdminReviews({ q: search || undefined, page })
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((err) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, search, refresh]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  }

  async function handleDelete(review: AdminReview) {
    if (!await confirm({ title: 'Remove this review?', message: `The ${review.rating}-star review for ${review.hotel_name} will be permanently removed.`, confirmLabel: 'Remove review', destructive: true })) return;
    setBusyId(review.id);
    setError('');
    try {
      await deleteReviewRequest(review.id);
      notify('Review removed.');
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else setRefresh((current) => current + 1);
      setTotal((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-reviews-page">
      <div className="admin-page-intro">
        <div><p className="eyebrow">Guest experience</p><h2>Reviews</h2><p>Review guest feedback and remove content that breaks your review policy.</p></div>
        <span className="admin-count-pill">{total} total</span>
      </div>

      <form className="admin-filter-bar" onSubmit={handleSearch}>
        <div className="field"><label htmlFor="review-search">Search reviews</label><input id="review-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Guest, property or review text" /></div>
        <Button type="submit">Search</Button>
      </form>

      {error && <p role="alert" className="form-error">{error}</p>}
      {loading ? <div className="admin-panel"><p className="summary-muted">Loading reviews…</p></div> : items.length === 0 ? (
        <div className="admin-panel admin-empty"><strong>No reviews found</strong><p>Try another search or check back after guests complete their stays.</p></div>
      ) : (
        <div className="admin-review-list">
          {items.map((review) => (
            <article className="admin-review-card" key={review.id}>
              <div className="admin-review-top">
                <div><div className="admin-review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />)}</div><strong>{review.author}</strong><small>{new Date(review.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
                <Button variant="secondary" className="btn-small btn-danger" disabled={busyId === review.id} onClick={() => handleDelete(review)}>{busyId === review.id ? 'Removing…' : 'Remove review'}</Button>
              </div>
              <p className="admin-review-hotel">{review.hotel_name}</p>
              <p className="admin-review-comment">{review.comment || 'No written comment.'}</p>
              <Link to={`/admin/reservations/${review.booking_id}`} className="admin-text-link">View reservation <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && <div className="pagination"><Button variant="secondary" className="btn-small" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span aria-live="polite">Page {page} of {totalPages}</span><Button variant="secondary" className="btn-small" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
    </section>
  );
}
