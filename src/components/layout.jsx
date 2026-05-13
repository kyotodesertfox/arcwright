import { motion, useScroll, useSpring } from "motion/react"
import Navbar from './navbar';
import Footer from './footer';

const Layout = ({ children }) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen flex flex-col bg-white text-zinc-900">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-weld-red z-[60] origin-left"
                style={{ scaleX }}
            />
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
