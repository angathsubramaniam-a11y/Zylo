import { motion } from 'framer-motion';
import { Eye, Heart, ImageIcon, MapPin, ShieldCheck, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney, getSeller } from '../lib/format.js';

export default function ProductCard({ product, compact = false }) {
  const { sellers, wishlist, toggleWishlist, user, removeListing } = useApp();
  const [imageFailed, setImageFailed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const seller = getSeller(sellers, product.sellerId);
  const sellerName = seller?.name || 'Seller profile unavailable';
  const hasImage = Boolean(product.image) && !imageFailed;
  const hasOriginalPrice = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const isSaved = wishlist.includes(product.id);
  const canRemove = user?.verified && user.id === product.sellerId;

  const handleRemove = async () => {
    if (!window.confirm(`Remove "${product.title}" from Zylo?`)) return;
    setRemoving(true);
    await removeListing(product);
    setRemoving(false);
  };

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="product-card"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className={`${compact ? 'h-44' : 'h-56'} relative overflow-hidden bg-slate-100 dark:bg-white/10`}>
          {hasImage ? (
            <img
              src={product.image}
              alt={product.title}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500">
              <span className="flex flex-col items-center gap-2 text-sm font-black">
                <ImageIcon size={32} />
                No image
              </span>
            </div>
          )}
          <div className={`absolute left-4 flex flex-wrap gap-2 ${canRemove ? 'top-16' : 'top-4'}`}>
            {product.featured && (
              <span className="mini-badge bg-white/90 text-violet-700">
                <Sparkles size={13} />
                Featured
              </span>
            )}
            {product.sold && <span className="mini-badge bg-slate-950 text-white">Sold</span>}
          </div>
        </div>
      </Link>

      {canRemove && (
        <button
          type="button"
          aria-label="Remove product"
          onClick={handleRemove}
          disabled={removing}
          className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-rose-100 bg-white text-rose-600 shadow-sm transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={18} />
        </button>
      )}

      <button
        type="button"
        aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => toggleWishlist(product.id)}
        className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 shadow-sm transition ${
          isSaved ? 'bg-pink-500 text-white' : 'bg-white text-slate-700 hover:text-pink-500'
        }`}
      >
        <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      <div className="space-y-3 p-4">
        <Link to={`/product/${product.id}`} className="block">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-950 dark:text-white">{product.title}</h3>
              {product.location && (
                <p className="mt-1 flex items-center gap-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <MapPin size={14} />
                  {product.location}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-violet-700 dark:text-sky-200">{formatMoney(product.price)}</p>
              {hasOriginalPrice && (
                <p className="text-xs font-bold text-slate-400 line-through">{formatMoney(product.originalPrice)}</p>
              )}
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-3">
          <Link to={seller?.id ? `/seller/${seller.id}` : '/marketplace'} className="flex min-w-0 items-center gap-2">
            {seller?.avatar ? (
              <img src={seller.avatar} alt={sellerName} className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-white/20" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 ring-2 ring-white dark:bg-white/10 dark:text-slate-300 dark:ring-white/20">
                <UserRound size={17} />
              </span>
            )}
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-extrabold text-slate-800 dark:text-white">
                <span className="truncate">{sellerName}</span>
                {seller?.verified && <ShieldCheck size={15} className="shrink-0 text-sky-500" />}
              </span>
              {seller?.responseTime && (
                <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{seller.responseTime} reply</span>
              )}
            </span>
          </Link>
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <Eye size={13} />
            {product.views}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
