import { ArrowDownToLine, CreditCard, IndianRupee, Wallet } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney } from '../lib/format.js';

export default function WalletPage() {
  const { wallet } = useApp();

  const cards = [
    { label: 'Total earnings', value: wallet.totalEarnings, icon: Wallet, tone: 'bg-violet-500' },
    { label: 'Pending balance', value: wallet.pendingBalance, icon: CreditCard, tone: 'bg-sky-500' },
    { label: 'Withdrawn', value: wallet.withdrawn, icon: ArrowDownToLine, tone: 'bg-lime-500' },
    { label: 'Commission paid', value: wallet.commissionPaid, icon: IndianRupee, tone: 'bg-pink-500' }
  ];

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <SectionHeader
          eyebrow="Seller wallet"
          title="Track your seller earnings"
          copy="See how much you earned, what is pending, and which payouts are complete."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-panel rounded-[2rem] p-5">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${card.tone} text-white shadow-lg`}>
                  <Icon size={22} />
                </span>
                <p className="mt-5 text-sm font-black uppercase text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{formatMoney(card.value)}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="glass-panel rounded-[2rem] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Transaction history</h2>
              <button className="secondary-button min-h-10 px-4 py-2" type="button">Export</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="text-xs font-black uppercase text-slate-400">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Commission</th>
                    <th className="pb-3">Seller earnings</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                  {wallet.transactions.length ? wallet.transactions.map((tx) => (
                    <tr key={tx.id} className="text-sm font-bold">
                      <td className="py-4">{tx.product}</td>
                      <td className="py-4">{formatMoney(tx.amount)}</td>
                      <td className="py-4 text-pink-500">{formatMoney(tx.commission)}</td>
                      <td className="py-4 text-lime-600 dark:text-lime-300">{formatMoney(tx.sellerEarnings)}</td>
                      <td className="py-4">
                        <span className="mini-badge">{tx.status}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                        No wallet transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-5">
              <h2 className="text-xl font-black">Commission model</h2>
              <p className="mt-4 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                Zylo keeps a small commission from each paid order. The rest is seller earnings.
              </p>
            </div>

            <div className="glass-panel rounded-[2rem] p-5">
              <h2 className="text-xl font-black">Payout note</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                Admin can mark seller payouts as paid after checking the transaction.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
