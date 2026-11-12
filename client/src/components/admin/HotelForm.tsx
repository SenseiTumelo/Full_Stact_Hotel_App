import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Button from '../ui/Button';
import type { Amenity, HotelDetails, HotelInput } from '../../types/hotel';
import { getErrorMessage } from '../../utils/errors';

type HotelFormProps = {
  initial?: HotelDetails;
  amenities: Amenity[];
  submitLabel: string;
  onSubmit: (values: HotelInput) => Promise<void>;
};

export default function HotelForm({ initial, amenities, submitLabel, onSubmit }: HotelFormProps) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    country: initial?.country ?? '',
    latitude: initial?.latitude ?? '',
    longitude: initial?.longitude ?? '',
    starRating: String(initial?.star_rating ?? 3),
    policies: initial?.policies ?? '',
  });
  const [amenityIds, setAmenityIds] = useState<number[]>(initial?.amenity_ids ?? []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // One helper for every text field: update(name) returns a change handler for that field
  const update =
    (key: keyof typeof values) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((current) => ({ ...current, [key]: event.target.value }));

  function toggleAmenity(id: number) {
    setAmenityIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        country: values.country.trim(),
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        starRating: Number(values.starRating),
        policies: values.policies.trim(),
        amenityIds,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Hotel details</h2>

      <div className="field">
        <label htmlFor="name">Hotel name</label>
        <input id="name" required minLength={2} maxLength={120} value={values.name} onChange={update('name')} />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" maxLength={2000} value={values.description} onChange={update('description')} />
      </div>

      <div className="field">
        <label htmlFor="address">Street address</label>
        <input id="address" required minLength={3} value={values.address} onChange={update('address')} />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" required value={values.city} onChange={update('city')} />
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input id="country" required value={values.country} onChange={update('country')} />
        </div>
        <div className="field">
          <label htmlFor="starRating">Star rating</label>
          <select id="starRating" value={values.starRating} onChange={update('starRating')}>
            {[1, 2, 3, 4, 5].map((stars) => (
              <option key={stars} value={stars}>{stars} star{stars === 1 ? '' : 's'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="latitude">Latitude</label>
          <input id="latitude" type="number" step="any" min={-90} max={90} required value={values.latitude} onChange={update('latitude')} />
        </div>
        <div className="field">
          <label htmlFor="longitude">Longitude</label>
          <input id="longitude" type="number" step="any" min={-180} max={180} required value={values.longitude} onChange={update('longitude')} />
        </div>
      </div>
      <p className="summary-muted">
        Tip: in Google Maps, right-click the hotel and click the coordinates to copy them (latitude first).
      </p>

      <fieldset className="amenity-fieldset">
        <div className="amenity-legend-row">
          <legend>Amenities &amp; facilities</legend>
          {amenities.length > 0 && <span>{amenityIds.length} selected</span>}
        </div>
        <p className="amenity-help">Tick everything available to guests at this hotel, such as Wi-Fi, television, or a swimming pool.</p>
        {amenities.length > 0 ? (
          <div className="amenity-options">
            {amenities.map((amenity) => {
              const selected = amenityIds.includes(amenity.id);
              return (
                <label key={amenity.id} className={`amenity-option${selected ? ' amenity-option-selected' : ''}`}>
                  <input
                    type="checkbox"
                    name="amenityIds"
                    value={amenity.id}
                    checked={selected}
                    onChange={() => toggleAmenity(amenity.id)}
                  />
                  <span>{amenity.name}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="amenity-empty" role="status">Amenity options are loading or unavailable. Refresh the page to try again.</p>
        )}
      </fieldset>

      <div className="field">
        <label htmlFor="policies">Policies</label>
        <textarea
          id="policies"
          maxLength={2000}
          placeholder="Check-in and check-out times, cancellation rules, pets..."
          value={values.policies}
          onChange={update('policies')}
        />
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}

      <Button type="submit" variant="dark" disabled={busy}>
        {busy ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
