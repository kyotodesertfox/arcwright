import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Home from './Home';
import Services from './pages/services';
import Portfolio from './pages/portfolio'; // <--- Ensure this is here

function App() {
  return (
    <Layout>
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/portfolio" element={<Portfolio />} /> {/* <--- And this */}
    </Routes>
    </Layout>
  );
}

export default App;
