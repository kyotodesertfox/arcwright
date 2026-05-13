import { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [logoLoaded, setLogoLoaded] = useState(false);

    return (
        <section className="py-16 md:py-24 px-6 overflow-hidden">
            <title>ArcWright Welding | Custom Fabrication & Structural Steel | Jacksonville, FL</title>
            <meta name="description" content="ArcWright Welding specializes in structural steel, TIG/MIG welding, custom fabrication, and mobile on-site repair across Jacksonville, FL. Free estimates — call 904-914-0648." />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-6xl md:text-8xl font-black uppercase italic text-zinc-900 leading-none">
                        Precision <br />
                        <span className="text-weld-red">Fabrication</span>
                    </h1>

                    <div className="mt-8 border-l-4 border-weld-silver pl-6 max-w-2xl">
                        <p className="text-zinc-600 text-xl font-medium tracking-wide">
                            Structural integrity for Jacksonville's toughest projects.
                            From custom gates to heavy-duty equipment repair.
                        </p>
                    </div>

                    <div className="mt-10">
                        <Link to="/contact">
                            <button className="bg-weld-red hover:bg-red-700 text-white font-bold py-4 px-8 uppercase tracking-widest transition-all">
                                Discuss Your Project
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Animated scorpion logo */}
                <div className="flex-shrink-0 w-40 sm:w-52 md:w-60 lg:w-72 self-center relative aspect-[6400/7520]">
                    {/* Placeholder shown while SVG loads */}
                    {!logoLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-1.5 h-16 bg-weld-red animate-pulse" />
                        </div>
                    )}
                    <object
                        type="image/svg+xml"
                        data="/logo.svg"
                        className={`w-full h-full transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                        aria-label="ArcWright Scorpion Logo"
                        onLoad={() => setLogoLoaded(true)}
                    />
                </div>

            </div>
        </section>
    );
};

export default Home;
