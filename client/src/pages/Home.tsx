import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotels } from '../store/slices/hotelsSlice';
import Hero from '../components/layout/Hero';
import SearchBar from '../components/hotel/SearchBar';
import HotelCard from '../components/hotel/HotelCard';
import { ArrowRight, BadgeCheck, HeartHandshake, Sparkles } from 'lucide-react';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(loadHotels());
  }, [dispatch]);

  return (
    <>
      <Hero
        title="Find a stay that feels like yours"
        subtitle="Thoughtful spaces, local character, and room to slow down."
      >
        <SearchBar onSearch={(search) => dispatch(loadHotels(search))} />
      </Hero>

      <main className="home-content">
        <section className="container home-promises" aria-label="Why book with us">
          <div><span><BadgeCheck size={20} /></span><p><strong>Thoughtfully selected</strong><small>Stays with a sense of place</small></p></div>
          <div><span><HeartHandshake size={20} /></span><p><strong>Warm hospitality</strong><small>Care that starts before check-in</small></p></div>
          <div><span><Sparkles size={20} /></span><p><strong>Easy from start to stay</strong><small>Simple, secure booking</small></p></div>
        </section>

        <section id="stays" className="container section home-stays">
          <div className="home-section-heading">
            <div><p className="eyebrow">A place to come back to</p><h2>Stays worth slowing down for</h2><p>Find a room that feels considered, comfortable, and a little bit special.</p></div>
            <span className="home-result-count">{items.length} {items.length === 1 ? 'stay' : 'stays'}</span>
          </div>
          {status === 'loading' && <div className="home-state">Finding your next stay…</div>}
          {error && <div role="alert" className="inline-notice inline-notice-error">{error}</div>}
          {status === 'succeeded' && items.length === 0 && <div className="home-state"><strong>No stays match those filters.</strong><p>Try another city or broaden your price and star preferences.</p></div>}
          <div className="grid hotel-grid">
            {items.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        </section>

        <section className="home-editorial container">
          <div className="home-editorial-photo" role="img" aria-label="Hotel pool and courtyard at dusk" />
          <div className="home-editorial-copy"><p className="eyebrow">Stay a little longer</p><h2>Make room for the moments in between.</h2><p>Slow mornings, one more walk, a table worth lingering at. Your stay should leave space for all of it.</p><a href="#stays" className="text-link">Explore our stays <ArrowRight size={16} /></a></div>
        </section>
      </main>
    </>
  );
}
