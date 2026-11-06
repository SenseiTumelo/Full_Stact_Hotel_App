import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotelById } from '../store/slices/hotelsSlice';
import { createHotelRequest, fetchAmenities, updateHotelRequest } from '../services/api';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import HotelForm from '../components/admin/HotelForm';
import PhotoManager from '../components/admin/PhotoManager';
import RoomManager from '../components/admin/RoomManager';
import Text from '../components/ui/Text';
import type { Amenity, HotelInput } from '../types/hotel';

export default function AdminHotelEditPage() {
  const { id } = useParams<{ id: string }>(); // undefined on the "new" page
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { selected: hotel, selectedStatus } = useAppSelector((state) => state.hotels);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [saved, setSaved] = useState('');

  const justCreated = Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);

  useEffect(() => {
    fetchAmenities().then(setAmenities).catch(() => setAmenities([]));
  }, []);

  useEffect(() => {
    if (id) dispatch(loadHotelById(id));
  }, [id, dispatch]);

  const refresh = () => {
    if (id) dispatch(loadHotelById(id));
  };

  async function handleCreate(values: HotelInput) {
    const created = await createHotelRequest(values);
    navigate(`/admin/hotels/${created.id}`, { state: { justCreated: true } });
  }

  async function handleUpdate(values: HotelInput) {
    if (!id) return;
    await updateHotelRequest(id, values);
    setSaved('Changes saved.');
    refresh();
  }

  // ----- New hotel -----
  if (!id) {
    return (
      <section>
        <Breadcrumbs items={[{ label: 'Admin', to: '/admin/hotels' }, { label: 'New hotel' }]} />
        <h2 className="section-title">Add a hotel</h2>
        <HotelForm amenities={amenities} submitLabel="Create hotel" onSubmit={handleCreate} />
        <p className="summary-muted">You can add photos and room types right after the hotel is created.</p>
      </section>
    );
  }

  // ----- Edit hotel -----
  if (selectedStatus === 'failed') {
    return (
      <section>
        <Text variant="heading">Hotel not found</Text>
        <p><Link to="/admin/hotels">Back to hotels</Link></p>
      </section>
    );
  }
  if (!hotel || hotel.id !== id) return <Text>Loading...</Text>;

  return (
    <section>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin/hotels' }, { label: hotel.name }]} />
      <h2 className="section-title">{hotel.name}</h2>

      {justCreated && !saved && (
        <p role="status" className="success-note">Hotel created. Now add photos and room types below.</p>
      )}
      {saved && <p role="status" className="success-note">{saved}</p>}

      <HotelForm
        key={hotel.id}
        initial={hotel}
        amenities={amenities}
        submitLabel="Save changes"
        onSubmit={handleUpdate}
      />
      <PhotoManager hotelId={hotel.id} images={hotel.images} onChanged={refresh} />
      <RoomManager hotelId={hotel.id} rooms={hotel.room_types} onChanged={refresh} />
    </section>
  );
}