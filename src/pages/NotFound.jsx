import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    useEffect(() => {

        document.title = "404 - Page Not Found | ArcWright";

        const meta = document.createElement('meta');
        meta.name = "robots";
        meta.content = "noindex";
        const head = document.getElementsByTagName('head')[0];
        head.appendChild(meta);

        return () => {
            head.removeChild(meta);
        };
    }, []);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-weld-black text-white p-6">
        <img src="/notfound.png" alt="Error 404" className="w-96 h-auto mb-4 transition-all duration-700" />
        <Link
        to="/"
        className="mt-10 bg-weld-red px-8 py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
        >
        Back to Home
        </Link>
        </div>
    );
};

export default NotFound;
