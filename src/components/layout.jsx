import Navbar from './navbar';
import Footer from './footer';

const Layout = ({ children }) => {
    return (
        // min-h-screen ensures the black background covers the whole page
        <div className="min-h-screen flex flex-col bg-weld-black text-white font-sans">
        <Navbar />

        {/* The main tag grows to push the footer down */}
        <main className="flex-grow">
        {children}
        </main>

        <Footer />
        </div>
    );
};

export default Layout;
