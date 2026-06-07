import {
  CheckCircle2,
  ImageIcon,
  PackageSearch,
  ShieldAlert,
  Trash2,
  UserRound,
  Users,
  Wallet
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney } from '../lib/format.js';

export default function AdminDashboard() {
  const { analytics, products, sellers, markPayoutPaid, pushToast, user } = useApp();

  if (user.role !== 'admin') {
    return (
      <section className="section-band min-h-screen">
        <div className="page-pad">
          <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand text-white shadow-glow">
              <ShieldAlert size={28} />
            </span>
            <h1 className="mt-5 text-3xl font-black">Admin login required</h1>
            <p className="mt-3 font-semibold leading-7 text-slate-500 dark:text-slate-400">
              Admin access is restricted. Use the private admin login route to access moderation, payouts, reports, and marketplace controls.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const icons = [Users, ShieldAlert];

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <SectionHeader
          eyebrow="Admin control room"
          title="Manage Zylo in one place"
          copy="Simple controls for users, listings, reports, and seller payouts."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {analytics.cards
            .filter((card) => !['GMV', 'Commission'].includes(card.label))
            .map((card, index) => {
            const Icon = icons[index] || ShieldAlert;
            return (
              <div key={card.label} className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white">
                    <Icon size={22} />
                  </span>
                </div>
                <p className="mt-5 text-sm font-extrabold uppercase text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                  {card.value.toLocaleString('en-IN')}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="glass-panel rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <ShieldAlert size={21} />
                Reports handling
              </h2>
              <span className="mini-badge">{analytics.reports.length} active</span>
            </div>
            <div className="space-y-3">
              {analytics.reports.length ? analytics.reports.map((report) => (
                <div key={report.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black">{report.item}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{report.reason}</p>
                  </div>
                  <span className="mini-badge">{report.status}</span>
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  No reports yet.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Wallet size={21} />
                Seller payouts
              </h2>
              <span className="mini-badge">{analytics.payouts.length} pending</span>
            </div>
            <div className="space-y-3">
              {analytics.payouts.length ? analytics.payouts.map((payout) => (
                <div key={payout.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black">{payout.seller}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{formatMoney(payout.amount)}</p>
                  </div>
                  {payout.status === 'Paid' ? (
                    <span className="mini-badge text-lime-600 dark:text-lime-300">
                      <CheckCircle2 size={14} />
                      Paid
                    </span>
                  ) : (
                    <button onClick={() => markPayoutPaid(payout.id)} className="secondary-button min-h-10 px-4 py-2" type="button">
                      Mark as Paid
                    </button>
                  )}
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  No seller payouts yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
              <Users size={21} />
              User management
            </h2>
            <div className="space-y-3">
              {sellers.length ? sellers.map((seller) => (
                <div key={seller.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/10">
                  <div className="flex min-w-0 items-center gap-3">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} className="h-11 w-11 rounded-xl object-cover" />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        <UserRound size={20} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-black">{seller.name}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{seller.campus}</p>
                    </div>
                  </div>
                  <span className="mini-badge">Verified</span>
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  No users loaded yet.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
              <PackageSearch size={21} />
              Product management
            </h2>
            <div className="space-y-3">
              {products.length ? products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        <ImageIcon size={21} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-black">{product.title}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{formatMoney(product.price)} - {product.condition}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => pushToast('Listing flagged', `${product.title} sent to fake-product review queue.`, 'sky')}
                    className="secondary-button min-h-10 px-4 py-2"
                    type="button"
                  >
                    <Trash2 size={16} />
                    Remove fake
                  </button>
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  No product listings yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
