import LogoIcon from '../assets/logo.svg';

const Footer = () => {
    return (
        <footer className="relative bg-zinc-950 py-12 px-6 border-t border-zinc-900 overflow-visible">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">

        {/* Main Footer Content */}
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-2">
        CRAFTED FOR ARCWRIGHT BY <span className="text-zinc-200"><a href="mailto:zenko18@gmail.com?subject=ArcWright%20Website">Justin</a></span>
        </p>
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-2">
        © {new Date().getFullYear()} ARCWRIGHT WELDING | JACKSONVILLE, FL
        </p>
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest font-bold">
        Built for Durability
        </p>

        {/* 🛠️ The Absolute Logo Overlay */}
        <div className="absolute top-0 right-6 md:right-12 -translate-y-1/2 z-10">
        <img
        src={LogoIcon}
        alt=""
        className="w-24 h-24 md:w-48 md:h-48 brightness-150 pointer-events-none"
        />
        </div>
        </div>

        </footer>
    );
};

export default Footer;
