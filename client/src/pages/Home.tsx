import { useEffect, useState } from 'react';
import { fetchHotels } from '../services/api';
import type { Hotel } from '../types/hotel';
import HotelCard from '../components/hotel/HotelCard';
import Text from '../components/ui/Text';

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHotels()
      .then(setHotels)
      .catch(() => setError('Could not load hotels'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <Text variant="heading">Find your next stay</Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text>{error}</Text>}
      <div className="grid" style={{ marginTop: 24 }}>
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}