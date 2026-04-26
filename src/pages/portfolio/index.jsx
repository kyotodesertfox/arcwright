import { motion } from "motion/react";

const projects = [
    {
        id: 1,
        title: "Structural Steel Frame",
        category: "Commercial",
        height: "h-[400px]",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800"
    },
{
    id: 2,
    title: "Pipe Manifold Weld",
    category: "Marine",
    height: "h-[600px]",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800"
},
{
    id: 3,
    title: "Architectural Rigging",
    category: "Fabrication",
    height: "h-[400px]",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"
},
{
    id: 4,
    title: "Precision TIG Work",
    category: "Specialized",
    height: "h-[500px]",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
},
];

const Portfolio = () => {
    return (
        <section className="py-24 px-6 bg-weld-black">
        <div className="max-w-7xl mx-auto">
        {/* Header with a staggered reveal */}
        <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-16 border-l-8 border-weld-red pl-8"
        >
        <h2 className="text-6xl font-black uppercase italic text-white tracking-tighter">
        ARCWRIGHT <span className="text-weld-silver text-4xl block sm:inline">Portfolio</span>
        </h2>
        <p className="text-zinc-500 uppercase tracking-widest text-sm mt-2">
        Jacksonville, FL // Arcright Standards
        </p>
        </motion.div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
            <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.7,
                delay: index % 2 * 0.2,
                ease: [0.25, 1, 0.5, 1]
            }}
            className={`${project.height} group relative bg-zinc-900 border border-zinc-800 overflow-hidden`}
            >
            {/* 🟢 NEW: Actual Image replaces the old Placeholder Div */}
            <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
            />

            {/* Technical Spec Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
            <span className="text-weld-red font-mono text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {project.category} // 00{project.id}
            </span>
            <h3 className="text-3xl font-black text-white uppercase italic leading-none">
            {project.title}
            </h3>

            {/* Visual "Weld" line */}
            <div className="w-12 h-1 bg-weld-silver mt-4 group-hover:w-full transition-all duration-500" />
            </div>
            </motion.div>
        ))}
        </div>
        </div>
        </section>
    );
};

export default Portfolio;
