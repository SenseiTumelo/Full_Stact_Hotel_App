import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { submitBooking } from '../store/slices/bookingSlice';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import StepIndicator from '../components/bookings/StepIndicator';
import SummaryCard from '../components/bookings/SummaryCard';
import Button from '../components/ui/Button';

export default function BookingDetailsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { draft, submitStatus, submitError } = useAppSelector((state) => state.booking);
  const user = useAppSelector((state) => state.auth.user);

  const [guestName, setGuestName] = useState(user?.full_name ?? '');
  const [guestEmail, setGuestEmail] = useState(user?.email ?? '');
  const [guestPhone, setGuestPhone] = useState('');
  const [wantsRequest, setWantsRequest] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');

  // Someone who opens this page directly has not chosen a room yet
  if (!draft) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const result = await dispatch(
      submitBooking({
        roomTypeId: draft.roomTypeId,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        rooms: draft.rooms,
        guests: draft.guests,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        specialRequest: wantsRequest && specialRequest.trim() ? specialRequest.trim() : undefined,
      })
    );

    //if (submitBooking.fulfilled.match(result)) navigate('/booking/confirmed');
    if (submitBooking.fulfilled.match(result)) navigate('/booking/payment');
  };

  return (
    <main className="container section">
      <Breadcrumbs
        items={[
          { label: 'Hotels', to: '/' },
          { label: draft.hotelName, to: `/hotels/${draft.hotelId}` },
          { label: 'Guest details' },
        ]}
      />
      <h1 className="page-title">Complete your reservation</h1>
      <p className="page-subtitle">Add the lead guest's details to confirm the room.</p>

      <StepIndicator current={2} />

      <div className="booking-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Guest information</h2>

          <div className="field">
            <label htmlFor="guestName">First and last name</label>
            <input
              id="guestName"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="As shown on your ID"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="guestEmail">Email address</label>
            <input
              id="guestEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="guestPhone">Phone number</label>
            <input
              id="guestPhone"
              type="tel"
              required
              autoComplete="tel"
              pattern="\+?[0-9 \(\)\-]{7,20}"
              title="Enter a phone number, for example +27 82 123 4567"
              placeholder="+27 82 123 4567"
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={wantsRequest}
              onChange={(event) => setWantsRequest(event.target.checked)}
            />
            Add a special request
          </label>

          {wantsRequest && (
            <div className="field">
              <label htmlFor="specialRequest">Special request</label>
              <textarea
                id="specialRequest"
                maxLength={500}
                value={specialRequest}
                onChange={(event) => setSpecialRequest(event.target.value)}
              />
              <span className="summary-muted">Requests are not guaranteed, but the hotel will do its best.</span>
            </div>
          )}

          {submitError && <p role="alert" className="form-error">{submitError}</p>}

          <Button type="submit" variant="dark" disabled={submitStatus === 'loading'}>
            {submitStatus === 'loading' ? 'Booking...' : 'Confirm booking'}
          </Button>

          <Link to={`/hotels/${draft.hotelId}/book`} className="summary-muted">
            ← Change dates or room
          </Link>
        </form>

        <SummaryCard
          hotelName={draft.hotelName}
          roomName={draft.roomName}
          checkIn={draft.checkIn}
          checkOut={draft.checkOut}
          rooms={draft.rooms}
          guests={draft.guests}
          pricePerNight={draft.pricePerNight}
        />
      </div>
    </main>
  );
}