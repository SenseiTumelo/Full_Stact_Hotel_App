import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarDays, Check, CircleUserRound, LockKeyhole, Mail, Phone, Save, UserRound } from 'lucide-react';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import Button from '../components/ui/Button';
import { useFeedback } from '../components/ui/FeedbackProvider';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAuthenticatedUser } from '../store/slices/authSlice';
import { updateCurrentUserProfile } from '../services/api';
import { getErrorMessage } from '../utils/errors';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user)!;
  const { notify } = useFeedback();
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName(user.full_name);
    setPhone(user.phone ?? '');
  }, [user.full_name, user.phone]);

  const changed = fullName.trim() !== user.full_name || phone.trim() !== (user.phone ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !changed) return;
    setBusy(true);
    setError('');
    try {
      const updated = await updateCurrentUserProfile({ fullName: fullName.trim(), phone: phone.trim() || null });
      dispatch(setAuthenticatedUser(updated));
      notify('Your profile has been updated.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container section profile-page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Your profile' }]} />
      <header className="profile-heading">
        <div className="profile-heading-icon"><CircleUserRound size={25} /></div>
        <div><p className="eyebrow">Your account</p><h1>Profile details</h1><p>Keep your contact information up to date for a smoother stay.</p></div>
      </header>

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-card-heading"><div><h2>Personal information</h2><p>Update how we address and contact you.</p></div><BadgeCheck size={20} /></div>
          <form onSubmit={handleSubmit} className="profile-form">
            <label className="profile-field" htmlFor="profile-name">
              <span>Full name</span>
              <span className="profile-input-wrap"><UserRound size={17} /><input id="profile-name" name="fullName" type="text" autoComplete="name" minLength={2} maxLength={100} required value={fullName} onChange={(event) => setFullName(event.target.value)} /></span>
            </label>
            <label className="profile-field" htmlFor="profile-email">
              <span>Email address <span className="profile-field-note">Cannot be changed</span></span>
              <span className="profile-input-wrap profile-input-locked"><Mail size={17} /><input id="profile-email" name="email" type="email" autoComplete="email" value={user.email} readOnly aria-describedby="email-locked-help" /><LockKeyhole size={15} aria-hidden="true" /></span>
              <small id="email-locked-help">Your email is used for sign-in and booking updates.</small>
            </label>
            <label className="profile-field" htmlFor="profile-phone">
              <span>Phone number <span className="profile-field-note">Optional</span></span>
              <span className="profile-input-wrap"><Phone size={17} /><input id="profile-phone" name="phone" type="tel" autoComplete="tel" maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+27 82 123 4567" /></span>
              <small>We’ll use this only if we need to reach you about a booking.</small>
            </label>
            {error && <div className="profile-error" role="alert">{error}</div>}
            <div className="profile-form-footer"><span>{changed ? 'You have unsaved changes.' : <><Check size={15} /> Your details are up to date.</>}</span><Button type="submit" disabled={busy || !changed}>{busy ? 'Saving…' : <><Save size={16} /> Save changes</>}</Button></div>
          </form>
        </section>

        <aside className="profile-side-card">
          <div className="profile-summary-avatar">{user.full_name.trim().charAt(0).toUpperCase()}</div>
          <h2>{user.full_name}</h2>
          <p>{user.role === 'admin' ? 'Hotel administrator' : 'Guest account'}</p>
          <div className="profile-summary-divider" />
          <Link to="/my-trips" className="profile-side-link"><span><CalendarDays size={16} /> Manage your stays</span><ArrowRight size={16} /></Link>
        </aside>
      </div>
    </main>
  );
}
