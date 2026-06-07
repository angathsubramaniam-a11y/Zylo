import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  UserRound
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney, getProduct, getSeller } from '../lib/format.js';

const detailTabs = ['Description', 'Seller', 'Reviews'];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, sellers, wishlist, toggleWishlist, buyNow, user, removeListing } = useApp();
  const product = getProduct(products, id);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('Description');
  const [paying, setPaying] = useState(false);
  const [removing, setRemoving] = useState(false);

  const seller = product ? getSeller(sellers, product.sellerId) : null;
  const sellerName = seller?.name || 'Seller profile unavailable';
  const sellerReviews = [];
  const productImages = product?.images?.length ? product.images.filter(Boolean) : product?.image ? [product.image] : [];
  const activeProductImage = productImages[activeImage];
  const hasOriginalPrice = product?.originalPrice && Number(product.originalPrice) > Number(product.price);
  const isSaved = product && wishlist.includes(product.id);
  const canRemove = product && user?.verified && user.id === product.sellerId;
  const similar = useMemo(
    () => (product ? products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4) : []),
    [products, product]
  );

  if (!product) {
    return (
      <section className="section-band min-h-screen">
        <div className="page-pad">
          <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-8 text-center">
            <h1 className="text-3xl font-black">Product not found</h1>
            <p className="mt-2 font-semibold text-slate-500 dark:text-slate-400">This listing may have been removed by admin.</p>
            <Link to="/marketplace" className="primary-button mt-6">Back to marketplace</Link>
          </div>
        </div>
      </section>
    );
  }

  const handleBuy = async () => {
    setPaying(true);
    await buyNow(product);
    setPaying(false);
  };

  const handleRemove = async () => {
    if (!window.confirm(`Remove "${product.title}" from Zylo?`)) return;
    setRemoving(true);
    const removed = await removeListing(product);
    setRemoving(false);
    if (removed) navigate('/marketplace');
  };

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
              {activeProductImage ? (
                <img src={activeProductImage} alt={product.title} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500">
                  <span className="flex flex-col items-center gap-2 text-sm font-black">
                    <ImageIcon size={42} />
                    No product image
                  </span>
                </div>
              )}
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {product.featured && <span className="mini-badge bg-white/85 text-violet-700">Featured</span>}
                <span className="mini-badge bg-white/85 text-slate-700">{product.condition}</span>
              </div>
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-3xl border-2 transition ${activeImage === index ? 'border-violet-500 shadow-glow' : 'border-white/60 dark:border-white/10'}`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
              </div>
            )}
          </motion.div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex flex-wrap gap-2">
                {(product.tags || []).map((tag) => (
                  <span key={tag} className="mini-badge">#{tag}</span>
                ))}
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950 dark:text-white">{product.title}</h1>
              {product.location && (
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <MapPin size={17} />
                  {product.location}
                </p>
              )}

              <div className="mt-5 flex items-end gap-3">
                <p className="text-4xl font-black text-violet-700 dark:text-sky-200">{formatMoney(product.price)}</p>
                {hasOriginalPrice && (
                  <p className="pb-1 text-sm font-bold text-slate-400 line-through">{formatMoney(product.originalPrice)}</p>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/10">
                <Link to={seller?.id ? `/seller/${seller.id}` : '/marketplace'} className="flex items-center gap-4">
                  {seller?.avatar ? (
                    <img src={seller.avatar} alt={sellerName} className="h-16 w-16 rounded-3xl object-cover" />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      <UserRound size={26} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
                      {sellerName}
                      {seller?.verified && <BadgeCheck size={19} className="text-sky-500" />}
                    </span>
                    {seller && (
                      <span className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                        <Star size={15} className="fill-amber-400 text-amber-400" />
                        {seller.rating} rating - {seller.reviews} reviews
                      </span>
                    )}
                  </span>
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-sky-500/10 p-4">
                  <ShieldCheck className="text-sky-500" />
                  <p className="mt-3 text-sm font-black">Verified</p>
                </div>
                <div className="rounded-3xl bg-pink-500/10 p-4">
                  <PackageCheck className="text-pink-500" />
                  <p className="mt-3 text-sm font-black">{product.condition}</p>
                </div>
                <div className="rounded-3xl bg-lime-400/20 p-4">
                  <ShoppingBag className="text-lime-600" />
                  <p className="mt-3 text-sm font-black">{product.sold ? 'Sold' : 'Available'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button disabled={product.sold || paying} onClick={handleBuy} className="primary-button disabled:cursor-not-allowed disabled:opacity-60" type="button">
                  <ShoppingBag size={19} />
                  {paying ? 'Processing...' : product.sold ? 'Sold Out' : 'Buy Now'}
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="secondary-button"
                  type="button"
                >
                  <Heart size={19} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Wishlist'}
                </button>
              </div>

              <Link to={`/chat?product=${encodeURIComponent(product.id)}`} className="secondary-button mt-3 w-full">
                <MessageCircle size={19} />
                Chat with Seller
              </Link>
              {canRemove && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 font-black text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
                  type="button"
                >
                  <Trash2 size={19} />
                  {removing ? 'Removing...' : 'Remove Product'}
                </button>
              )}
            </div>
          </motion.aside>
        </div>

        <div className="mt-10 glass-panel rounded-2xl p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {detailTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'tab-active' : 'text-slate-600 dark:text-slate-300'}`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <p className="max-w-4xl text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">{product.description}</p>
          )}

          {activeTab === 'Seller' && (
            <div className="grid gap-5 md:grid-cols-[280px_1fr]">
              <div className="rounded-[1.75rem] bg-white/65 p-5 dark:bg-white/10">
                {seller?.avatar ? (
                  <img src={seller.avatar} alt={sellerName} className="h-24 w-24 rounded-[1.75rem] object-cover" />
                ) : (
                  <span className="grid h-24 w-24 place-items-center rounded-[1.75rem] bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    <UserRound size={34} />
                  </span>
                )}
                <h3 className="mt-4 text-2xl font-black">{sellerName}</h3>
                <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                  {seller ? seller.bio || 'Seller profile details are not available yet.' : 'Seller profile is not available yet.'}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Rating', seller?.rating || 0],
                  ['Reviews', seller?.reviews || 0],
                  ['Joined', seller?.joined || 'Not available']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.75rem] bg-white/65 p-5 dark:bg-white/10">
                    <p className="text-sm font-extrabold uppercase text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-black gradient-text">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="grid gap-4 md:grid-cols-3">
              {sellerReviews.length ? (
                sellerReviews.map((review) => (
                  <article key={review.id} className="rounded-[1.75rem] bg-white/65 p-5 dark:bg-white/10">
                    <div className="mb-3 flex gap-1 text-amber-400">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{review.text}</p>
                    <p className="mt-4 text-sm font-black text-slate-500 dark:text-slate-400">{review.buyer}</p>
                  </article>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  No reviews yet.
                </p>
              )}
            </div>
          )}
        </div>

        {similar.length > 0 && (
          <div className="mt-12">
            <SectionHeader eyebrow="Similar products" title="You may also like" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
