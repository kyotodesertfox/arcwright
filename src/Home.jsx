import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <section className="py-20 px-6">
        {/* This div below is what handles the centering and width */}
        <div className="max-w-7xl mx-auto">

        <h1 className="text-6xl md:text-8xl font-black uppercase italic text-white leading-none">
        Precision <br />
        <span className="text-weld-red">Fabrication</span>
        </h1>

        <div className="mt-8 border-l-4 border-weld-silver pl-6 max-w-2xl">
        <p className="text-zinc-400 text-xl font-medium tracking-wide">
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
        </section>
    );
};

export default Home;
