import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotels } from '../store/slices/hotelsSlice';
import { deleteHotelRequest } from '../services/api';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import type { Hotel } from '../types/hotel';
import { getErrorMessage } from '../utils/errors';
import { formatPrice } from '../utils/booking';

export default function AdminHotelsPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.hotels);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(loadHotels());
  }, [dispatch]);

  async function handleDelete(hotel: Hotel) {
    if (!window.confirm(`Delete "${hotel.name}"? Its photos and rooms are deleted too.`)) return;
    setError('');
    try {
      await deleteHotelRequest(hotel.id);
      dispatch(loadHotels());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section>
      <div className="section-head">
        <h2 className="section-title" style={{ margin: 0 }}>Hotels</h2>
        <Link to="/admin/hotels/new" className="btn btn-primary">Add hotel</Link>
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}
      {status === 'loading' && items.length === 0 && <Text>Loading...</Text>}
      {status === 'succeeded' && items.length === 0 && <Text variant="caption">No hotels yet.</Text>}

      {items.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Hotel</th>
                <th scope="col">City</th>
                <th scope="col">Stars</th>
                <th scope="col">From</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((hotel) => (
                <tr key={hotel.id}>
                  <td><strong>{hotel.name}</strong></td>
                  <td>{hotel.city}</td>
                  <td>{hotel.star_rating}</td>
                  <td>{hotel.min_price ? formatPrice(hotel.min_price) : 'No rooms'}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/hotels/${hotel.id}`} className="btn btn-secondary btn-small">Edit</Link>
                      <Button variant="secondary" className="btn-small btn-danger" onClick={() => handleDelete(hotel)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}