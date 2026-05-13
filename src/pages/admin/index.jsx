import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const $projectRoot = 'public/projects/';
const metadataFile = 'metadata.json';

const AdminPortal = () => {
    const [currentBranch, setCurrentBranch] = useState(null);
    const [status, setStatus] = useState('Idle');
    const [statusType, setStatusType] = useState('idle'); // idle | working | success | error
    const [projectName, setProjectName] = useState('IMG_' + new Date().toISOString().split('T')[0].replace(/-/g, ''));
    const [description, setDescription] = useState('');
    const [client, setClient] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [images, setImages] = useState([]);
    const [altTexts, setAltTexts] = useState({});
    const [token, setToken] = useState(localStorage.getItem('github_token') || null);
    const [activeTab, setActiveTab] = useState('projects'); // projects | editor
    const [confirmPublish, setConfirmPublish] = useState(false);

    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REPO_OWNER = import.meta.env.VITE_REPO_OWNER;
    const REPO_NAME = import.meta.env.VITE_REPO_NAME;

    const setMsg = (msg, type = 'working') => {
        setStatus(msg);
        setStatusType(type);
    };

    useEffect(() => {
        if (currentBranch && projectList.length > 0) syncSessionDrafts(currentBranch);
    }, [currentBranch, projectList.length]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && !token) handleTokenExchange(code);
    }, []);

    useEffect(() => {
        if (token) fetchProjects();
    }, [token]);

    const loginWithGithub = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;
    };

    const logout = () => {
        localStorage.removeItem('github_token');
        setToken(null);
        setMsg('Logged out.', 'idle');
        window.location.href = '/';
    };

    const handleTokenExchange = async (code) => {
        setMsg('Authenticating...', 'working');
        try {
            const res = await fetch(`/.netlify/functions/auth?code=${code}`);
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('github_token', data.token);
                setToken(data.token);
                window.history.replaceState({}, document.title, window.location.pathname);
                setMsg('Authenticated!', 'success');
            } else if (data.error) {
                setMsg(`Denied: ${data.error}`, 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch {
            setMsg('Login failed: Connection error.', 'error');
        }
    };

    const fetchProjects = async () => {
        setMsg('Fetching projects...', 'working');
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}?ref=main`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProjectList(data.filter(i => i.type === 'dir').map(i => i.name));
                setMsg('Ready.', 'success');
            }
        } catch (err) { setMsg(`Fetch error: ${err.message}`, 'error'); }
    };

    const loadProject = async (folderName) => {
        setMsg(`Loading ${folderName}...`, 'working');
        setProjectName(folderName);
        setImages([]);
        setAltTexts({});
        setActiveTab('editor');

        const cleanPath = `${$projectRoot.replace(/^\/+|\/+$/g, '')}/${folderName.replace(/^\/+|\/+$/g, '')}`;

        const fetchFromBranch = async (branch) => {
            try {
                const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${cleanPath}?ref=${branch}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return res.ok ? await res.json() : null;
            } catch { return null; }
        };

        const [branchFiles, mainFiles] = await Promise.all([
            currentBranch ? fetchFromBranch(currentBranch) : Promise.resolve(null),
            fetchFromBranch('main'),
        ]);

        const fileMap = new Map();
        if (Array.isArray(mainFiles)) mainFiles.forEach(f => fileMap.set(f.name, f));
        if (Array.isArray(branchFiles)) branchFiles.forEach(f => fileMap.set(f.name, f));

        setImages(Array.from(fileMap.values()).filter(f => f.name.toLowerCase().endsWith('.webp'))
            .map(img => ({ ...img, displayUrl: img.download_url })));

        const fetchMeta = async (branch) => {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${cleanPath}/${metadataFile}?ref=${branch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const d = await res.json();
                return JSON.parse(atob(d.content));
            }
            return null;
        };

        const meta = (currentBranch ? await fetchMeta(currentBranch) : null) || await fetchMeta('main');
        if (meta) {
            setClient(meta.client || '');
            setDescription(meta.description || '');
            setAltTexts(meta.images || {});
            setMsg(`Loaded.`, 'success');
        } else {
            setClient('');
            setDescription('');
            setMsg('New project — ready.', 'success');
        }
    };

    const syncSessionDrafts = async (branchName) => {
        try {
            const results = await Promise.all(projectList.map(name =>
                fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}${name}/${metadataFile}?ref=${branchName}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.ok ? name : null)
            ));
            setDrafts(results.filter(Boolean));
        } catch {}
    };

    const commitToBranch = async (folderName, projectData) => {
        if (!currentBranch) return;
        setMsg('Saving...', 'working');
        const path = `${$projectRoot}${folderName}/${metadataFile}`;
        const content = btoa(JSON.stringify(projectData, null, 2));
        try {
            const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${currentBranch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fileData = await getFile.json();
            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Admin Update: ${folderName}`, content, branch: currentBranch, sha: fileData.sha || null })
            });
            setMsg('Saved!', 'success');
            if (!drafts.includes(folderName)) setDrafts(prev => [...prev, folderName]);
        } catch (err) { setMsg(`Save failed: ${err.message}`, 'error'); }
    };

    const handleUpload = async (file) => {
        if (!currentBranch) return;
        setMsg('Converting to WebP...', 'working');
        const webpBlob = await convertToWebP(file);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            const fileName = `${file.name.split('.')[0]}.webp`;
            setMsg(`Uploading ${fileName}...`, 'working');
            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}${projectName}/${fileName}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Add image: ${fileName}`, content: base64data, branch: currentBranch })
            });
            setMsg('Uploaded!', 'success');
            loadProject(projectName);
        };
        reader.readAsDataURL(webpBlob);
    };

    const deleteImage = async (img) => {
        if (!currentBranch) return;
        setMsg(`Deleting...`, 'working');
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${img.path}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Remove image: ${img.name}`, sha: img.sha, branch: currentBranch })
        });
        loadProject(projectName);
    };

    const convertToWebP = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/webp', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    const branchID = async () => {
        const sessionBranch = `update-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
        setMsg('Starting session...', 'working');
        try {
            const mainRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/main`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mainData = await mainRes.json();
            const createRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ref: `refs/heads/${sessionBranch}`, sha: mainData.object.sha })
            });
            if (createRes.ok || createRes.status === 422) {
                setCurrentBranch(sessionBranch);
                setMsg('Session active.', 'success');
                await fetchProjects();
            }
        } catch (err) { setMsg(`Error: ${err.message}`, 'error'); }
    };

    const commitToMerge = async () => {
        setMsg('Publishing...', 'working');
        setConfirmPublish(false);
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/merges`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ base: 'main', head: currentBranch, commit_message: `Admin Publish: ${new Date().toLocaleString()}` })
            });
            if (res.ok) {
                setMsg('LIVE!', 'success');
                setDrafts([]);
                setCurrentBranch(null);
                fetchProjects();
            }
        } catch (err) { setMsg(`Merge error: ${err.message}`, 'error'); }
    };

    const statusDot = {
        idle:    'bg-zinc-600',
        working: 'bg-amber-400 animate-pulse',
        success: 'bg-green-500',
        error:   'bg-weld-red animate-pulse',
    }[statusType];

    // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
    if (!token) return (
        <div className="min-h-screen bg-weld-black flex flex-col items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <h1 className="text-5xl font-black uppercase italic text-white tracking-tighter mb-1">
                    ARC<span className="text-weld-red">WRIGHT</span>
                </h1>
                <p className="text-zinc-500 uppercase tracking-widest text-xs mb-10">Admin Portal</p>

                <div className="border border-zinc-800 bg-zinc-950 p-8">
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        Sign in with your GitHub account to manage your portfolio and publish changes to the live site.
                    </p>
                    <button
                        onClick={loginWithGithub}
                        className="w-full bg-weld-red hover:bg-red-700 text-white font-bold py-4 uppercase tracking-widest transition-colors text-sm"
                    >
                        Sign In with GitHub
                    </button>
                    {status !== 'Idle' && (
                        <p className="text-zinc-500 text-xs text-center mt-4 uppercase tracking-wider">{status}</p>
                    )}
                </div>
            </motion.div>
        </div>
    );

    // ── MAIN ADMIN ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-weld-black text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-black uppercase italic tracking-tighter leading-none">
                            ARC<span className="text-weld-red">WRIGHT</span>
                        </h1>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Admin</p>
                    </div>

                    {/* Status pill */}
                    <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                        <span className="text-zinc-400 text-xs truncate">{status}</span>
                    </div>

                    <button onClick={logout} className="text-zinc-600 hover:text-weld-red text-xs uppercase tracking-wider transition-colors shrink-0">
                        Out
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">

                {/* Session Banner */}
                <div className={`mb-6 p-4 border flex items-center justify-between gap-4 ${currentBranch ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                    <div>
                        {currentBranch ? (
                            <>
                                <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-0.5">Session Active</p>
                                <p className="text-zinc-400 font-mono text-xs">{currentBranch}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">No Active Session</p>
                                <p className="text-zinc-600 text-xs">Start a session to make changes</p>
                            </>
                        )}
                    </div>
                    {currentBranch ? (
                        <button
                            onClick={() => setConfirmPublish(true)}
                            className="shrink-0 bg-weld-red hover:bg-red-700 text-white font-bold py-3 px-5 uppercase tracking-widest text-xs transition-colors"
                        >
                            Publish Live
                        </button>
                    ) : (
                        <button
                            onClick={branchID}
                            className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-5 uppercase tracking-widest text-xs transition-colors"
                        >
                            Start Session
                        </button>
                    )}
                </div>

                {/* Tab Nav */}
                <div className="flex border-b border-zinc-800 mb-6">
                    {['projects', 'editor'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-6 text-xs uppercase tracking-widest font-bold transition-colors border-b-2 -mb-px ${
                                activeTab === tab
                                    ? 'border-weld-red text-white'
                                    : 'border-transparent text-zinc-600 hover:text-zinc-400'
                            }`}
                        >
                            {tab === 'projects' ? `Projects (${projectList.length})` : `Edit: ${projectName}`}
                        </button>
                    ))}
                </div>

                {/* PROJECTS TAB */}
                <AnimatePresence mode="wait">
                {activeTab === 'projects' && (
                    <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* New project button */}
                        <button
                            onClick={() => {
                                setProjectName('IMG_' + new Date().toISOString().split('T')[0].replace(/-/g, ''));
                                setImages([]);
                                setClient('');
                                setDescription('');
                                setAltTexts({});
                                setActiveTab('editor');
                            }}
                            className="w-full mb-4 border border-dashed border-zinc-700 hover:border-weld-red py-4 text-zinc-500 hover:text-weld-red text-sm uppercase tracking-widest transition-colors font-bold"
                        >
                            + New Project
                        </button>

                        <div className="grid grid-cols-1 gap-2">
                            {projectList
                                .sort((a, b) => (drafts.includes(a) ? -1 : drafts.includes(b) ? 1 : b.localeCompare(a)))
                                .map(name => (
                                    <motion.button
                                        key={name}
                                        onClick={() => loadProject(name)}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full text-left p-4 border transition-colors flex items-center justify-between ${
                                            projectName === name && activeTab === 'editor'
                                                ? 'border-weld-red bg-weld-red/5'
                                                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-white font-bold text-sm uppercase tracking-wide">{name}</p>
                                            {drafts.includes(name) && (
                                                <p className="text-amber-400 text-[10px] uppercase tracking-widest mt-0.5">● Unsaved Draft</p>
                                            )}
                                        </div>
                                        <span className="text-zinc-600 text-xs">Edit →</span>
                                    </motion.button>
                                ))
                            }
                        </div>
                    </motion.div>
                )}

                {/* EDITOR TAB */}
                {activeTab === 'editor' && (
                    <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                        {!currentBranch && (
                            <div className="border border-amber-500/30 bg-amber-500/5 p-4 text-amber-400 text-xs uppercase tracking-widest">
                                Start a session above to make changes.
                            </div>
                        )}

                        {/* Project Name */}
                        <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Project ID</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={e => setProjectName(e.target.value)}
                                disabled={!currentBranch}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm font-mono focus:outline-none focus:border-weld-red disabled:opacity-50 transition-colors"
                            />
                        </div>

                        {/* Client */}
                        <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Client</label>
                            <input
                                type="text"
                                value={client}
                                onChange={e => setClient(e.target.value)}
                                disabled={!currentBranch}
                                placeholder="Client name"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-weld-red disabled:opacity-50 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={!currentBranch}
                                placeholder="Describe the project, materials, techniques..."
                                rows={4}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-weld-red disabled:opacity-50 transition-colors resize-none"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-zinc-500 text-[10px] uppercase tracking-widest">
                                    Photos ({images.length})
                                </label>
                                <button onClick={() => loadProject(projectName)} className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-wider transition-colors">
                                    Refresh
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {images.map(img => {
                                    const imageID = img.name.replace('.webp', '');
                                    return (
                                        <div key={img.sha} className="border border-zinc-800 bg-zinc-950">
                                            <img src={img.download_url} className="w-full h-32 object-cover" alt="" />
                                            <div className="p-2 space-y-2">
                                                <input
                                                    type="text"
                                                    value={altTexts[imageID] || ''}
                                                    onChange={e => setAltTexts(prev => ({ ...prev, [imageID]: e.target.value }))}
                                                    placeholder="Alt text..."
                                                    disabled={!currentBranch}
                                                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1.5 text-xs focus:outline-none focus:border-weld-red disabled:opacity-50"
                                                />
                                                {currentBranch && (
                                                    <button
                                                        onClick={() => deleteImage(img)}
                                                        className="w-full text-zinc-600 hover:text-weld-red text-[10px] uppercase tracking-wider transition-colors py-1"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Upload tile */}
                                {currentBranch && (
                                    <label className="border border-dashed border-zinc-700 hover:border-weld-red h-32 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                        <span className="text-2xl mb-1">📷</span>
                                        <span className="text-zinc-600 group-hover:text-weld-red text-[10px] uppercase tracking-widest transition-colors">Add Photo</span>
                                        <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files[0])} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Save button */}
                        {currentBranch && (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => commitToBranch(projectName, { title: projectName, client, description, images: altTexts })}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 uppercase tracking-widest text-sm transition-colors"
                            >
                                Save to Draft
                            </motion.button>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Publish Confirm Modal */}
            <AnimatePresence>
            {confirmPublish && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmPublish(false)} />
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="relative z-10 w-full max-w-sm bg-zinc-950 border border-zinc-800 p-8"
                    >
                        <h2 className="text-2xl font-black uppercase italic text-white mb-2">Publish Live?</h2>
                        <p className="text-zinc-400 text-sm mb-8">
                            This will merge all drafts to the live site. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmPublish(false)}
                                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={commitToMerge}
                                className="flex-1 bg-weld-red hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                            >
                                Go Live
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPortal;
