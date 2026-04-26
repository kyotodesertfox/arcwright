import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="relative z-50 bg-weld-black border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-white">
        ARC<span className="text-weld-red">WRIGHT</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
            <Link
            key={link.name}
            to={link.path}
            className="text-sm uppercase font-bold tracking-widest text-zinc-400 hover:text-weld-red transition-colors"
            >
            {link.name}
            </Link>
        ))}
        </div>

        {/* Hamburger Button */}
        <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-[60]"
        >
        <motion.span
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        className="w-full h-1 bg-white block"
        />
        <motion.span
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        className="w-full h-1 bg-white block"
        />
        <motion.span
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        className="w-full h-1 bg-white block"
        />
        </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-zinc-950 z-50 flex flex-col justify-center items-center space-y-8"
            >
            {navLinks.map((link) => (
                <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)} // Close menu on click
                className="text-4xl font-black uppercase italic text-white hover:text-weld-red transition-colors"
                >
                {link.name}
                </Link>
            ))}
            </motion.div>
        )}
        </AnimatePresence>
        </nav>
    );
};

export default Navbar;
