import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

const DEMO_PROJECTS = [
    {
        id: 'demo-1',
        title: "Structural Steel Frame",
        category: "Commercial",
        tags: ['Steel'],
        client: null,
        description: "Full-depth penetration welds for a multi-story commercial unit. Inspected and cleared for load-bearing capacity.",
        images: [{ url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800", alt: "Structural steel frame" }],
    },
    {
        id: 'demo-2',
        title: "Pipe Manifold Weld",
        category: "Marine",
        tags: ['Marine', 'Steel'],
        client: null,
        description: "High-pressure manifold fabrication utilizing multi-pass TIG root and stick cap. All joints meet ASME B31.3 process piping standards.",
        images: [{ url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800", alt: "Pipe manifold weld" }],
    },
    {
        id: 'demo-3',
        title: "Architectural Rigging",
        category: "Fabrication",
        tags: ['Steel', 'Alloy'],
        client: null,
        description: "Structural steel installation in a high-visibility residential setting. Hidden weld points maintain design aesthetics without compromising structural safety.",
        images: [{ url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800", alt: "Architectural rigging" }],
    },
    {
        id: 'demo-4',
        title: "Precision TIG Work",
        category: "Specialized",
        tags: ['Aluminum', 'Marine'],
        client: null,
        description: "Thin-gauge aluminum welding for custom marine components. Stack-of-dimes bead consistency for a showroom finish.",
        images: [{ url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", alt: "Precision TIG welding" }],
    },
];

const Portfolio = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [activeTag, setActiveTag] = useState(null);
    const gridRef = useRef(null);

    const allTags = [...new Set(projects.flatMap(p => p.tags || []))].sort();

    const filteredProjects = activeTag
        ? projects.filter(p => (p.tags || []).includes(activeTag))
        : projects;

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const visibleProjects = filteredProjects.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    useEffect(() => { loadProjects(); }, []);

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
            return {
                id: slug,
                slug,
                title: meta.title || slug,
                client: meta.client || null,
                category: meta.client ? 'Custom Work' : 'Fabrication',
                tags: meta.tags || [],
                description: meta.description || '',
                images: imageEntries.map(([key, alt]) => ({
                    url: `/projects/${slug}/${key}.webp`,
                    alt: alt || meta.title || slug,
                })),
            };
        } catch { return null; }
    };

    const setTag = (tag) => {
        setActiveTag(prev => prev === tag ? null : tag);
        setCurrentPage(0);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openProject = (id) => { setSelectedId(id); setCarouselIndex(0); };

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

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[340px] bg-zinc-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Demo notice */}
                {!loading && isDemo && (
                    <div className="mb-8 border-l-4 border-zinc-300 pl-4 py-2">
                        <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">
                            Showcase preview — real project photos coming soon
                        </p>
                    </div>
                )}

                {/* Tag filter bar */}
                {!loading && allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        <button
                            onClick={() => { setActiveTag(null); setCurrentPage(0); }}
                            className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors border ${
                                activeTag === null
                                    ? 'bg-weld-red text-white border-weld-red'
                                    : 'border-zinc-300 text-zinc-500 hover:border-weld-red hover:text-weld-red'
                            }`}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setTag(tag)}
                                className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors border ${
                                    activeTag === tag
                                        ? 'bg-weld-red text-white border-weld-red'
                                        : 'border-zinc-300 text-zinc-500 hover:border-weld-red hover:text-weld-red'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                        {activeTag && (
                            <span className="self-center text-xs text-zinc-400 ml-2">
                                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}

                {/* Gallery grid */}
                {!loading && (
                    <>
                        {/* No results */}
                        {filteredProjects.length === 0 && (
                            <div className="py-24 text-center">
                                <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold mb-3">No projects found</p>
                                <button
                                    onClick={() => setActiveTag(null)}
                                    className="text-weld-red text-xs uppercase tracking-widest font-bold hover:underline"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}

                        {filteredProjects.length > 0 && (
                            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {visibleProjects.map((project, index) => (
                                    <motion.div
                                        layoutId={`project-${project.id}`}
                                        key={project.id}
                                        onClick={() => openProject(project.id)}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-40px" }}
                                        transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.25, 1, 0.5, 1] }}
                                        className="h-[340px] group relative overflow-hidden cursor-pointer border-b-4 border-transparent hover:border-weld-red transition-all duration-300 shadow-sm hover:shadow-xl"
                                    >
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

                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
                                            <div className="flex flex-wrap gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(project.tags || []).map(tag => (
                                                    <span key={tag} className="text-weld-red font-mono text-xs uppercase tracking-widest">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {project.images.length > 1 && (
                                                    <span className="text-zinc-500 font-mono text-xs ml-1">
                                                        · {project.images.length} photos
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase italic leading-tight">
                                                {project.title}
                                            </h3>
                                            {project.client && (
                                                <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">{project.client}</p>
                                            )}
                                            <div className="w-6 h-0.5 bg-weld-silver mt-3 group-hover:w-20 transition-all duration-500" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="w-10 h-10 flex items-center justify-center border border-zinc-300 text-zinc-600 hover:border-weld-red hover:text-weld-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToPage(i)}
                                        className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-colors ${
                                            i === currentPage
                                                ? 'bg-weld-red text-white'
                                                : 'border border-zinc-300 text-zinc-600 hover:border-weld-red hover:text-weld-red'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="w-10 h-10 flex items-center justify-center border border-zinc-300 text-zinc-600 hover:border-weld-red hover:text-weld-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {selectedId && selectedProject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />

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

                                {selectedProject.images.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-weld-red text-white p-2 transition-colors">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-weld-red text-white p-2 transition-colors">
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

                                {(selectedProject.tags || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {selectedProject.tags.map(tag => (
                                            <span key={tag} className="text-weld-red font-mono text-xs uppercase tracking-widest">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
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
