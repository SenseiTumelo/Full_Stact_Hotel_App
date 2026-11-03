import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Breadcrumbs from '../components/layout/Breadcrumbs';

const GOOGLE_URL = `${import.meta.env.VITE_API_URL}/auth/google`;

const copy = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to manage your stay.',
    switchText: 'New to STAY.?',
    switchLink: { to: '/register', label: 'Create an account' },
  },
  register: {
    title: 'Create your account',
    subtitle: 'Save your details for a smoother booking.',
    switchText: 'Already have an account?',
    switchLink: { to: '/login', label: 'Sign in' },
  },
};

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, status } = useAppSelector((state) => state.auth);
  const [params] = useSearchParams();
  const text = copy[mode];

  if (status === 'ready' && user) return <Navigate to="/" replace />;

  return (
    <main className="container section">
      <Breadcrumbs items={[{ label: 'Hotels', to: '/' }, { label: mode === 'login' ? 'Sign in' : 'Create account' }]} />

      <div className="auth-layout">
        <div className="auth-image">Stay somewhere worth remembering</div>

        <div className="auth-card">
          <h1>{text.title}</h1>
          <p className="auth-subtitle">{text.subtitle}</p>

          {params.get('error') && (
            <p role="alert" className="form-error">
              Sign-in did not work. Please try again.
            </p>
          )}

          {/* A normal link, not <Link>: we are leaving the React app for Google */}
          <a className="btn btn-secondary auth-google" href={GOOGLE_URL}>
            Continue with Google
          </a>

          <p className="auth-note">
            Signing in with Google creates your account automatically the first time.
          </p>
          <p className="auth-switch">
            {text.switchText} <Link to={text.switchLink.to}>{text.switchLink.label}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}