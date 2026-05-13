import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-zinc-950 border-t-4 border-weld-red">

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Brand Column */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-10 bg-weld-red inline-block flex-shrink-0" />
                        <span className="text-2xl font-black italic tracking-tighter text-white">
                            ARC<span className="text-weld-red">WRIGHT</span>
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        Precision fabrication and structural welding for Jacksonville's toughest projects. Built for durability.
                    </p>
                    <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] font-bold">
                        Jacksonville, FL // EST. 2026
                    </p>
                </div>

                {/* Quick Links */}
                <div className="md:flex md:justify-center">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Navigate</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Services', path: '/services' },
                                { name: 'Portfolio', path: '/portfolio' },
                                { name: 'Contact', path: '/contact' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-zinc-300 hover:text-weld-red transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-3 group"
                                    >
                                        <span className="w-4 h-px bg-zinc-700 group-hover:w-6 group-hover:bg-weld-red transition-all duration-300" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact / CTA */}
                <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4">Get an Estimate</h3>
                    <a
                        href="tel:904-914-0648"
                        className="flex items-center gap-3 text-white hover:text-weld-red transition-colors font-mono font-bold text-xl mb-6"
                    >
                        <span className="w-2 h-2 bg-weld-red rounded-full animate-pulse flex-shrink-0" />
                        904-914-0648
                    </a>
                    <Link
                        to="/contact"
                        className="inline-block bg-weld-red text-white text-xs font-black uppercase tracking-widest px-6 py-3 hover:bg-red-700 transition-colors"
                    >
                        Submit Work Order →
                    </Link>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-zinc-900 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-zinc-400 text-xs uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} ArcWright Welding | Jacksonville, FL
                    </p>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">
                        Crafted by{' '}
                        <a href="mailto:zenko18@gmail.com?subject=ArcWright%20Website" className="hover:text-white transition-colors">
                            Justin
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
