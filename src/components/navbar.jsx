import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="border-b-4 border-weld-red bg-weld-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center">

        <Link to="/" className="flex-shrink-0">
        <span className="text-2xl font-black uppercase italic text-white">
        Arcright <span className="text-weld-red">Welding</span>
        </span>
        </Link>

        <div className="hidden md:flex space-x-10 text-sm font-bold uppercase tracking-widest">
        <Link to="/services" className="text-weld-silver hover:text-weld-red transition-colors">
        Services
        </Link>
        <Link to="/portfolio" className="text-weld-silver hover:text-weld-red transition-colors">
        Portfolio
        </Link>
        <Link to="/contact" className="text-weld-silver hover:text-weld-red transition-colors">
        Contact
        </Link>
        </div>
        </div>
        </nav>
    );
};

export default Navbar;
