import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotelById } from '../store/slices/hotelsSlice';
import { loadAvailability, setDraft } from '../store/slices/bookingSlice';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import StepIndicator from '../components/bookings/StepIndicator';
import RoomCard from '../components/hotel/RoomCard';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import type { RoomType } from '../types/hotel';
import { formatDate, formatPrice, nightsBetween, todayIso, totalPrice } from '../utils/booking';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value) || min));

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function BookingDatesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selected: hotel, selectedStatus } = useAppSelector((state) => state.hotels);
  const { availability, availabilityStatus } = useAppSelector((state) => state.booking);

  const today = todayIso();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const datesValid =
    checkIn >= today && checkOut > checkIn && nightsBetween(checkIn, checkOut) <= 30;

  useEffect(() => {
    if (id) dispatch(loadHotelById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (id && datesValid) dispatch(loadAvailability({ hotelId: id, checkIn, checkOut }));
  }, [id, checkIn, checkOut, datesValid, dispatch]);

  if (selectedStatus === 'failed') {
    return (
      <main className="container section">
        <Text variant="heading">Hotel not found</Text>
        <p><Link to="/">Back to all stays</Link></p>
      </main>
    );
  }
  if (!hotel || hotel.id !== id) {
    return <main className="container section"><Text>Loading...</Text></main>;
  }

  const roomsLeft = (roomId: string) =>
    availability.find((item) => item.room_type_id === roomId)?.available ?? 0;

  function roomState(room: RoomType): { disabled: boolean; note?: string } {
    if (!datesValid) return { disabled: true, note: 'Choose your dates first' };
    if (availabilityStatus !== 'succeeded') return { disabled: true };

    const left = roomsLeft(room.id);
    if (left === 0) return { disabled: true, note: 'Sold out for these dates' };
    if (left < rooms) return { disabled: true, note: `Only ${left} left` };
    if (guests > room.capacity * rooms) {
      return { disabled: true, note: `Sleeps ${room.capacity} per room` };
    }
    return { disabled: false, note: left <= 3 ? `Only ${left} left` : undefined };
  }

  // Everything below is calculated from the state above, so it can never go out of date
  const selectedRoom = hotel.room_types.find((room) => room.id === selectedRoomId) ?? null;
  const selectedState = selectedRoom ? roomState(selectedRoom) : null;
  const nights = datesValid ? nightsBetween(checkIn, checkOut) : 0;
  const canContinue = datesValid && selectedRoom !== null && selectedState !== null && !selectedState.disabled;

  let helper = '';
  if (!datesValid) helper = 'Choose your check-in and check-out dates.';
  else if (!selectedRoom) helper = 'Select a room to continue.';
  else if (selectedState?.disabled) helper = selectedState.note ?? 'Checking availability...';

  function continueToDetails() {
    if (!hotel || !selectedRoom || !canContinue) return;
    dispatch(
      setDraft({
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: selectedRoom.id,
        roomName: selectedRoom.name,
        pricePerNight: selectedRoom.price_per_night,
        checkIn,
        checkOut,
        rooms,
        guests,
      })
    );
    navigate('/booking/details');
  }

  return (
    <main className="container section">
      <Breadcrumbs
        items={[
          { label: 'Hotels', to: '/' },
          { label: hotel.name, to: `/hotels/${hotel.id}` },
          { label: 'Dates & rooms' },
        ]}
      />
      <h1 className="page-title">Choose your dates and room</h1>
      <p className="page-subtitle">{hotel.name} · {hotel.city}</p>

      <StepIndicator current={1} />

      <div className="booking-layout">
        <div>
          <form className="search-bar" onSubmit={(event) => event.preventDefault()}>
            <div className="field">
              <label htmlFor="checkIn">Check-in</label>
              <input
                id="checkIn"
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  if (checkOut && event.target.value >= checkOut) setCheckOut('');
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="checkOut">Check-out</label>
              <input
                id="checkOut"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rooms">Rooms</label>
              <input
                id="rooms"
                type="number"
                min={1}
                max={10}
                value={rooms}
                onChange={(event) => setRooms(clamp(Number(event.target.value), 1, 10))}
              />
            </div>
            <div className="field">
              <label htmlFor="guests">Guests</label>
              <input
                id="guests"
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(event) => setGuests(clamp(Number(event.target.value), 1, 20))}
              />
            </div>
          </form>

          <div style={{ margin: '16px 0' }} aria-live="polite">
            {datesValid && availabilityStatus === 'loading' && (
              <Text variant="caption">Checking availability...</Text>
            )}
            {datesValid && availabilityStatus === 'failed' && (
              <Text variant="caption">Could not check availability. Please try again.</Text>
            )}
          </div>

          <div className="room-list">
            {hotel.room_types.map((room) => {
              const state = roomState(room);
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={room.id === selectedRoomId}
                  disabled={state.disabled}
                  note={state.note}
                  onSelect={() => setSelectedRoomId(room.id)}
                />
              );
            })}
          </div>
        </div>

        <aside className="summary-card stay-panel" aria-label="Your stay">
          <p className="eyebrow">Your stay</p>
          <h2>{hotel.name}</h2>

          <div className="summary-dates">
            <div>
              <span className="eyebrow">Check-in</span>
              <strong>{checkIn ? formatDate(checkIn) : '—'}</strong>
            </div>
            <div>
              <span className="eyebrow">Check-out</span>
              <strong>{checkOut ? formatDate(checkOut) : '—'}</strong>
            </div>
          </div>

          <p className="summary-muted">
            {datesValid ? plural(nights, 'night') : 'Dates not chosen'} · {plural(guests, 'guest')} · {plural(rooms, 'room')}
          </p>

          {selectedRoom && datesValid && (
            <>
              <hr />
              <div className="summary-row">
                <span>{selectedRoom.name}</span>
                <span>{formatPrice(selectedRoom.price_per_night)} / night</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(totalPrice(selectedRoom.price_per_night, nights, rooms))}</span>
              </div>
            </>
          )}

          <Button variant="dark" disabled={!canContinue} onClick={continueToDetails}>
            Continue to guest details
          </Button>
          {helper && <p className="summary-muted" aria-live="polite">{helper}</p>}
        </aside>
      </div>
    </main>
  );
}