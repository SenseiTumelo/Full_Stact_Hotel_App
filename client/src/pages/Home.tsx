import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotels } from '../store/slices/hotelsSlice';
import HotelCard from '../components/hotel/HotelCard';
import Text from '../components/ui/Text';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadHotels());
    }
  }, [status, dispatch]);

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <Text variant="heading">Find your next stay</Text>
      {status === 'loading' && <Text>Loading...</Text>}
      {error && <Text>{error}</Text>}
      <div className="grid" style={{ marginTop: 24 }}>
        {items.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}