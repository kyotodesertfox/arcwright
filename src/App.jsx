import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout';
import Home from './Home';
import Services from './pages/services';
import Portfolio from './pages/portfolio';
import Contact from './pages/contact';
import NotFound from './pages/NotFound';
import AdminPortal from './pages/admin/index';

function App() {

  const location = useLocation();

  useEffect(() => {
    // This talks to the script you just put in index.html
    if (window.gtag) {
      window.gtag('config', 'G-970PM79G6J', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return (
    <Layout>
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/admin" element={<AdminPortal />} />
    <Route path="*" element={<NotFound />} />
    </Routes>
    </Layout>
  );
}

export default App;
