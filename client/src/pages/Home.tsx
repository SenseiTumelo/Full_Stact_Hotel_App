import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotels } from '../store/slices/hotelsSlice';
import Hero from '../components/layout/Hero';
import SearchBar from '../components/hotel/SearchBar';
import HotelCard from '../components/hotel/HotelCard';
import Text from '../components/ui/Text';
import { Link, NavLink } from 'react-router-dom';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(loadHotels());
  }, [dispatch]);

  return (
    <>
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">H.A</Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Explore</NavLink>
          <a href="#">My trips</a>
          <a href="#">About</a>
        </nav>

        <div className="nav-right">
          <a href="#">Help</a>
          <span className="avatar" aria-label="Account">T</span>
        </div>
      </div>
    </header>
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