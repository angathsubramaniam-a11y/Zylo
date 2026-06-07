import { BadgeCheck, MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getSeller } from '../lib/format.js';

export default function SellerProfilePage() {
  const { id } = useParams();
  const { sellers, products, pushToast } = useApp();
  const seller = getSeller(sellers, id);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  if (!seller) {
    return (
      <section className="section-band min-h-screen">
        <div className="page-pad">
          <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-8 text-center">
            <h1 className="text-3xl font-black">Seller not found</h1>
            <Link to="/marketplace" className="primary-button mt-6">Browse marketplace</Link>
          </div>
        </div>
      </section>
    );
  }

  const sellerProducts = products.filter((product) => product.sellerId === seller.id);

  const submitReview = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setReviews((items) => [
      { id: `review-${Date.now()}`, sellerId: seller.id, buyer: 'You', rating, text: text.trim() },
      ...items
    ]);
    setText('');
    pushToast('Review posted', `You rated ${seller.name} ${rating} stars.`, 'mint');
  };

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/65 p-6 shadow-card backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-8">
          <div className="ambient-field opacity-60" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img src={seller.avatar} alt={seller.name} className="h-28 w-28 rounded-[2rem] object-cover shadow-card" />
              <div>
                <p className="mini-badge mb-3">{seller.premium ? 'Premium seller' : 'Verified seller'}</p>
                <h1 className="flex flex-wrap items-center gap-2 text-4xl font-black text-slate-950 dark:text-white">
                  {seller.name}
                  <BadgeCheck size={28} className="text-sky-500" />
                </h1>
                <p className="mt-2 max-w-2xl font-semibold leading-7 text-slate-600 dark:text-slate-300">{seller.bio}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/chat" className="primary-button">
                <MessageCircle size={19} />
                Message
              </Link>
              <span className="secondary-button">
                <Star size={19} className="fill-amber-400 text-amber-400" />
                {seller.rating} rating
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ['Campus', seller.campus],
            ['Joined', seller.joined],
            ['Reviews', seller.reviews],
            ['Reply time', seller.responseTime]
          ].map(([label, value]) => (
            <div key={label} className="glass-panel rounded-[1.75rem] p-5">
              <p className="text-sm font-extrabold uppercase text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <SectionHeader eyebrow="Seller listings" title={`${seller.name.split(' ')[0]}'s live drops`} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sellerProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="mb-5 text-2xl font-black">Reviews</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-[1.75rem] bg-white/65 p-5 dark:bg-white/10">
                  <div className="mb-3 flex gap-1 text-amber-400">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="font-bold leading-7 text-slate-700 dark:text-slate-200">{review.text}</p>
                  <p className="mt-4 text-sm font-black text-slate-500 dark:text-slate-400">{review.buyer}</p>
                </article>
              ))}
            </div>
          </div>

          <form onSubmit={submitReview} className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-2xl font-black">Rate seller</h2>
            <div className="mt-5 flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`grid h-11 w-11 place-items-center rounded-2xl ${value <= rating ? 'bg-amber-400 text-white' : 'bg-white/70 text-slate-400 dark:bg-white/10'}`}
                    type="button"
                  >
                    <Star size={19} fill="currentColor" />
                  </button>
                );
              })}
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="field mt-5 min-h-32 resize-none"
              placeholder="Write a quick review..."
            />
            <button className="primary-button mt-4 w-full" type="submit">Post review</button>
          </form>
        </div>
      </div>
    </section>
  );
}
