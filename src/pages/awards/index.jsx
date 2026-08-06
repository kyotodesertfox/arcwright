import { motion } from 'motion/react';
import { Award, Sparkles } from 'lucide-react';

const CONFETTI_COUNT = 36;
const CONFETTI_COLORS = ['bg-weld-red', 'bg-weld-silver', 'bg-white', 'bg-zinc-300'];

// Generated once at module load, not during render - keeps the component pure.
const CONFETTI_PIECES = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.4 + Math.random() * 1.4,
    rotate: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 6,
}));

const Confetti = () => {
    const pieces = CONFETTI_PIECES;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {pieces.map((p) => (
                <motion.span
                    key={p.id}
                    className={`absolute top-0 ${p.color}`}
                    style={{ left: `${p.left}%`, width: p.size, height: p.size }}
                    initial={{ y: -40, opacity: 0, rotate: 0 }}
                    animate={{ y: 420, opacity: [0, 1, 1, 0], rotate: p.rotate }}
                    transition={{ delay: p.delay, duration: p.duration, ease: 'easeIn' }}
                />
            ))}
        </div>
    );
};

const Awards = () => {
    return (
        <section className="py-24 px-6 relative">
            <title>Awards | ArcWright Welding | Jacksonville, FL</title>
            <meta name="description" content="ArcWright Welding's recognitions and awards — ranked #2 Welder in Jacksonville, FL for 2026 by BusinessRate." />

            <div className="max-w-5xl mx-auto">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 border-l-8 border-weld-red pl-8"
                >
                    <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-2">Recognition</p>
                    <h2 className="text-6xl font-black uppercase italic text-zinc-900 tracking-tighter">
                        ARC<span className="text-weld-red">WRIGHT</span>{' '}
                        <span className="text-zinc-400 text-4xl block sm:inline">Awards</span>
                    </h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-sm mt-2">
                        Jacksonville, FL // Verified Standards
                    </p>
                </motion.div>

                {/* Award Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    className="relative bg-zinc-950 overflow-hidden"
                >
                    <Confetti />

                    {/* Pulsing glow border */}
                    <div className="absolute inset-0 border-2 border-weld-red animate-pulse pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-900 via-weld-red to-red-900" />

                    <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">

                        {/* Award image */}
                        <div className="flex-shrink-0 relative">
                            <div className="w-48 md:w-56 aspect-[1636/2048] border-2 border-weld-silver/40 relative overflow-hidden">
                                <img
                                    src="/award-businessrate-2026.png"
                                    alt="BusinessRate Ranked #2 Welder in Jacksonville - July 2026 Award Winner - ArcWright Welding"
                                    className="w-full h-full object-cover"
                                />
                                {/* Shine sweep - diagonal, top-left to bottom-right */}
                                <motion.div
                                    className="absolute -inset-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45"
                                    initial={{ x: '-60%', y: '-60%' }}
                                    animate={{ x: '60%', y: '60%' }}
                                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                                />
                            </div>
                            <span className="absolute -top-3 -right-3 bg-weld-red text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rotate-6 shadow-lg">
                                New
                            </span>
                        </div>

                        {/* Award details */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <Sparkles className="text-weld-red" size={18} />
                                <p className="text-weld-red text-xs uppercase tracking-[0.2em] font-bold">
                                    BusinessRate · July 2026
                                </p>
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black uppercase italic text-white leading-tight mb-4">
                                Ranked <span className="text-weld-red">#2</span> Welder
                                <br className="hidden md:block" /> in Jacksonville
                            </h3>
                            <p className="text-zinc-400 text-base leading-relaxed max-w-xl">
                                Officially recognized as the #2 ranked welder in Jacksonville for 2026,
                                based on verified data. A result of consistency, a nonstop drive, and a
                                sharp focus on the work — not chasing the outcome, letting it show up on its own.
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-6">
                                <Award className="text-weld-silver" size={16} />
                                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">
                                    Verified Award Winner
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-zinc-500 uppercase tracking-widest text-sm mb-4">
                        Ranked #2 for a reason — let's talk about your project.
                    </p>
                    <a
                        href="tel:904-914-0648"
                        className="inline-flex items-center gap-3 bg-weld-red text-white font-mono font-bold text-xl px-8 py-4 hover:bg-red-700 transition-colors"
                    >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
                        904-914-0648
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Awards;
