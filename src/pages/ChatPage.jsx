import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, Image, Package, Send, Smile, UserRound, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney, getProduct, getSeller } from '../lib/format.js';

export default function ChatPage() {
  const { chatThreads, sellers, products, sendMessage, openChatForProduct } = useApp();
  const [params] = useSearchParams();
  const productParam = params.get('product');
  const [activeId, setActiveId] = useState(chatThreads[0]?.id);
  const [message, setMessage] = useState('');
  const activeThread = chatThreads.find((thread) => thread.id === activeId) || chatThreads[0];
  const seller = getSeller(sellers, activeThread?.sellerId);
  const product = getProduct(products, activeThread?.productId);

  const sortedThreads = useMemo(
    () => [...chatThreads].sort((a, b) => b.unread - a.unread),
    [chatThreads]
  );

  useEffect(() => {
    if (!productParam || !products.length) return;

    const selectedProduct = getProduct(products, productParam);
    if (!selectedProduct) return;

    const threadId = openChatForProduct(selectedProduct);
    setActiveId(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productParam, products]);

  useEffect(() => {
    if (!activeId && chatThreads[0]?.id) {
      setActiveId(chatThreads[0].id);
    }
  }, [activeId, chatThreads]);

  if (!activeThread) {
    return (
      <section className="section-band min-h-screen">
        <div className="page-pad">
          <SectionHeader
            eyebrow="Messages"
            title="No conversations yet"
            copy="When you message a seller from a product page, the conversation will appear here."
          />
          <div className="glass-panel rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-black">Your inbox is empty</h2>
            <p className="mt-2 font-semibold text-slate-500 dark:text-slate-400">
              Open a product and tap Chat with Seller to begin.
            </p>
            <Link to="/marketplace" className="primary-button mt-6">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendMessage(activeThread.id, message.trim());
    setMessage('');
  };

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <SectionHeader
          eyebrow="Messages"
          title="Chat with sellers"
          copy="Ask about condition, pickup location, and availability before you buy."
        />

        <div className="grid min-h-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-white/60 p-4 dark:border-white/10 lg:border-b-0 lg:border-r">
            <div className="space-y-3">
              {sortedThreads.map((thread) => {
                const threadSeller = getSeller(sellers, thread.sellerId);
                const threadProduct = getProduct(products, thread.productId);
                const isActive = thread.id === activeThread.id;
                const displaySellerName = threadSeller?.name || 'Seller profile unavailable';
                const displayProductTitle = threadProduct?.title || 'Product unavailable';
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveId(thread.id)}
                    className={`w-full rounded-[1.75rem] p-3 text-left transition hover:-translate-y-0.5 ${
                      isActive ? 'bg-brand text-white shadow-glow' : 'bg-white/70 text-slate-800 dark:bg-white/10 dark:text-white'
                    }`}
                    type="button"
                  >
                    <div className="flex gap-3">
                      <span className="relative shrink-0">
                        {threadSeller?.avatar ? (
                          <img src={threadSeller.avatar} alt={displaySellerName} className="h-14 w-14 rounded-2xl object-cover" />
                        ) : (
                          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                            <UserRound size={24} />
                          </span>
                        )}
                        <span className={`absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white ${thread.online ? 'bg-lime-400' : 'bg-slate-400'}`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-black">{displaySellerName}</span>
                          {thread.unread > 0 && <span className="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-black text-white">{thread.unread}</span>}
                        </span>
                        <span className={`mt-1 block truncate text-sm font-bold ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          {displayProductTitle}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-white/60 p-4 dark:border-white/10">
              <div className="flex min-w-0 items-center gap-3">
                {seller?.avatar ? (
                  <img src={seller.avatar} alt={seller.name} className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    <UserRound size={24} />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black">{seller?.name || 'Seller profile unavailable'}</h2>
                  <p className="flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                    {activeThread.online ? <Wifi size={15} className="text-lime-500" /> : <WifiOff size={15} />}
                    {activeThread.online ? 'Online now' : 'Offline'} - {product?.title || 'Product unavailable'}
                  </p>
                </div>
              </div>
              <div className="hidden rounded-2xl bg-white/70 p-2 pr-4 dark:bg-white/10 sm:flex sm:items-center sm:gap-3">
                {product?.image ? (
                  <img src={product.image} alt={product.title} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    <Package size={20} />
                  </span>
                )}
                <div>
                  <p className="max-w-40 truncate text-sm font-black">{product?.title || 'Product unavailable'}</p>
                  {product?.price && <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{formatMoney(product.price)}</p>}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <AnimatePresence initial={false}>
                {(activeThread.messages || []).length ? (activeThread.messages || []).map((item) => {
                  const mine = item.from === 'me';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[78%] rounded-[1.5rem] px-4 py-3 shadow-sm ${mine ? 'bg-brand text-white' : 'bg-white/85 text-slate-800 dark:bg-white/10 dark:text-white'}`}>
                        <p className="text-sm font-semibold leading-6">{item.text}</p>
                        <p className={`mt-1 flex items-center justify-end gap-1 text-[11px] font-bold ${mine ? 'text-white/75' : 'text-slate-400'}`}>
                          {item.at}
                          {mine && <CheckCheck size={14} className={item.seen ? 'text-sky-200' : 'text-white/60'} />}
                        </p>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="mx-auto mt-10 max-w-md rounded-2xl bg-slate-50 p-5 text-center dark:bg-white/10">
                    <p className="font-black text-slate-950 dark:text-white">Start the conversation</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Ask the seller about condition, pickup time, or final price.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {activeThread.typing && (
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex gap-1 rounded-full bg-white/75 px-3 py-2 dark:bg-white/10">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500 [animation-delay:240ms]" />
                  </span>
                  {(seller?.name || 'Seller').split(' ')[0]} is typing
                </div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-white/60 p-4 dark:border-white/10">
              <div className="flex items-center gap-2 rounded-[1.5rem] bg-white/75 p-2 dark:bg-white/10">
                <button className="icon-button" type="button" aria-label="Add image">
                  <Image size={19} />
                </button>
                <button className="icon-button" type="button" aria-label="Add reaction">
                  <Smile size={19} />
                </button>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm font-bold outline-none placeholder:text-slate-400"
                  placeholder="Message the seller..."
                />
                <button className="primary-button h-11 min-h-11 px-4" type="submit" aria-label="Send message">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
