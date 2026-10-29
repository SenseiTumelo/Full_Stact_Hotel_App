import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import HotelDetailsPage from '../pages/HotelDetailsPage';
import Text from './components/ui/Text';

function NotFound() {
  return (
    <main className="container section">
      <Text variant="heading">Page not found</Text>
      <p><Link to="/">Back to home</Link></p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}