import { FcGoogle } from 'react-icons/fc';
import { LockKeyhole, Mail, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export default function AuthPage({ audience = 'student' }) {
  const { user, setUser, pushToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = audience === 'admin';
  const [email, setEmail] = useState(isAdmin ? '' : user.email);
  const [name, setName] = useState(isAdmin ? '' : user.name);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [issuedOtp, setIssuedOtp] = useState('');
  const [role, setRole] = useState(user.role === 'seller' ? 'seller' : 'buyer');
  const [adminCode, setAdminCode] = useState('');

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanAdminCode = adminCode.trim();
  const adminAccessCode = String(import.meta.env.VITE_ADMIN_ACCESS_CODE || '').trim();
  const isValidEmail = emailPattern.test(cleanEmail);
  const searchParams = new URLSearchParams(location.search);
  const requestedPath = location.state?.from || searchParams.get('redirect') || '';
  const fromPath = requestedPath.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '';
  const redirectPath = isAdmin
    ? fromPath?.startsWith('/admin') ? fromPath : '/admin'
    : fromPath && !fromPath.startsWith('/admin') ? fromPath : '/marketplace';

  const sendOtp = (event) => {
    event.preventDefault();
    if (!cleanName) {
      pushToast('Name required', 'Enter your name to continue.', 'sky');
      return;
    }
    if (!isValidEmail) {
      pushToast('Valid email required', 'Use any valid email address.', 'sky');
      return;
    }

    const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
    setIssuedOtp(nextOtp);
    setOtpSent(true);
    pushToast('Code ready', `Use ${nextOtp} to login.`, 'mint');
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!issuedOtp || otp.trim() !== issuedOtp) {
      pushToast('Invalid code', 'Enter the code shown on this page.', 'sky');
      return;
    }

    try {
      const response = await api.signup({ email: cleanEmail, name: cleanName, role });
      const profile = response.profile || {};
      setUser({
        ...user,
        id: profile.id || response.user?.id || user.id,
        name: profile.name || cleanName,
        email: profile.email || cleanEmail,
        role: profile.role || role,
        campus: profile.campus || '',
        avatar: profile.avatar || '',
        verified: true
      });
      pushToast(response.existing ? 'Welcome back' : 'Login successful', 'Your saved Zylo profile is ready.', 'mint');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      pushToast('Login failed', error.message || 'Could not create your profile.', 'sky');
    }
  };

  const googleLogin = () => {
    if (!isSupabaseConfigured || !supabase) {
      pushToast('Google login unavailable', 'Connect Supabase OAuth before using Google login.', 'sky');
      return;
    }

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`
      }
    });
  };

  const adminLogin = (event) => {
    event.preventDefault();
    if (!cleanName) {
      pushToast('Name required', 'Enter the admin name.', 'sky');
      return;
    }
    if (!isValidEmail) {
      pushToast('Valid email required', 'Use any valid email address.', 'sky');
      return;
    }
    if (!adminAccessCode) {
      pushToast('Admin code not configured', 'Set VITE_ADMIN_ACCESS_CODE in your env file.', 'sky');
      return;
    }
    if (cleanAdminCode !== adminAccessCode) {
      pushToast('Invalid admin code', 'Enter the private admin access code.', 'sky');
      return;
    }

    setUser({
      ...user,
      name: cleanName,
      email: cleanEmail,
      role: 'admin',
      verified: true
    });
    pushToast('Admin login successful', 'Dashboard access enabled.', 'mint');
    navigate(redirectPath, { replace: true });
  };

  return (
    <section className="min-h-screen bg-slate-50 text-slate-950 dark:bg-zylo-navy dark:text-white">
      <div className="page-pad flex min-h-screen flex-col">
        <nav className="flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white">
              <ShoppingBag size={21} />
            </span>
            <span className="text-2xl font-black">Zylo</span>
          </Link>
          <Link to={isAdmin ? '/student-login' : '/admin-login'} className="text-sm font-black text-violet-700 hover:text-violet-900 dark:text-sky-200">
            {isAdmin ? 'Student Login' : 'Admin Login'}
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/10">
            <div className="mb-6">
              <p className="text-sm font-black uppercase text-violet-600 dark:text-sky-200">
                {isAdmin ? 'Admin login' : 'Student login'}
              </p>
              <h1 className="mt-2 text-3xl font-black">
                {isAdmin ? 'Open admin dashboard' : 'Login to Zylo'}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">
                {isAdmin
                  ? 'Use your email and private admin code.'
                  : 'Use your email to open your saved profile. A demo code will appear here.'}
              </p>
            </div>

            <form onSubmit={isAdmin ? adminLogin : otpSent ? verifyOtp : sendOtp} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black">Name</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input value={name} onChange={(event) => setName(event.target.value)} className="field pl-11" placeholder="Your name" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="field pl-11"
                    placeholder={isAdmin ? 'admin@gmail.com' : 'name@gmail.com'}
                  />
                </span>
                {cleanEmail && !isValidEmail && (
                  <span className="mt-2 block text-xs font-bold text-pink-500">Enter a valid email address.</span>
                )}
              </label>

              {isAdmin ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-black">Admin code</span>
                  <span className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={adminCode}
                      onChange={(event) => setAdminCode(event.target.value)}
                      type="password"
                      className="field pl-11"
                      placeholder="Enter admin code"
                    />
                  </span>
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-black">I want to</span>
                  <select value={role} onChange={(event) => setRole(event.target.value)} className="field">
                    <option value="buyer">Buy products</option>
                    <option value="seller">Sell products</option>
                  </select>
                </label>
              )}

              {!isAdmin && otpSent && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-white/10 dark:bg-white/10">
                  <p className="text-sm font-black text-slate-950 dark:text-white">Demo code</p>
                  <p className="mt-1 text-2xl font-black text-violet-700 dark:text-sky-200">{issuedOtp}</p>
                  <label className="mt-3 block">
                    <span className="mb-2 block text-sm font-black">Enter code</span>
                    <input value={otp} onChange={(event) => setOtp(event.target.value)} className="field" placeholder="6 digit code" />
                  </label>
                </div>
              )}

              <button className="primary-button w-full" type="submit">
                <ShieldCheck size={19} />
                {isAdmin ? 'Login as Admin' : otpSent ? 'Enter Zylo' : 'Get Login Code'}
              </button>
            </form>

            {!isAdmin && (
              <button onClick={googleLogin} className="secondary-button mt-3 w-full" type="button">
                <FcGoogle size={22} />
                Continue with Google
              </button>
            )}

            <p className="mt-5 text-center text-sm font-semibold text-slate-500 dark:text-slate-300">
              {isAdmin ? 'Need student access?' : 'Need admin access?'}{' '}
              <Link to={isAdmin ? '/student-login' : '/admin-login'} className="font-black text-violet-700 dark:text-sky-200">
                {isAdmin ? 'Student Login' : 'Admin Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
