const Navbar = () => {
    return (
        <nav className="border-b-4 border-weld-red bg-weld-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

        {/* Logo / Business Name */}
        <div className="flex-shrink-0 flex items-center">
        <span className="text-2xl font-black tracking-tighter uppercase italic">
        Arcright <span className="text-weld-red">Welding</span>
        </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-10 text-sm font-bold uppercase tracking-widest">
        <a href="#services" className="text-weld-silver hover:text-weld-red transition-colors">Services</a>
        <a href="#portfolio" className="text-weld-silver hover:text-weld-red transition-colors">Portfolio</a>
        <a href="#contact" className="text-weld-silver hover:text-weld-red transition-colors">Contact</a>
        </div>

        {/* Call to Action Button */}
        <div className="hidden md:block">
        <button className="bg-weld-red hover:bg-red-700 text-white px-6 py-2 border border-weld-silver/20 font-bold uppercase text-xs tracking-widest transition-all">
        Request Quote
        </button>
        </div>

        </div>
        </div>
        </nav>
    );
};

export default Navbar;
