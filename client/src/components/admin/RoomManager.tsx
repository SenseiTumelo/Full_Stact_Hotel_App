import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import {
  createRoomTypeRequest,
  deleteRoomTypeRequest,
  updateRoomTypeRequest,
} from '../../services/api';
import type { RoomType, RoomTypeInput } from '../../types/hotel';
import { getErrorMessage } from '../../utils/errors';
import { formatPrice } from '../../utils/booking';

type RoomFormValues = {
  name: string;
  description: string;
  capacity: string;
  pricePerNight: string;
  totalRooms: string;
};

const EMPTY: RoomFormValues = { name: '', description: '', capacity: '2', pricePerNight: '', totalRooms: '1' };

type RoomManagerProps = {
  hotelId: string;
  rooms: RoomType[];
  onChanged: () => void;
};

export default function RoomManager({ hotelId, rooms, onChanged }: RoomManagerProps) {
  const [editing, setEditing] = useState<string | null>(null); // a room id, 'new', or nothing
  const [values, setValues] = useState<RoomFormValues>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof RoomFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  function startNew() {
    setValues(EMPTY);
    setEditing('new');
    setError('');
  }

  function startEdit(room: RoomType) {
    setValues({
      name: room.name,
      description: room.description ?? '',
      capacity: String(room.capacity),
      pricePerNight: room.price_per_night,
      totalRooms: String(room.total_rooms),
    });
    setEditing(room.id);
    setError('');
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    const payload: RoomTypeInput = {
      name: values.name.trim(),
      description: values.description.trim(),
      capacity: Number(values.capacity),
      pricePerNight: Number(values.pricePerNight),
      totalRooms: Number(values.totalRooms),
    };

    setBusy(true);
    setError('');
    try {
      if (editing === 'new') await createRoomTypeRequest(hotelId, payload);
      else if (editing) await updateRoomTypeRequest(editing, payload);
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(room: RoomType) {
    if (!window.confirm(`Delete "${room.name}"?`)) return;
    setError('');
    try {
      await deleteRoomTypeRequest(room.id);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="admin-section" aria-labelledby="rooms-heading">
      <div className="section-head">
        <h2 id="rooms-heading">Room types</h2>
        {editing === null && <Button onClick={startNew}>Add room type</Button>}
      </div>

      {rooms.length === 0 && editing === null && (
        <p className="summary-muted">No room types yet. Guests cannot book this hotel until you add one.</p>
      )}

      {rooms.map((room) => (
        <div key={room.id} className="room-admin-row">
          <div>
            <strong>{room.name}</strong>
            <div className="summary-muted">
              {formatPrice(room.price_per_night)} per night · sleeps {room.capacity} · {room.total_rooms} room
              {room.total_rooms === 1 ? '' : 's'} available to sell
            </div>
          </div>
          <div className="row-actions">
            <Button variant="secondary" className="btn-small" onClick={() => startEdit(room)}>Edit</Button>
            <Button variant="secondary" className="btn-small btn-danger" onClick={() => handleDelete(room)}>Delete</Button>
          </div>
        </div>
      ))}

      {editing !== null && (
        <form className="room-form" onSubmit={handleSave}>
          <h3>{editing === 'new' ? 'New room type' : 'Edit room type'}</h3>

          <div className="field">
            <label htmlFor="roomName">Name</label>
            <input id="roomName" required minLength={2} maxLength={100} value={values.name} onChange={(e) => set('name')(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="roomDescription">Description</label>
            <input id="roomDescription" maxLength={500} placeholder="32 m², 2 single beds, breakfast included" value={values.description} onChange={(e) => set('description')(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="roomCapacity">Guests per room</label>
              <input id="roomCapacity" type="number" required min={1} max={20} value={values.capacity} onChange={(e) => set('capacity')(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="roomPrice">Price per night (R)</label>
              <input id="roomPrice" type="number" required min={0} step="0.01" value={values.pricePerNight} onChange={(e) => set('pricePerNight')(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="roomTotal">Rooms of this type</label>
              <input id="roomTotal" type="number" required min={0} max={1000} value={values.totalRooms} onChange={(e) => set('totalRooms')(e.target.value)} />
            </div>
          </div>
          <p className="summary-muted">
            "Rooms of this type" is your stock: how many can be booked on the same night. Guests see what is left after bookings.
          </p>

          {error && <p role="alert" className="form-error">{error}</p>}

          <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
            <Button type="submit" variant="dark" disabled={busy}>{busy ? 'Saving...' : 'Save room type'}</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}

      {editing === null && error && <p role="alert" className="form-error">{error}</p>}
    </section>
  );
}