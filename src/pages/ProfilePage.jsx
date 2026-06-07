import { ImagePlus, LogOut, Mail, Save, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user.name || '',
    campus: user.campus || '',
    role: user.role || 'buyer',
    avatar: user.avatar || '',
    avatarDataUrl: ''
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const uploadPhoto = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setForm((current) => ({
        ...current,
        avatar: dataUrl,
        avatarDataUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    await updateProfile(form);
    setSaving(false);
  };

  const signOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <SectionHeader
          eyebrow="Profile"
          title="Your account"
          copy="Edit your basic details or logout from Zylo."
        />

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center gap-4">
              {form.avatar ? (
                <img src={form.avatar} alt={form.name || 'Profile'} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  <UserRound size={34} />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black">{user.name || 'Student'}</h2>
                <p className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Mail size={15} />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-white/10">
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">Current role</p>
              <p className="mt-1 text-lg font-black capitalize text-violet-700 dark:text-sky-200">{user.role}</p>
            </div>

            <button onClick={signOut} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 font-black text-rose-600 transition hover:bg-rose-500 hover:text-white dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200" type="button">
              <LogOut size={19} />
              Logout
            </button>
          </aside>

          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-black">Name</span>
                <input value={form.name} onChange={update('name')} className="field" placeholder="Your name" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Email</span>
                <input value={user.email} className="field bg-slate-50 text-slate-500 dark:bg-white/5" disabled />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Campus</span>
                <input value={form.campus} onChange={update('campus')} className="field" placeholder="College or campus name" />
              </label>

              {user.role !== 'admin' && (
                <label className="block">
                  <span className="mb-2 block text-sm font-black">Use Zylo as</span>
                  <select value={form.role} onChange={update('role')} className="field">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </label>
              )}

              <div className={user.role === 'admin' ? 'block md:col-span-2' : 'block'}>
                <span className="mb-2 block text-sm font-black">Profile photo</span>
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadPhoto(event.target.files?.[0])} />
                  {form.avatar ? (
                    <span className="relative block">
                      <img src={form.avatar} alt="Profile preview" className="h-24 w-24 rounded-2xl object-cover" />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setForm((current) => ({ ...current, avatar: '', avatarDataUrl: '' }));
                        }}
                        className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700 shadow-sm"
                        aria-label="Remove photo"
                      >
                        <X size={15} />
                      </button>
                    </span>
                  ) : (
                    <>
                      <span className="grid h-14 w-14 place-items-center rounded-xl bg-white text-violet-700 shadow-sm dark:bg-white/10 dark:text-sky-200">
                        <ImagePlus size={24} />
                      </span>
                      <span className="mt-3 text-sm font-black">Upload photo</span>
                      <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">JPG, PNG, WebP, or GIF up to 5 MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>
              <Save size={19} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
