import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Shown until the welder uploads real work via the admin panel
const DEMO_PROJECTS = [
    {
        id: 'demo-1',
        title: "Structural Steel Frame",
        category: "Commercial",
        client: null,
        description: "Full-depth penetration welds for a multi-story commercial unit. Inspected and cleared for load-bearing capacity.",
        images: [{ url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800", alt: "Structural steel frame" }],
        height: "h-[420px]",
    },
    {
        id: 'demo-2',
        title: "Pipe Manifold Weld",
        category: "Marine",
        client: null,
        description: "High-pressure manifold fabrication utilizing multi-pass TIG root and stick cap. All joints meet ASME B31.3 process piping standards.",
        images: [{ url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800", alt: "Pipe manifold weld" }],
        height: "h-[560px]",
    },
    {
        id: 'demo-3',
        title: "Architectural Rigging",
        category: "Fabrication",
        client: null,
        description: "Structural steel installation in a high-visibility residential setting. Hidden weld points maintain design aesthetics without compromising structural safety.",
        images: [{ url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800", alt: "Architectural rigging" }],
        height: "h-[420px]",
    },
    {
        id: 'demo-4',
        title: "Precision TIG Work",
        category: "Specialized",
        client: null,
        description: "Thin-gauge aluminum welding for custom marine components. Stack-of-dimes bead consistency for a showroom finish.",
        images: [{ url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", alt: "Precision TIG welding" }],
        height: "h-[480px]",
    },
];

const CARD_HEIGHTS = ['h-[420px]', 'h-[560px]', 'h-[420px]', 'h-[480px]'];

const Portfolio = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('/projects/index.json');
            if (res.ok) {
                const slugs = await res.json();
                if (Array.isArray(slugs) && slugs.length > 0) {
                    const loaded = await Promise.all(slugs.map(fetchProject));
                    const valid = loaded.filter(Boolean);
                    if (valid.length > 0) {
                        setProjects(valid);
                        setIsDemo(false);
                        setLoading(false);
                        return;
                    }
                }
            }
        } catch {}
        // No admin projects yet — show demo content
        setProjects(DEMO_PROJECTS);
        setIsDemo(true);
        setLoading(false);
    };

    const fetchProject = async (slug) => {
        try {
            const res = await fetch(`/projects/${slug}/metadata.json`);
            if (!res.ok) return null;
            const meta = await res.json();
            const imageEntries = Object.entries(meta.images || {});
            const images = imageEntries.map(([key, alt]) => ({
                url: `/projects/${slug}/${key}.webp`,
                alt: alt || meta.title || slug,
            }));
            return {
                id: slug,
                slug,
                title: meta.title || slug,
                client: meta.client || null,
                category: meta.client ? 'Custom Work' : 'Fabrication',
                description: meta.description || '',
                images,
            };
        } catch {
            return null;
        }
    };

    const openProject = (id) => {
        setSelectedId(id);
        setCarouselIndex(0);
    };

    const selectedProject = projects.find(p => p.id === selectedId);

    const prevImage = (e) => {
        e.stopPropagation();
        setCarouselIndex(i => (i - 1 + selectedProject.images.length) % selectedProject.images.length);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCarouselIndex(i => (i + 1) % selectedProject.images.length);
    };

    return (
        <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 border-l-8 border-weld-red pl-8"
                >
                    <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-2">Our Work</p>
                    <h2 className="text-6xl font-black uppercase italic text-zinc-900 tracking-tighter">
                        ARC<span className="text-weld-red">WRIGHT</span>{' '}
                        <span className="text-zinc-400 text-4xl block sm:inline">Portfolio</span>
                    </h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-sm mt-2">
                        Jacksonville, FL // ArcWright Standards
                    </p>
                </motion.div>

                {/* Loading state */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-[420px] bg-zinc-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Demo banner */}
                {!loading && isDemo && (
                    <div className="mb-8 border-l-4 border-zinc-300 pl-4 py-2">
                        <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">
                            Showcase preview — real project photos coming soon
                        </p>
                    </div>
                )}

                {/* Gallery grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                layoutId={`project-${project.id}`}
                                key={project.id}
                                onClick={() => openProject(project.id)}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: (index % 2) * 0.15, ease: [0.25, 1, 0.5, 1] }}
                                className={`${project.height || CARD_HEIGHTS[index % 4]} group relative overflow-hidden cursor-pointer border-b-4 border-transparent hover:border-weld-red transition-all duration-300 shadow-sm hover:shadow-xl`}
                            >
                                {/* Image */}
                                {project.images[0] ? (
                                    <img
                                        src={project.images[0].url}
                                        alt={project.images[0].alt}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-zinc-200 flex items-center justify-center">
                                        <span className="text-zinc-400 text-xs uppercase tracking-widest">No photo</span>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-8 flex flex-col justify-end">
                                    <span className="text-weld-red font-mono text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                        {project.category}
                                        {project.images.length > 1 && (
                                            <span className="ml-3 text-zinc-500">· {project.images.length} photos</span>
                                        )}
                                    </span>
                                    <h3 className="text-2xl font-black text-white uppercase italic leading-tight">
                                        {project.title}
                                    </h3>
                                    {project.client && (
                                        <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">{project.client}</p>
                                    )}
                                    <div className="w-8 h-0.5 bg-weld-silver mt-4 group-hover:w-24 transition-all duration-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {selectedId && selectedProject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />

                        {/* Modal card */}
                        <motion.div
                            layoutId={`project-${selectedId}`}
                            className="bg-zinc-900 w-full max-w-4xl overflow-hidden border border-zinc-800 flex flex-col md:flex-row relative z-10 max-h-[90vh]"
                        >
                            {/* Image pane */}
                            <div className="relative w-full md:w-3/5 h-64 md:h-auto min-h-[300px] flex-shrink-0">
                                <AnimatePresence mode="wait">
                                    {selectedProject.images[carouselIndex] && (
                                        <motion.img
                                            key={carouselIndex}
                                            src={selectedProject.images[carouselIndex].url}
                                            alt={selectedProject.images[carouselIndex].alt}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Carousel controls */}
                                {selectedProject.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-weld-red text-white p-2 transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-weld-red text-white p-2 transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                            {selectedProject.images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
                                                    className={`w-2 h-2 rounded-full transition-colors ${i === carouselIndex ? 'bg-weld-red' : 'bg-white/30 hover:bg-white/60'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Info pane */}
                            <div className="p-8 md:w-2/5 flex flex-col overflow-y-auto">
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="self-end text-zinc-500 hover:text-white transition-colors -mr-2 -mt-2 mb-6 w-8 h-8 flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>

                                <span className="text-weld-red font-mono text-xs uppercase tracking-widest mb-3">
                                    {selectedProject.category}
                                </span>
                                <h2 className="text-3xl font-black italic text-white uppercase leading-none mb-2">
                                    {selectedProject.title}
                                </h2>
                                {selectedProject.client && (
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
                                        {selectedProject.client}
                                    </p>
                                )}
                                {selectedProject.description && (
                                    <p className="text-zinc-400 text-sm leading-relaxed flex-grow">
                                        {selectedProject.description}
                                    </p>
                                )}
                                {selectedProject.images.length > 1 && (
                                    <p className="text-zinc-600 text-xs uppercase tracking-widest mt-6">
                                        Photo {carouselIndex + 1} of {selectedProject.images.length}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Portfolio;
