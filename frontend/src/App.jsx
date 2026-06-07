import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useApp } from './context/AppContext.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import NotFound from './pages/NotFound.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import SellProductPage from './pages/SellProductPage.jsx';
import SellerProfilePage from './pages/SellerProfilePage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: 'easeOut' }
};

function Page({ children }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

function RequireLogin({ children, adminOnly = false }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user?.verified) {
    const requestedPath = `${location.pathname}${location.search}`;
    const loginPath = location.pathname.startsWith('/admin') ? '/admin-login' : '/student-login';
    return <Navigate to={`${loginPath}?redirect=${encodeURIComponent(requestedPath)}`} replace state={{ from: requestedPath }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/marketplace" replace />;
  }

  return children;
}

function PublicOnly({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (user?.verified) {
    const isAdminLogin = location.pathname === '/admin-login';
    const isStudentLogin = location.pathname === '/student-login' || location.pathname === '/auth';

    if ((isAdminLogin && user.role !== 'admin') || (isStudentLogin && user.role === 'admin')) {
      return children;
    }

    const requestedPath = new URLSearchParams(location.search).get('redirect') || '';
    const safeRedirect = requestedPath.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '';
    const defaultPath = user.role === 'admin' ? '/admin' : '/marketplace';
    const redirectPath =
      user.role === 'admin'
        ? safeRedirect.startsWith('/admin') ? safeRedirect : defaultPath
        : safeRedirect && !safeRedirect.startsWith('/admin') ? safeRedirect : defaultPath;

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/student-login"
              element={<Page><PublicOnly><AuthPage audience="student" /></PublicOnly></Page>}
            />
            <Route
              path="/admin-login"
              element={<Page><PublicOnly><AuthPage audience="admin" /></PublicOnly></Page>}
            />
            <Route
              path="/auth"
              element={<Page><PublicOnly><AuthPage audience="student" /></PublicOnly></Page>}
            />
            <Route path="/" element={<Page><LandingPage /></Page>} />
            <Route path="/marketplace" element={<Page><RequireLogin><MarketplacePage /></RequireLogin></Page>} />
            <Route path="/product/:id" element={<Page><RequireLogin><ProductDetailsPage /></RequireLogin></Page>} />
            <Route path="/sell" element={<Page><RequireLogin><SellProductPage /></RequireLogin></Page>} />
            <Route path="/wishlist" element={<Page><RequireLogin><WishlistPage /></RequireLogin></Page>} />
            <Route path="/chat" element={<Page><RequireLogin><ChatPage /></RequireLogin></Page>} />
            <Route path="/wallet" element={<Page><RequireLogin><WalletPage /></RequireLogin></Page>} />
            <Route path="/profile" element={<Page><RequireLogin><ProfilePage /></RequireLogin></Page>} />
            <Route path="/seller/:id" element={<Page><RequireLogin><SellerProfilePage /></RequireLogin></Page>} />
            <Route path="/admin" element={<Page><RequireLogin adminOnly><AdminDashboard /></RequireLogin></Page>} />
            <Route path="*" element={<Page><RequireLogin><NotFound /></RequireLogin></Page>} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </div>
  );
}
