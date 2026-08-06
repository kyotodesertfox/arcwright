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

                    <div className="mt-10 flex items-center gap-5">
                        <div className="inline-block bg-orange-500/80 border border-orange-400 shadow-lg rounded-xl px-8 py-6">
                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-900 mb-3">Free Estimate</p>
                            <a
                                href="tel:904-914-0648"
                                className="flex items-center gap-4 text-white hover:text-zinc-900 transition-colors font-mono font-bold text-3xl drop-shadow-md"
                            >
                                904-914-0648
                            </a>
                        </div>

                        {/* Award badge - fixed height matches the CTA box's rendered height (112px: 48px padding + 64px content); width follows its own aspect ratio */}
                        <Link
                            to="/awards"
                            className="flex-shrink-0 h-28 shadow-xl hover:scale-105 transition-transform duration-300"
                            aria-label="Ranked #2 Welder in Jacksonville - view award"
                        >
                            <img
                                src="/award-businessrate-2026.png"
                                alt="Ranked #2 Welder in Jacksonville - BusinessRate July 2026"
                                className="h-full w-auto object-contain rounded-sm"
                            />
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
