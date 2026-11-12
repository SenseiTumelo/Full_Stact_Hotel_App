import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FeedbackProvider from '../ui/FeedbackProvider';

export default function Layout() {
  const isHome = useLocation().pathname === '/';
  return (
    <FeedbackProvider>
      <div className={`app-shell${isHome ? ' app-shell-home' : ''}`}>
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </FeedbackProvider>
  );
}
