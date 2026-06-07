import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-violet-100/70 bg-white/45 py-10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="page-pad">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-black gradient-text">Zylo</p>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Simple campus buying and selling for students.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <Link to="/marketplace" className="hover:text-violet-600">Marketplace</Link>
            <Link to="/sell" className="hover:text-violet-600">Sell</Link>
            <Link to="/chat" className="hover:text-violet-600">Chat</Link>
            <Link to="/student-login" className="hover:text-violet-600">Student Login</Link>
            <Link to="/admin-login" className="hover:text-violet-600">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
