import {
  FiBookOpen,
  FiCpu,
  FiHeadphones,
  FiHome,
  FiPenTool,
  FiShoppingBag,
  FiTruck,
  FiWatch,
  FiZap
} from 'react-icons/fi';

export const categories = [
  { id: 'books', name: 'Books', icon: FiBookOpen, items: 0, color: 'from-sky-400 to-indigo-500' },
  { id: 'electronics', name: 'Electronics', icon: FiCpu, items: 0, color: 'from-violet-500 to-pink-500' },
  { id: 'furniture', name: 'Furniture', icon: FiHome, items: 0, color: 'from-amber-400 to-pink-500' },
  { id: 'hostel', name: 'Hostel Essentials', icon: FiShoppingBag, items: 0, color: 'from-emerald-400 to-sky-500' },
  { id: 'fashion', name: 'Fashion', icon: FiZap, items: 0, color: 'from-pink-500 to-rose-500' },
  { id: 'gadgets', name: 'Gadgets', icon: FiHeadphones, items: 0, color: 'from-cyan-400 to-violet-500' },
  { id: 'accessories', name: 'Accessories', icon: FiWatch, items: 0, color: 'from-fuchsia-500 to-indigo-500' },
  { id: 'cycles', name: 'Cycles', icon: FiTruck, items: 0, color: 'from-lime-400 to-sky-500' },
  { id: 'study', name: 'Study Materials', icon: FiPenTool, items: 0, color: 'from-indigo-500 to-sky-500' }
];

export const featureHighlights = [
  'Verified student-only access',
  'Realtime buyer-seller chat',
  'Razorpay checkout support',
  'Seller wallet and payouts',
  'Admin reports and moderation',
  'Dark mode and responsive UI'
];
