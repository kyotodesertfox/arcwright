import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Home from './Home';
import Services from './pages/services';
import Portfolio from './pages/portfolio';
import Contact from './pages/contact';

function App() {
  return (
    <Layout>
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/contact" element={<Contact />} />
    </Routes>
    </Layout>
  );
}

export default App;
