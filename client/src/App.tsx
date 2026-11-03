import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import HotelDetailsPage from './pages/HotelDetailsPage';
import Text from './components/ui/Text';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { loadCurrentUser } from './store/slices/authSlice';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MyTrips from './pages/MyTrips';

function NotFound() {
  return (
    <main className="container section">
      <Text variant="heading">Page not found</Text>
      <p><Link to="/">Back to home</Link></p>
    </main>
  );
}

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}