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
import BookingConfirmedPage from './pages/BookingConfirmatedPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import BookingDatesPage from './pages/BookingDatesPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import AdminHotelsPage from './pages/AdminHotelsPage';
import AdminHotelEditPage from './pages/AdminHotelEditPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminReservationsPage from './pages/AdminReservationsPage';
import AdminReservationDetailPage from './pages/AdminReservationDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import ReviewPage from './pages/ReviewPage';

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
  path="/my-trips/:id/review"
  element={<ProtectedRoute><ReviewPage /></ProtectedRoute>}
/>
        <Route
          path="/hotels/:id/book"
          element={<ProtectedRoute><BookingDatesPage /></ProtectedRoute>}
        />
        <Route
          path="/booking/details"
          element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>}
        />
        <Route
          path="/booking/confirmed"
          element={<ProtectedRoute><BookingConfirmedPage /></ProtectedRoute>}
        />
        <Route
  path="/booking/payment"
  element={<ProtectedRoute><BookingPaymentPage /></ProtectedRoute>}
/>
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboardPage />} />
  <Route path="hotels" element={<AdminHotelsPage />} />
  <Route path="hotels/new" element={<AdminHotelEditPage />} />
  <Route path="hotels/:id" element={<AdminHotelEditPage />} />
  <Route path="reservations" element={<AdminReservationsPage />} />
<Route path="reservations/:id" element={<AdminReservationDetailPage />} />
  <Route path="reviews" element={<AdminReviewsPage />} />

</Route>
      </Route>
      
    </Routes>
  );
}
