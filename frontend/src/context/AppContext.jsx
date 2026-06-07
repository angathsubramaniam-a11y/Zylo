import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { categories } from '../data/appConfig';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);
const userStorageKey = 'zylo-user';
const chatStorageKey = 'zylo-chat-threads';

const storedTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('zylo-theme') || 'light';
};

const defaultUser = {
  id: '',
  name: '',
  email: '',
  role: 'buyer',
  campus: '',
  verified: false,
  avatar: ''
};

function isUuid(value = '') {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function loadRazorpayCheckout() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout can only open in the browser.'));
  }
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-zylo-razorpay]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Razorpay checkout could not load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.zyloRazorpay = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay checkout could not load. Check your internet connection.'));
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout({ order, product, user }) {
  await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Zylo',
      description: product.title,
      order_id: order.id,
      prefill: {
        name: user.name,
        email: user.email
      },
      notes: {
        productId: product.id,
        sellerId: product.sellerId
      },
      theme: {
        color: '#7c3aed'
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment was closed before completion.'))
      }
    });

    checkout.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed. Try again.'));
    });

    checkout.open();
  });
}

function storedUser() {
  if (typeof window === 'undefined') return defaultUser;

  try {
    const stored = localStorage.getItem(userStorageKey);
    if (!stored) return defaultUser;

    const parsed = JSON.parse(stored);
    const name = String(parsed.name || '').trim();
    const email = String(parsed.email || '').trim();
    const sessionText = `${parsed.id || ''} ${name} ${email}`.toLowerCase();
    const isSeededAccount = sessionText.includes(['mo', 'ck'].join(''));
    const hasProfileId = parsed.role === 'admin' || isUuid(parsed.id);

    if (!parsed.verified || !name || !email || isSeededAccount || !hasProfileId) {
      localStorage.removeItem(userStorageKey);
      return defaultUser;
    }

    return {
      ...defaultUser,
      ...parsed,
      name,
      email,
      verified: true
    };
  } catch {
    localStorage.removeItem(userStorageKey);
    return defaultUser;
  }
}

function storedChatThreads() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(chatStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(chatStorageKey);
    return [];
  }
}

const emptyWallet = {
  totalEarnings: 0,
  pendingBalance: 0,
  withdrawn: 0,
  commissionPaid: 0,
  transactions: []
};

const emptyAnalytics = {
  cards: [
    { label: 'Active Users', value: 0 },
    { label: 'Reports Solved', value: 0 }
  ],
  reports: [],
  payouts: []
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(storedTheme);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [chatThreads, setChatThreads] = useState(storedChatThreads);
  const [wallet, setWallet] = useState(emptyWallet);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [user, setUser] = useState(storedUser);
  const socketRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('zylo-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user.verified) {
      localStorage.setItem(userStorageKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(userStorageKey);
    }
  }, [user]);

  useEffect(() => {
    if (user.verified) {
      localStorage.setItem(chatStorageKey, JSON.stringify(chatThreads));
    }
  }, [chatThreads, user.verified]);

  useEffect(() => {
    if (user.verified && user.role !== 'admin' && !isUuid(user.id)) {
      localStorage.removeItem(userStorageKey);
      setUser(defaultUser);
      pushToast('Please login again', 'Your old session was cleared so Zylo can use your Supabase profile.', 'sky');
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;

    api
      .products()
      .then((response) => {
        if (!ignore) {
          setProducts(response.products || []);
        }
      })
      .catch(() => null);

    api
      .sellers()
      .then((response) => {
        if (!ignore) {
          setSellers(response.sellers || []);
        }
      })
      .catch(() => null);

    api
      .adminAnalytics()
      .then((response) => {
        if (!ignore) {
          setAnalytics((current) => ({
            ...current,
            reports: response.reports || [],
            payouts: response.payouts || [],
            cards: [
              { label: 'Active Users', value: response.activeUsers || 0 },
              { label: 'Reports Solved', value: response.reportsSolved || 0 }
            ]
          }));
        }
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const socket = io('/', {
      path: '/socket.io',
      autoConnect: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-campus', { campus: user.campus, userId: user.id });
    });

    socket.on('message:new', (message) => {
      if (message.fromId === user.id) return;
      setChatThreads((threads) =>
        threads.map((thread) =>
          thread.id === message.threadId
            ? { ...thread, unread: thread.unread + 1, messages: [...(thread.messages || []), message] }
            : thread
        )
      );
      pushToast('Message received', message.text);
    });

    socket.on('notification:new', (notification) => {
      setNotifications((items) => [notification, ...items]);
      pushToast(notification.title, notification.body);
    });

    socket.on('connect_error', () => {
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [user.campus, user.id]);

  function pushToast(title, body, tone = 'violet') {
    const toast = { id: crypto.randomUUID(), title, body, tone };
    setToasts((items) => [toast, ...items].slice(0, 4));
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== toast.id));
    }, 4200);
  }

  function toggleTheme() {
    setTheme((value) => (value === 'dark' ? 'light' : 'dark'));
  }

  function toggleWishlist(productId) {
    setWishlist((items) => {
      const exists = items.includes(productId);
      const next = exists ? items.filter((id) => id !== productId) : [...items, productId];
      const product = products.find((item) => item.id === productId);
      pushToast(exists ? 'Removed from wishlist' : 'Saved to wishlist', product?.title || 'Product updated');
      return next;
    });
  }

  async function updateProfile(profile) {
    const nextUser = {
      ...user,
      name: String(profile.name || '').trim(),
      campus: String(profile.campus || '').trim(),
      role: user.role === 'admin' ? 'admin' : profile.role || user.role,
      avatar: String(profile.avatar || '').trim()
    };

    if (!nextUser.name) {
      pushToast('Name required', 'Enter your name before saving.', 'sky');
      return false;
    }

    try {
      if (isUuid(user.id) && user.role !== 'admin') {
        const response = await api.updateProfile({
          id: user.id,
          name: nextUser.name,
          campus: nextUser.campus,
          role: nextUser.role,
          avatar: nextUser.avatar,
          avatarDataUrl: profile.avatarDataUrl || ''
        });

        if (response.profile) {
          nextUser.avatar = response.profile.avatar || nextUser.avatar;
          setSellers((items) =>
            items.map((seller) => (seller.id === user.id ? { ...seller, ...response.profile } : seller))
          );
        }
      }

      setUser(nextUser);
      pushToast('Profile saved', 'Your profile details were updated.', 'mint');
      return true;
    } catch (error) {
      pushToast('Profile not saved', error.message || 'Could not update your profile.', 'sky');
      return false;
    }
  }

  function logout() {
    supabase?.auth.signOut().catch(() => null);
    setUser(defaultUser);
    setWishlist([]);
    setNotifications([]);
    setChatThreads([]);
    setWallet(emptyWallet);
    localStorage.removeItem(userStorageKey);
    localStorage.removeItem(chatStorageKey);
    pushToast('Logged out', 'You have been signed out of Zylo.', 'sky');
  }

  async function createListing(payload) {
    if (!isUuid(user.id)) {
      setUser(defaultUser);
      pushToast('Please login again', 'A valid Supabase seller profile is required before publishing.', 'sky');
      return null;
    }

    const draft = {
      id: `p-${Date.now()}`,
      title: payload.title,
      price: Number(payload.price || 0),
      originalPrice: Number(payload.price || 0),
      category: payload.category,
      condition: payload.condition,
      location: user.campus || '',
      sellerId: user.id || '',
      featured: false,
      trending: false,
      sold: false,
      tags: payload.tags,
      views: 0,
      image: '',
      images: [],
      description: payload.description,
      imageDataUrl: payload.imageDataUrl || ''
    };

    try {
      const response = await api.createListing(draft);
      const product = response.product || draft;
      setProducts((items) => [product, ...items.filter((item) => item.id !== product.id)]);
      pushToast('Listing is live', `${product.title} is now available on campus.`, 'sky');
      return product;
    } catch (error) {
      pushToast('Listing not saved', error.message || 'Connect Supabase before publishing listings.', 'sky');
      return null;
    }
  }

  async function removeListing(product) {
    if (!product) return false;

    if (product.sellerId !== user.id) {
      pushToast('Cannot remove listing', 'Only the seller who posted this product can remove it.', 'sky');
      return false;
    }

    try {
      await api.deleteListing(product.id, user.id);
      setProducts((items) => items.filter((item) => item.id !== product.id));
      setWishlist((items) => items.filter((id) => id !== product.id));
      pushToast('Product removed', `${product.title} was removed from Zylo.`, 'mint');
      return true;
    } catch (error) {
      pushToast('Remove failed', error.message || 'Could not remove this product right now.', 'sky');
      return false;
    }
  }

  async function buyNow(product) {
    const commission = Math.round(product.price * 0.05);
    const sellerEarnings = product.price - commission;

    try {
      const order = await api.checkout({
        productId: product.id,
        sellerId: product.sellerId,
        amount: product.price
      });
      const payment = await openRazorpayCheckout({ order, product, user });

      const verified = await api.verifyPayment({
        productId: product.id,
        sellerId: product.sellerId,
        amount: product.price,
        razorpayOrderId: payment.razorpay_order_id || order.id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature
      });
      if (verified.wallet) {
        setWallet(verified.wallet);
      }
      setProducts((items) => items.map((item) => (item.id === product.id ? { ...item, sold: true } : item)));
      pushToast('Payment success', `Rs. ${commission} platform commission, Rs. ${sellerEarnings} to seller.`, 'mint');
      return order;
    } catch (error) {
      const cancelled = String(error.message || '').toLowerCase().includes('closed');
      pushToast(cancelled ? 'Payment cancelled' : 'Payment unavailable', error.message || 'Connect Razorpay and Supabase before accepting payments.', 'sky');
      return null;
    }
  }

  function openChatForProduct(product) {
    if (!product) return '';

    const threadId = `thread-${user.id || 'student'}-${product.id}`;
    const nextThread = {
      id: threadId,
      sellerId: product.sellerId,
      productId: product.id,
      unread: 0,
      online: true,
      typing: false,
      messages: []
    };

    setChatThreads((threads) => {
      const exists = threads.some((thread) => thread.id === threadId);
      if (exists) {
        return threads.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread));
      }

      return [nextThread, ...threads];
    });

    return threadId;
  }

  function sendMessage(threadId, text) {
    const message = {
      id: crypto.randomUUID(),
      threadId,
      from: 'me',
      fromId: user.id,
      text,
      at: 'Now',
      seen: false
    };

    setChatThreads((threads) =>
      threads.map((thread) =>
        thread.id === threadId ? { ...thread, messages: [...(thread.messages || []), message], unread: 0 } : thread
      )
    );
    socketRef.current?.emit('message:send', message);
  }

  async function markPayoutPaid(payoutId) {
    try {
      const response = await api.markPayoutPaid(payoutId);
      setAnalytics((current) => ({
        ...current,
        payouts: current.payouts.map((payout) => (payout.id === payoutId ? response.payout || { ...payout, status: 'Paid' } : payout))
      }));
      pushToast('Payout marked paid', 'Seller payout status updated in admin.', 'sky');
    } catch {
      pushToast('Payout update failed', 'Connect Supabase or try again after the API is available.', 'sky');
    }
  }

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      user,
      setUser,
      products,
      categories,
      sellers,
      wishlist,
      notifications,
      toasts,
      chatThreads,
      wallet,
      analytics,
      toggleWishlist,
      updateProfile,
      logout,
      createListing,
      removeListing,
      buyNow,
      openChatForProduct,
      sendMessage,
      markPayoutPaid,
      pushToast
    }),
    [theme, user, products, sellers, wishlist, notifications, toasts, chatThreads, wallet, analytics]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return value;
}
