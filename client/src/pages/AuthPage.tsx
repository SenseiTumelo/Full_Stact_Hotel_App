import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { CircleAlert, Eye, EyeOff, LoaderCircle, Mail, UserRound } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAuthenticatedUser } from '../store/slices/authSlice';
import { loginWithPasswordRequest, registerWithPasswordRequest } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useFeedback } from '../components/ui/FeedbackProvider';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import Button from '../components/ui/Button';

const API_BASE = import.meta.env.PROD ? '/api/v1' : import.meta.env.VITE_API_URL || '/api/v1';
const GOOGLE_URL = `${API_BASE}/auth/google`;

const copy = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to pick up where your next getaway begins.',
    switchText: 'New to Sensei Hotels?',
    switchLink: { to: '/register', label: 'Create an account' },
    submitLabel: 'Sign in',
  },
  register: {
    title: 'Create your account',
    subtitle: 'Save your details for a smoother booking experience.',
    switchText: 'Already have an account?',
    switchLink: { to: '/login', label: 'Sign in' },
    submitLabel: 'Create account',
  },
};

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status } = useAppSelector((state) => state.auth);
  const [params] = useSearchParams();
  const { notify } = useFeedback();
  const text = copy[mode];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
  }, [mode]);

  if (status !== 'ready') return <main className="container section"><div className="empty-state-loading">Checking your account…</div></main>;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const authenticatedUser = mode === 'register'
        ? await registerWithPasswordRequest({ fullName: fullName.trim(), email: email.trim(), password })
        : await loginWithPasswordRequest({ email: email.trim(), password });
      dispatch(setAuthenticatedUser(authenticatedUser));
      notify(mode === 'register' ? 'Your account is ready. Welcome to Sensei Hotels.' : 'You are signed in. Welcome back.');
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const googleError = params.get('error');

  return (
    <main className="container section auth-page">
      <Breadcrumbs items={[{ label: 'Hotels', to: '/' }, { label: mode === 'login' ? 'Sign in' : 'Create account' }]} />

      <div className="auth-layout">
        <div className="auth-image"><div className="auth-image-copy"><span className="eyebrow">A stay to look forward to</span><h2>Arrive as a guest.<br />Feel at home.</h2><p>Discover thoughtful places, warm hospitality, and time well spent.</p></div></div>

        <div className="auth-card">
          <div className="auth-heading"><span className="eyebrow">Sensei Hotels</span><h1>{text.title}</h1><p className="auth-subtitle">{text.subtitle}</p></div>

          {(error || googleError) && <div role="alert" className="auth-alert"><CircleAlert size={18} /><span>{error || 'Google sign-in did not complete. Please try again or use your email and password.'}</span></div>}

          <a className="btn btn-secondary auth-google" href={GOOGLE_URL}>
            <span className="google-mark" aria-hidden="true">G</span> Continue with Google
          </a>

          <div className="auth-divider"><span>or use your email</span></div>

          <form className="auth-manual-form" onSubmit={handleSubmit}>
            {mode === 'register' && <div className="field auth-input-field">
              <label htmlFor="fullName">Full name</label>
              <div className="auth-input-wrap"><UserRound size={17} /><input id="fullName" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" /></div>
            </div>}
            <div className="field auth-input-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrap"><Mail size={17} /><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            </div>
            <div className="field auth-input-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : undefined} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} /><button type="button" className="password-visibility" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              {mode === 'register' && <span className="auth-field-note">Use at least 8 characters.</span>}
            </div>
            <Button type="submit" variant="dark" className="auth-submit" disabled={busy}>
              {busy ? <><LoaderCircle className="auth-spinner" size={17} /> {mode === 'register' ? 'Creating your account…' : 'Signing you in…'}</> : text.submitLabel}
            </Button>
          </form>

          <p className="auth-switch">{text.switchText} <Link to={text.switchLink.to}>{text.switchLink.label}</Link></p>
          <p className="auth-privacy">Use the same sign-in method you chose when creating your account. Google accounts can continue with Google above.</p>
        </div>
      </div>
    </main>
  );
}
