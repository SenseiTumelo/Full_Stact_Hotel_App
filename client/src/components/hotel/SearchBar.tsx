import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import type { HotelSearch } from '../../services/api';
import { MapPin, Search, Star, Wallet } from 'lucide-react';

type SearchBarProps = {
  onSearch: (search: HotelSearch) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [minStars, setMinStars] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault(); // stop the browser reloading the page
    onSearch({
      city: city.trim() || undefined,
      minStars: minStars ? Number(minStars) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar" aria-label="Find a hotel">
      <div className="field">
        <label htmlFor="city"><MapPin size={14} /> Destination</label>
        <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
      </div>
      <div className="field">
        <label htmlFor="stars"><Star size={14} /> Hotel rating</label>
        <select id="stars" value={minStars} onChange={(e) => setMinStars(e.target.value)}>
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="price"><Wallet size={14} /> Max price per night</label>
        <input id="price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="R per night" />
      </div>
      <Button type="submit" variant="dark"><Search size={17} /> Find a stay</Button>
    </form>
  );
}
