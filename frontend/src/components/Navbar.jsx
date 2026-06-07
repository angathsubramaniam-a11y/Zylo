import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart,
  Menu,
  MessageCircle,
  Moon,
  PlusCircle,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
  Wallet,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { to: '/marketplace', label: 'Browse', icon: ShoppingBag },
  { to: '/sell', label: 'Sell', icon: PlusCircle },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/wishlist', label: 'Saved', icon: Heart },
  { to: '/wallet', label: 'Wallet', icon: Wallet }
];

export default function Navbar() {
  const { theme, toggleTheme, wishlist, user } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const profileName = user.name || user.email?.split('@')[0] || 'Profile';

  const submitSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    navigate(search ? `/marketplace?search=${encodeURIComponent(search)}` : '/marketplace');
    setOpen(false);
  };

  return (
    <header className="sticky-blur">
      <div className="page-pad">
        <div className="flex min-h-16 items-center gap-3">
          <Link to="/marketplace" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-sm">
              <ShoppingBag size={21} />
            </span>
            <span className="text-2xl font-black text-slate-950 dark:text-white">Zylo</span>
          </Link>

          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 lg:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="field h-11 pl-11"
                placeholder="Search products"
              />
            </label>
          </form>

          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-black transition ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} />
                  {item.label}
                  {item.to === '/wishlist' && wishlist.length > 0 && (
                    <span className="rounded-full bg-pink-500 px-1.5 text-[10px] text-white">{wishlist.length}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleTheme} className="icon-button hidden sm:inline-flex" aria-label="Toggle dark mode" type="button">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <Link to="/profile" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white md:flex">
              {user.avatar ? (
                <img src={user.avatar} alt={profileName} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  <UserRound size={16} />
                </span>
              )}
              <span className="max-w-24 truncate">{profileName}</span>
            </Link>

            <Link to="/sell" className="primary-button hidden min-h-10 px-4 py-2 sm:inline-flex xl:hidden">
              <PlusCircle size={17} />
              Sell
            </Link>

            <button onClick={() => setOpen((value) => !value)} className="icon-button xl:hidden" aria-label="Open menu" type="button">
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-zylo-navy xl:hidden"
          >
            <div className="page-pad space-y-4 py-4">
              <form onSubmit={submitSearch}>
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="field h-12 pl-11"
                    placeholder="Search products"
                  />
                </label>
              </form>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black ${
                          isActive ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white'
                        }`
                      }
                    >
                      <Icon size={17} />
                      {item.label}
                    </NavLink>
                  );
                })}
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black ${
                      isActive ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white'
                    }`
                  }
                >
                  <UserRound size={17} />
                  Profile
                </NavLink>
                <button
                  onClick={toggleTheme}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700 dark:bg-white/10 dark:text-white"
                  type="button"
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
