import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotels } from '../store/slices/hotelsSlice';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/layout/Hero';
import SearchBar from '../components/hotel/SearchBar';
import HotelCard from '../components/hotel/HotelCard';
import Text from '../components/ui/Text';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(loadHotels());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Hero
        title="Find a stay that feels like yours"
        subtitle="Good places, thoughtful stays, and a little room to unwind."
      >
        <SearchBar onSearch={(search) => dispatch(loadHotels(search))} />
      </Hero>

      <main className="container section">
        <Text variant="subheading">Popular stays</Text>
        {status === 'loading' && <Text>Loading...</Text>}
        {error && <Text>{error}</Text>}
        {status === 'succeeded' && items.length === 0 && (
          <Text>No hotels match your search.</Text>
        )}
        <div className="grid" style={{ marginTop: 20 }}>
          {items.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </main>
    </>
  );
}