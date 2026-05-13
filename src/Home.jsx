import { Link } from 'react-router-dom';
import LogoIcon from './assets/logo.svg';

const Home = () => {
    return (
        <section className="py-16 md:py-24 px-6 overflow-hidden">
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
                <div className="flex-shrink-0 w-40 sm:w-52 md:w-60 lg:w-72 self-center">
                    <object
                        type="image/svg+xml"
                        data={LogoIcon}
                        className="w-full h-auto"
                        aria-label="ArcWright Scorpion Logo"
                    />
                </div>

            </div>
        </section>
    );
};

export default Home;
