import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="relative z-50 bg-zinc-950 border-b-2 border-weld-red px-6 py-4">
            {/* Gradient accent stripe at very top */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-900 via-weld-red to-red-900" />

            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 text-2xl font-black italic tracking-tighter text-white group py-2">
                    <span className="w-1.5 h-8 bg-weld-red inline-block group-hover:h-10 transition-all duration-300" />
                    <span>ARC<span className="text-weld-red">WRIGHT</span></span>
                    <span className="text-orange-500 text-base font-medium not-italic tracking-normal">WELDING</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-sm uppercase font-bold tracking-widest text-zinc-300 hover:text-weld-red transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-weld-red group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                </div>

                {/* Hamburger Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden text-white flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
                    aria-label="Open menu"
                >
                    <span className="w-6 h-0.5 bg-white block" />
                    <span className="w-6 h-0.5 bg-white block" />
                    <span className="w-4 h-0.5 bg-weld-red block self-start" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-zinc-950 z-50 flex flex-col"
                    >
                        {/* Red top stripe */}
                        <div className="h-[3px] bg-gradient-to-r from-red-900 via-weld-red to-red-900 flex-shrink-0" />

                        {/* Header row */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-shrink-0">
                            <Link
                                to="/"
                                onClick={() => setIsOpen(false)}
                                className="text-xl font-black italic tracking-tighter text-white"
                            >
                                ARC<span className="text-weld-red">WRIGHT</span>
                                <span className="text-zinc-500 text-sm font-medium not-italic ml-2 tracking-normal">WELDING</span>
                            </Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-400 hover:text-white transition-colors w-10 h-10 flex items-center justify-center"
                                aria-label="Close menu"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Nav links */}
                        <div className="flex flex-col flex-grow justify-center px-8">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.2 }}
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 py-5 text-3xl font-black uppercase italic text-white hover:text-weld-red transition-colors group border-b border-zinc-900 last:border-0"
                                    >
                                        <span className="w-0 h-0.5 bg-weld-red group-hover:w-5 transition-all duration-300 flex-shrink-0" />
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Phone CTA pinned at bottom */}
                        <div className="px-8 py-8 border-t border-zinc-800 flex-shrink-0">
                            <a
                                href="tel:904-914-0648"
                                className="flex items-center gap-3 text-white hover:text-weld-red transition-colors group"
                            >
                                <span className="w-2 h-2 bg-weld-red rounded-full animate-pulse flex-shrink-0" />
                                <div>
                                    <p className="font-mono font-bold text-xl tracking-tighter">904-914-0648</p>
                                    <p className="text-zinc-600 text-xs uppercase tracking-widest font-bold">Free Estimates</p>
                                </div>
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
