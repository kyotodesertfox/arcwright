const services = [
    {
        title: "Structural Steel",
        description: "Heavy-duty fabrication for residential and commercial frames. Built to exceed engineering standards.",
        icon: "🏗️"
    },
    {
        title: "TIG / MIG Welding",
        description: "Precision beads on aluminum, stainless steel, and mild steel for custom parts and repairs.",
        icon: "⚡"
    },
    {
        title: "Custom Fabrication",
        description: "From ornate gates to specialized brackets. You provide the specs, we provide the steel.",
        icon: "📐"
    },
    {
        title: "On-Site Repair",
        description: "Mobile welding services for equipment repair and structural fixes directly at your location.",
        icon: "🚛"
    }
];

const Services = () => {
    return (
        <section id="services" className="py-20 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="mb-16 border-b border-zinc-200 pb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-zinc-500 uppercase tracking-widest text-sm font-bold mb-2">Capabilities</h2>
                        <h3 className="text-5xl font-black uppercase italic text-zinc-900">
                            Our <span className="text-weld-red">Services</span>
                        </h3>
                    </div>
                    <div className="hidden md:block text-zinc-400 font-mono text-sm">
                        LOCATED: JACKSONVILLE, FL // EST. 2026
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white border border-zinc-200 shadow-sm p-8 hover:bg-zinc-50 hover:border-weld-red transition-all group"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {service.icon}
                            </div>
                            <h4 className="text-xl font-bold uppercase text-zinc-900 mb-3 group-hover:text-weld-red transition-colors">
                                {service.title}
                            </h4>
                            <p className="text-zinc-600 text-sm leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-weld-red/10 border-l-4 border-weld-red p-6">
                    <p className="text-zinc-700 text-sm uppercase tracking-tighter">
                        <strong>Certified Expertise:</strong> Specialized in high-pressure joints and exotic metal alloys. All work guaranteed for structural integrity.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Services;
