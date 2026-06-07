import { AnimatePresence, motion } from 'framer-motion';
import { PlusCircle, Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonGrid from '../components/SkeletonGrid.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney } from '../lib/format.js';

export default function MarketplacePage() {
  const { products, categories } = useApp();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [maxPrice, setMaxPrice] = useState(60000);
  const [sortBy, setSortBy] = useState('newest');
  const [visible, setVisible] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    setQuery(params.get('search') || '');
    setCategory(params.get('category') || 'all');
  }, [params]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return products
      .filter((product) => (category === 'all' ? true : product.category === category))
      .filter((product) => Number(product.price) <= maxPrice)
      .filter((product) => {
        if (!text) return true;
        return [product.title, product.description, product.category, ...(product.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(text);
      })
      .sort((a, b) => {
        if (sortBy === 'low') return Number(a.price) - Number(b.price);
        if (sortBy === 'high') return Number(b.price) - Number(a.price);
        return String(b.id).localeCompare(String(a.id));
      });
  }, [products, category, maxPrice, query, sortBy]);

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (query.trim()) next.search = query.trim();
    if (category !== 'all') next.category = category;
    setParams(next);
    setVisible(8);
  };

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-violet-600 dark:text-sky-200">Marketplace</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Find what you need on campus</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                Search products, pick a category, then chat or buy. That is the whole flow.
              </p>
            </div>
            <Link to="/sell" className="primary-button w-full lg:w-auto">
              <PlusCircle size={18} />
              Sell Product
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Search</span>
                <span className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="field h-12 pl-11"
                    placeholder="Books, cycles, phone..."
                  />
                </span>
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="field">
                  <option value="all">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="mb-2 flex items-center justify-between text-sm font-black text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal size={17} />
                    Max price
                  </span>
                  <span>{formatMoney(maxPrice)}</span>
                </span>
                <input
                  type="range"
                  min="500"
                  max="60000"
                  step="500"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="w-full accent-violet-600"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Sort</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="field">
                  <option value="newest">Newest first</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </label>

              <button className="primary-button mt-4 w-full" type="submit">
                <Search size={18} />
                Apply
              </button>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
              <p className="font-black text-slate-950 dark:text-white">Quick categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCategory('all');
                    setParams({});
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${category === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white'}`}
                  type="button"
                >
                  All
                </button>
                {categories.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCategory(item.id);
                      setParams({ category: item.id });
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-black ${category === item.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white'}`}
                    type="button"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{filtered.length} products found</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Open a product to chat, buy, or save it.</p>
              </div>
              <Link to="/wishlist" className="secondary-button min-h-10 px-4 py-2">
                <ShoppingBag size={17} />
                View Saved
              </Link>
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.length ? (
                  <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.slice(0, visible).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/10"
                  >
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      <X size={24} />
                    </span>
                    <h3 className="mt-4 text-2xl font-black">No products found</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Try all categories, increase the price, or search a smaller word.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {!loading && visible < filtered.length && (
              <div className="mt-8 text-center">
                <button onClick={() => setVisible((value) => value + 6)} className="secondary-button" type="button">
                  Show more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
