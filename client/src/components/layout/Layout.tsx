import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FeedbackProvider from '../ui/FeedbackProvider';

export default function Layout() {
  return (
    <FeedbackProvider>
      <div className="app-shell">
        <Navbar />
        <Outlet />
      </div>
    </FeedbackProvider>
  );
}
