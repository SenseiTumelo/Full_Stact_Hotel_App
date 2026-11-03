import { Link, NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">STAY.</Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Explore</NavLink>
          <NavLink to="/my-trips">My trips</NavLink>
          <a href="#">About</a>
        </nav>

        <div className="nav-right">
          <a href="#">Help</a>

          {status === 'ready' && user && (
            <>
              <span className="avatar" title={user.email} aria-label={`Signed in as ${user.full_name}`}>
                {user.full_name.charAt(0).toUpperCase()}
              </span>
              <button type="button" className="link-button" onClick={() => dispatch(logout())}>
                Sign out
              </button>
            </>
          )}

          {status === 'ready' && !user && (
            <Link to="/login" className="btn btn-primary nav-signin">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}