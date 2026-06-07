import { ArrowRight, LockKeyhole, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const heroImage =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85';

const steps = [
  'Login with your email',
  'Browse or post products',
  'Chat, pay, and pick up'
];

export default function LandingPage() {
  const { categories, user } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user?.verified);

  const openAfterLogin = (path) => {
    if (isLoggedIn) {
      navigate(path);
      return;
    }

    navigate(`/student-login?redirect=${encodeURIComponent(path)}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    openAfterLogin(search ? `/marketplace?search=${encodeURIComponent(search)}` : '/marketplace');
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-zylo-navy dark:text-white">
      <section className="relative min-h-[82vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(6, 8, 24, 0.82), rgba(6, 8, 24, 0.46)), url("${heroImage}")`
          }}
        />

        <div className="page-pad relative flex min-h-[82vh] flex-col">
          <nav className="flex items-center justify-between py-5">
            <Link to="/" className="flex items-center gap-2 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <ShoppingBag size={21} />
              </span>
              <span className="text-2xl font-black">Zylo</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/admin-login" className="hidden rounded-xl px-4 py-2 text-sm font-black text-white hover:bg-white/10 sm:inline-flex">
                Admin
              </Link>
              <button
                onClick={() => openAfterLogin('/marketplace')}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950"
                type="button"
              >
                {isLoggedIn ? 'Open App' : 'Student Login'}
              </button>
            </div>
          </nav>

          <div className="flex flex-1 items-center py-10">
            <div className="max-w-2xl text-white">
              <p className="text-sm font-black uppercase tracking-wide text-white/75">Campus marketplace</p>
              <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">
                Your Campus. Your Deals. Your Vibe.
              </h1>
              <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-white/82">
                Buy and sell products with students around your campus.
              </p>

              <form onSubmit={submitSearch} className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-white/20 bg-white px-11 py-3 text-sm font-bold text-slate-950 outline-none"
                    placeholder="Search books, phone, cycle..."
                  />
                </label>
                <button className="primary-button bg-violet-600 px-6" type="submit">
                  Search
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => openAfterLogin('/marketplace')} className="rounded-xl bg-white px-5 py-3 font-black text-slate-950" type="button">
                  Browse Products
                </button>
                <button onClick={() => openAfterLogin('/sell')} className="rounded-xl border border-white/25 px-5 py-3 font-black text-white hover:bg-white/10" type="button">
                  Sell Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-white py-10 dark:bg-zylo-navy">
        <div className="page-pad">
          <section className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/10">
                <p className="text-sm font-black text-violet-700 dark:text-sky-200">Step {index + 1}</p>
                <p className="mt-2 text-xl font-black">{step}</p>
              </div>
            ))}
          </section>

          <section className="mt-12">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-violet-700 dark:text-sky-200">Categories</p>
                <h2 className="mt-1 text-3xl font-black">What do you need?</h2>
              </div>
              <button onClick={() => openAfterLogin('/marketplace')} className="secondary-button min-h-10 px-4 py-2" type="button">
                View All
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => openAfterLogin(`/marketplace?category=${category.id}`)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-violet-300 dark:border-white/10 dark:bg-white/10"
                    type="button"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-violet-700 dark:bg-white/10 dark:text-sky-200">
                      <Icon size={21} />
                    </span>
                    <span className="font-black">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 dark:border-white/10 dark:bg-zylo-navy">
        <div className="page-pad flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Zylo makes campus buying and selling simple.</p>
          <Link to="/admin-login" className="inline-flex items-center gap-2 text-sm font-black text-violet-700 dark:text-sky-200">
            <LockKeyhole size={16} />
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
