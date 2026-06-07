import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-8 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand text-white shadow-glow">
            <Compass size={28} />
          </span>
          <h1 className="mt-5 text-4xl font-black">Lost in the campus feed</h1>
          <p className="mt-3 font-semibold text-slate-500 dark:text-slate-400">
            This route does not exist yet, but the marketplace is buzzing.
          </p>
          <Link to="/marketplace" className="primary-button mt-6">Back to marketplace</Link>
        </div>
      </div>
    </section>
  );
}
