import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function WishlistPage() {
  const { products, wishlist } = useApp();
  const saved = products.filter((product) => wishlist.includes(product.id));

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <SectionHeader
          eyebrow="Wishlist"
          title="Saved drops for later"
          copy="Keep an eye on products before you chat, negotiate, or buy."
        />

        {saved.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-pink-500 text-white shadow-glow">
              <Heart size={26} />
            </span>
            <h2 className="mt-5 text-3xl font-black">Your wishlist is empty</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Save campus drops and compare them before buying.</p>
            <Link to="/marketplace" className="primary-button mt-6">
              <ShoppingBag size={19} />
              Explore marketplace
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
