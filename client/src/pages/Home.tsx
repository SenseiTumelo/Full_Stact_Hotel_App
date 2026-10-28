import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotels } from '../store/slices/hotelsSlice';
import HotelCard from '../components/hotel/HotelCard';
import Text from '../components/ui/Text';
import SearchBar from '../components/hotel/SearchBar';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
      dispatch(loadHotels());
  }, [dispatch]);

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <Text variant="heading">Find your next stay</Text>
      <SearchBar onSearch={(search) => dispatch(loadHotels(search))} />
      {status === 'loading' && <Text>Loading...</Text>}
      {status === 'succeeded' && items.length === 0 && <Text>No hotels match your search.</Text>}
      {error && <Text>{error}</Text>}
      <div className="grid" style={{ marginTop: 24 }}>
        {items.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}