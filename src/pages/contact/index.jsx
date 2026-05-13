import React, { useState } from 'react';
import { Mail, FileUp, MessageSquare, User } from 'lucide-react';

const ContactPage = () => {
    const [currentStage, setCurrentStage] = useState('contact');
    const [blueprintFiles, setBlueprintFiles] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workOrder, setWorkOrder] = useState({
        clientName: '',
        clientNumber: '',
        clientEmail: '',
        projectDescription: ''
    });

    const isOrderValid =
        workOrder.clientName.trim() !== '' &&
        workOrder.clientNumber.trim() !== '' &&
        workOrder.clientEmail.includes('@') &&
        workOrder.projectDescription.length > 10;

    const finalizeOrder = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const body = new FormData();
        body.append("form-name", "project-intake");
        body.append("clientName", workOrder.clientName);
        body.append("clientNumber", workOrder.clientNumber);
        body.append("clientEmail", workOrder.clientEmail);
        body.append("projectDescription", workOrder.projectDescription);
        if (blueprintFiles) {
            body.append("blueprints", blueprintFiles);
        }

        fetch("/", { method: "POST", body })
            .then((response) => {
                if (response.ok) {
                    alert("Work Order Transmitted Successfully.");
                    setWorkOrder({ clientName: '', clientEmail: '', clientNumber: '', projectDescription: '' });
                    setBlueprintFiles(null);
                    setCurrentStage('contact');
                } else {
                    throw new Error("Transmission Failed");
                }
            })
            .catch((error) => {
                console.error("Post Error:", error);
                alert("Critical Failure: Could not transmit work order.");
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div className="max-w-4xl mx-auto py-16 px-4">
            <header className="mb-12">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-zinc-900">
                    Project <span className="text-weld-red">Intake</span>
                </h1>
                <p className="text-zinc-500 mt-2 font-medium tracking-wide uppercase">Submit Specifications for Fabrication</p>
            </header>

            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200">
                {[
                    { id: 'contact', label: '1. Identity', icon: User },
                    { id: 'files', label: '2. Blueprints', icon: FileUp },
                    { id: 'details', label: '3. Scope', icon: MessageSquare }
                ].map((stage) => (
                    <button
                        key={stage.id}
                        type="button"
                        onClick={() => setCurrentStage(stage.id)}
                        className={`flex items-center gap-3 px-6 py-3 font-bold uppercase transition-all border-b-2 -mb-[2px] ${
                            currentStage === stage.id
                                ? "border-weld-red text-zinc-900 bg-zinc-100"
                                : "border-transparent text-zinc-500 hover:text-zinc-700"
                        }`}
                    >
                        <stage.icon size={18} />
                        {stage.label}
                    </button>
                ))}
            </div>

            {/* FORM BODY */}
            <form
                name="project-intake"
                onSubmit={finalizeOrder}
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                className="bg-zinc-50 border border-zinc-200 p-8 rounded-sm"
            >
                <input type="hidden" name="form-name" value="project-intake" />
                <p className="hidden">
                    <label>Don't fill this out if you're human: <input name="bot-field" /></label>
                </p>

                {currentStage === 'contact' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div>
                            <label className="block text-xs uppercase font-black text-zinc-600 mb-2">Full Name / Company</label>
                            <input
                                type="text"
                                name="clientName"
                                value={workOrder.clientName}
                                onChange={(e) => setWorkOrder({...workOrder, clientName: e.target.value})}
                                className="w-full bg-white border border-zinc-300 text-zinc-900 p-4 outline-none focus:border-weld-red transition-colors"
                                placeholder="Enter name..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-black text-zinc-600 mb-2">Phone Number</label>
                            <input
                                type="text"
                                name="clientNumber"
                                value={workOrder.clientNumber}
                                onChange={(e) => setWorkOrder({...workOrder, clientNumber: e.target.value})}
                                className="w-full bg-white border border-zinc-300 text-zinc-900 p-4 outline-none focus:border-weld-red transition-colors"
                                placeholder="Enter phone number"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-black text-zinc-600 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="clientEmail"
                                value={workOrder.clientEmail}
                                onChange={(e) => setWorkOrder({...workOrder, clientEmail: e.target.value})}
                                className="w-full bg-white border border-zinc-300 text-zinc-900 p-4 outline-none focus:border-weld-red transition-colors"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentStage('files')}
                            className="bg-weld-red text-white px-8 py-3 font-black italic uppercase hover:bg-red-700 transition"
                        >
                            Next: Attach Specs
                        </button>
                    </div>
                )}

                {currentStage === 'files' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-2 border-dashed border-zinc-300 p-12 text-center hover:border-zinc-400 transition-colors">
                            <FileUp className="mx-auto mb-4 text-zinc-400" size={48} />
                            <p className="text-zinc-600 mb-4">Upload PNG, JPG, or PDF Blueprints</p>
                            <input
                                type="file"
                                name="blueprints"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        setBlueprintFiles(e.target.files[0]);
                                    }
                                }}
                                className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-black file:bg-zinc-900 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                            />
                            {blueprintFiles && (
                                <p className="mt-2 text-weld-red font-bold uppercase text-xs">
                                    Attached: {blueprintFiles.name}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentStage('details')}
                            className="bg-weld-red text-white px-8 py-3 font-black italic uppercase hover:bg-red-700 transition"
                        >
                            Next: Project Details
                        </button>
                    </div>
                )}

                {currentStage === 'details' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <label className="block text-xs uppercase font-black text-zinc-600 mb-2">Project Description & Notes</label>
                            <textarea
                                name="projectDescription"
                                value={workOrder.projectDescription}
                                onChange={(e) => setWorkOrder({...workOrder, projectDescription: e.target.value})}
                                className="w-full bg-white border border-zinc-300 text-zinc-900 p-4 h-48 outline-none focus:border-weld-red transition-colors resize-none"
                                placeholder="Describe dimensions, materials, and any specific requirements..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!isOrderValid || isSubmitting}
                            className={`w-full py-5 font-black italic text-2xl uppercase transition-all ${
                                isOrderValid && !isSubmitting
                                    ? "bg-weld-red text-white hover:bg-red-700 shadow-[0_0_20px_rgba(255,0,0,0.2)]"
                                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            }`}
                        >
                            {isSubmitting ? "TRANSMITTING..." : (isOrderValid ? "Finalize & Submit Request" : "Complete Specs to Submit")}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ContactPage;
