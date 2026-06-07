import { useLocation } from 'react-router-dom';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import ToastStack from './ToastStack.jsx';

const standaloneRoutes = ['/', '/student-login', '/admin-login', '/auth'];

export default function Layout({ children }) {
  const location = useLocation();
  const isStandaloneRoute = standaloneRoutes.includes(location.pathname);

  return (
    <>
      {!isStandaloneRoute && <Navbar />}
      <main>{children}</main>
      {!isStandaloneRoute && <Footer />}
      <ToastStack />
    </>
  );
}
