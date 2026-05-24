import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown } from 'lucide-react';

const $projectRoot = 'public/projects/';
const metadataFile = 'metadata.json';
const PRESET_TAGS = ['Marine', 'Alloy', 'Steel', 'Aluminum'];

const formatSlug = (slug) => {
    if (/^\d{8}$/.test(slug)) {
        const date = new Date(`${slug.slice(0, 4)}-${slug.slice(4, 6)}-${slug.slice(6, 8)}`);
        if (!isNaN(date.getTime()))
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return slug;
};

const AdminPortal = () => {
    const [currentBranch, setCurrentBranch]   = useState(null);
    const [status, setStatus]                 = useState('Ready');
    const [statusType, setStatusType]         = useState('idle');
    const [projectName, setProjectName]       = useState('');
    const [title, setTitle]                   = useState('');
    const [client, setClient]                 = useState('');
    const [description, setDescription]       = useState('');
    const [tags, setTags]                     = useState([]);
    const [customTagInput, setCustomTagInput] = useState('');
    const [projectList, setProjectList]       = useState([]);
    const [projectTitles, setProjectTitles]   = useState({});
    const [touchedProjects, setTouchedProjects] = useState(new Set());
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [drafts, setDrafts]                 = useState([]);
    const [images, setImages]                 = useState([]);
    const [altTexts, setAltTexts]             = useState({});
    const [token, setToken]                   = useState(localStorage.getItem('github_token') || null);
    const [activeTab, setActiveTab]           = useState('projects');
    const [confirmPublish, setConfirmPublish] = useState(false);

    const CLIENT_ID  = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REPO_OWNER = import.meta.env.VITE_REPO_OWNER;
    const REPO_NAME  = import.meta.env.VITE_REPO_NAME;

    const setMsg = (msg, type = 'working') => { setStatus(msg); setStatusType(type); };

    useEffect(() => {
        if (currentBranch && projectList.length > 0) syncDrafts(currentBranch);
    }, [currentBranch, projectList.length]);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code && !token) handleTokenExchange(code);
    }, []);

    useEffect(() => { if (token) fetchProjects(); }, [token]);

    // ── AUTH ──────────────────────────────────────────────────────────────────

    const loginWithGithub = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;
    };

    const logout = () => {
        localStorage.removeItem('github_token');
        setToken(null);
        window.location.href = '/';
    };

    const handleTokenExchange = async (code) => {
        setMsg('Signing in...', 'working');
        try {
            const res  = await fetch(`/.netlify/functions/auth?code=${code}`);
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('github_token', data.token);
                setToken(data.token);
                window.history.replaceState({}, document.title, window.location.pathname);
                setMsg('Signed in!', 'success');
            } else {
                setMsg(`Sign-in failed: ${data.error}`, 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch { setMsg('Sign-in failed — check your connection.', 'error'); }
    };

    // ── DATA ──────────────────────────────────────────────────────────────────

    const fetchProjects = async () => {
        setMsg('Loading projects...', 'working');
        try {
            const res  = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}?ref=main`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                const slugs = data.filter(i => i.type === 'dir').map(i => i.name);
                setProjectList(slugs);
                setMsg('Ready', 'success');
                checkTouched(slugs);
            }
        } catch (err) { setMsg(`Could not load projects: ${err.message}`, 'error'); }
    };

    const checkTouched = async (slugs) => {
        const results = await Promise.all(slugs.map(async (slug) => {
            const res = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}${slug}/${metadataFile}?ref=main`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.ok ? slug : null;
        }));
        setTouchedProjects(new Set(results.filter(Boolean)));
    };

    const loadProject = async (folderName) => {
        setMsg('Opening project...', 'working');
        setProjectName(folderName);
        setTitle('');
        setClient('');
        setDescription('');
        setTags([]);
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
        if (Array.isArray(mainFiles))  mainFiles.forEach(f  => fileMap.set(f.name, f));
        if (Array.isArray(branchFiles)) branchFiles.forEach(f => fileMap.set(f.name, f));
        setImages(Array.from(fileMap.values()).filter(f => f.name.toLowerCase().endsWith('.webp')));

        const fetchMeta = async (branch) => {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${cleanPath}/${metadataFile}?ref=${branch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) { const d = await res.json(); return JSON.parse(atob(d.content)); }
            return null;
        };

        const meta = (currentBranch ? await fetchMeta(currentBranch) : null) || await fetchMeta('main');
        if (meta) {
            const loadedTitle = meta.title && meta.title !== folderName ? meta.title : '';
            setTitle(loadedTitle);
            setClient(meta.client || '');
            setDescription(meta.description || '');
            setTags(Array.isArray(meta.tags) ? meta.tags : []);
            setAltTexts(meta.images || {});
            if (loadedTitle) setProjectTitles(prev => ({ ...prev, [folderName]: loadedTitle }));
            setMsg('Ready', 'success');
        } else {
            setMsg('New project — fill in the details below.', 'success');
        }
    };

    const syncDrafts = async (branchName) => {
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
        setMsg('Saving changes...', 'working');
        const path    = `${$projectRoot}${folderName}/${metadataFile}`;
        const content = btoa(JSON.stringify(projectData, null, 2));
        try {
            const existing = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${currentBranch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const existingData = await existing.json();
            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Update: ${folderName}`, content, branch: currentBranch, sha: existingData.sha || null })
            });
            if (projectData.title) setProjectTitles(prev => ({ ...prev, [folderName]: projectData.title }));
            setMsg('Changes saved!', 'success');
            if (!drafts.includes(folderName)) setDrafts(prev => [...prev, folderName]);
        } catch (err) { setMsg(`Save failed: ${err.message}`, 'error'); }
    };

    const handleUpload = async (file) => {
        if (!currentBranch) return;
        setMsg('Uploading photo...', 'working');
        const webpBlob = await convertToWebP(file);
        const reader   = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            const fileName   = `${file.name.split('.')[0]}.webp`;
            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}${projectName}/${fileName}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Add photo: ${fileName}`, content: base64data, branch: currentBranch })
            });
            setMsg('Photo uploaded!', 'success');
            loadProject(projectName);
        };
        reader.readAsDataURL(webpBlob);
    };

    const deleteImage = async (img) => {
        if (!currentBranch) return;
        setMsg('Removing photo...', 'working');
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${img.path}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Remove photo: ${img.name}`, sha: img.sha, branch: currentBranch })
        });
        loadProject(projectName);
    };

    const convertToWebP = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/webp', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    const branchID = async () => {
        const sessionBranch = `update-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
        setMsg('Starting editing mode...', 'working');
        try {
            const mainRes  = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/main`, { headers: { Authorization: `Bearer ${token}` } });
            const mainData = await mainRes.json();
            const create   = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ref: `refs/heads/${sessionBranch}`, sha: mainData.object.sha })
            });
            if (create.ok || create.status === 422) {
                setCurrentBranch(sessionBranch);
                setMsg('Editing mode active', 'success');
                await fetchProjects();
            }
        } catch (err) { setMsg(`Error: ${err.message}`, 'error'); }
    };

    const commitToMerge = async () => {
        setMsg('Publishing to website...', 'working');
        setConfirmPublish(false);
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/merges`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ base: 'main', head: currentBranch, commit_message: `Admin Publish: ${new Date().toLocaleString()}` })
            });
            if (res.ok) {
                setMsg('Published! Your site will update in ~1 minute.', 'success');
                setDrafts([]);
                setCurrentBranch(null);
                fetchProjects();
            }
        } catch (err) { setMsg(`Publish failed: ${err.message}`, 'error'); }
    };

    // ── TAG HELPERS ───────────────────────────────────────────────────────────

    const toggleTag = (tag) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const addCustomTag = () => {
        const t = customTagInput.trim();
        if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
        setCustomTagInput('');
    };

    // ── UI HELPERS ────────────────────────────────────────────────────────────

    const statusDot = { idle: 'bg-zinc-400', working: 'bg-amber-400 animate-pulse', success: 'bg-green-500', error: 'bg-weld-red animate-pulse' }[statusType];

    const displayName = (slug) => projectTitles[slug] || formatSlug(slug);

    const saveProject = () => commitToBranch(projectName, {
        title: title.trim() || projectName,
        client,
        description,
        tags,
        images: altTexts,
    });

    // ── LOGIN SCREEN ──────────────────────────────────────────────────────────

    if (!token) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1 h-8 bg-weld-red inline-block" />
                        <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
                            ARC<span className="text-weld-red">WRIGHT</span>
                        </h1>
                    </div>
                    <p className="text-zinc-400 uppercase tracking-widest text-xs pl-3">Portfolio Manager</p>
                </div>

                <div className="bg-white border border-zinc-200 shadow-sm p-8">
                    <p className="text-zinc-900 font-bold mb-1">Welcome back</p>
                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                        Sign in to update your portfolio, add project photos, and publish changes to your website.
                    </p>
                    <button onClick={loginWithGithub} className="w-full bg-weld-red hover:bg-red-700 text-white font-bold py-4 uppercase tracking-widest text-sm transition-colors">
                        Sign In with GitHub
                    </button>
                    {statusType === 'error'   && <p className="text-weld-red  text-xs text-center mt-4">{status}</p>}
                    {statusType === 'working' && <p className="text-amber-500 text-xs text-center mt-4 animate-pulse">{status}</p>}
                </div>

                <p className="text-zinc-400 text-xs text-center mt-6 uppercase tracking-widest">arcwrightwelding.com</p>
            </motion.div>
        </div>
    );

    // ── MAIN ADMIN ────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-white text-zinc-900">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-0.5 h-6 bg-weld-red inline-block flex-shrink-0" />
                        <span className="text-lg font-black uppercase italic tracking-tighter text-zinc-900">
                            ARC<span className="text-weld-red">WRIGHT</span>
                            <span className="text-zinc-400 text-xs font-normal not-italic ml-2 tracking-widest hidden sm:inline">/ Admin</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                        {statusType === 'working' && <span className="text-amber-500 text-xs truncate animate-pulse">{status}</span>}
                        {statusType === 'error'   && <span className="text-weld-red  text-xs truncate">{status}</span>}
                        {(statusType === 'idle' || statusType === 'success') && (
                            <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
                                {currentBranch ? 'Editing' : 'Ready'}
                            </span>
                        )}
                        <button onClick={logout} className="text-zinc-400 hover:text-zinc-600 text-xs uppercase tracking-wider transition-colors shrink-0">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Staging Banner — sticky below header when editing */}
            {currentBranch && (
                <div className="sticky top-12 z-30 bg-amber-50 border-b border-amber-200 px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
                            <p className="text-zinc-800 text-xs sm:text-sm truncate">
                                {drafts.length > 0
                                    ? <><strong className="text-zinc-900">{drafts.length} project{drafts.length > 1 ? 's' : ''} staged</strong><span> — not live yet. Publish when you're done for the day.</span></>
                                    : <>Changes are <strong>staged, not live</strong>. Save your projects, then publish when you're done.</>
                                }
                            </p>
                        </div>
                        <button onClick={() => setConfirmPublish(true)} className="shrink-0 bg-weld-red hover:bg-red-700 text-white font-bold py-2.5 px-5 uppercase tracking-widest text-xs transition-colors">
                            Publish to Website
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

                {/* Start Editing Card — only shown before editing begins */}
                {!currentBranch && (
                    <div className="bg-zinc-50 border border-zinc-200 p-8">
                        <p className="text-zinc-900 font-bold text-base mb-1">Ready to make changes?</p>
                        <p className="text-zinc-700 text-sm mb-8 leading-relaxed">
                            Tap <strong className="text-zinc-900">Start Editing</strong> to begin. Nothing goes live until you choose to <strong className="text-zinc-900">Publish to Website</strong> — so you can take your time and update as many projects as you want first.
                        </p>
                        <div className="space-y-4 mb-8 border-t border-zinc-200 pt-6">
                            {[
                                { n: '1', title: 'Start Editing',        detail: 'Opens a safe staging area — nothing changes on your site yet' },
                                { n: '2', title: 'Update your projects', detail: 'Set job titles, tags, descriptions, and photos' },
                                { n: '3', title: 'Publish to Website',   detail: 'When you\'re done for the day — everything goes live in ~1 minute' },
                            ].map(s => (
                                <div key={s.n} className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-weld-red text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</span>
                                    <div>
                                        <p className="text-zinc-800 text-sm font-bold">{s.title}</p>
                                        <p className="text-zinc-600 text-xs">{s.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={branchID} className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-bold py-4 uppercase tracking-widest text-sm transition-colors">
                            Start Editing
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-zinc-200">
                    {[
                        { key: 'projects', label: `Your Projects (${projectList.length})` },
                        { key: 'editor',   label: projectName ? `Editing: ${displayName(projectName)}` : 'Edit a Project' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-3 px-5 text-xs uppercase tracking-widest font-bold transition-colors border-b-2 -mb-px truncate max-w-[50%] ${
                                activeTab === tab.key ? 'border-weld-red text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── PROJECTS TAB ── */}
                <AnimatePresence mode="wait">
                {activeTab === 'projects' && (
                    <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {currentBranch && (
                            <button
                                onClick={() => {
                                    const slug = 'IMG_' + new Date().toISOString().split('T')[0].replace(/-/g, '');
                                    setProjectName(slug); setTitle(''); setImages([]); setClient(''); setDescription(''); setTags([]); setAltTexts({});
                                    setActiveTab('editor');
                                }}
                                className="w-full border border-dashed border-zinc-300 hover:border-weld-red py-4 text-zinc-600 hover:text-weld-red text-sm font-bold uppercase tracking-widest transition-colors"
                            >
                                + Add New Project
                            </button>
                        )}

                        {/* Sub-tabs: Touched / Needs Info */}
                        {(() => {
                            const touched    = projectList.filter(n => touchedProjects.has(n));
                            const untouched  = projectList.filter(n => !touchedProjects.has(n));
                            const groups = [
                                { key: 'touched',   label: 'Info Added',  list: touched,   empty: 'No projects updated yet.' },
                                { key: 'untouched', label: 'Needs Info',  list: untouched, empty: 'All projects have been updated!' },
                            ];
                            return groups.map(({ key, label, list, empty }) => (
                                <div key={key}>
                                    <button
                                        onClick={() => setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }))}
                                        className="w-full flex items-center gap-3 mb-2 group"
                                    >
                                        <span className="text-zinc-700 text-xs font-bold uppercase tracking-widest">{label}</span>
                                        <span className="text-zinc-400 text-xs">{list.length}</span>
                                        <div className="flex-1 h-px bg-zinc-200" />
                                        <ChevronDown size={14} className={`text-zinc-400 group-hover:text-zinc-600 transition-transform shrink-0 ${collapsedGroups[key] ? '-rotate-90' : ''}`} />
                                    </button>
                                    {!collapsedGroups[key] && list.length === 0 && (
                                        <p className="text-zinc-400 text-xs py-3 pl-1">{empty}</p>
                                    )}
                                    <div className="space-y-2">
                                        {!collapsedGroups[key] && [...list]
                                            .sort((a, b) => (drafts.includes(a) ? -1 : drafts.includes(b) ? 1 : b.localeCompare(a)))
                                            .map(name => (
                                                <motion.button
                                                    key={name}
                                                    onClick={() => loadProject(name)}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`w-full text-left p-4 border transition-colors flex items-center justify-between gap-3 ${
                                                        projectName === name && activeTab === 'editor'
                                                            ? 'border-weld-red bg-weld-red/5'
                                                            : 'border-zinc-200 bg-white hover:border-zinc-400 shadow-sm'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-zinc-900 font-bold text-sm truncate">{displayName(name)}</p>
                                                        {drafts.includes(name) && (
                                                            <p className="text-amber-500 text-[10px] uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />Unsaved changes
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-zinc-500 text-xs shrink-0">Edit →</span>
                                                </motion.button>
                                            ))
                                        }
                                    </div>
                                </div>
                            ));
                        })()}
                    </motion.div>
                )}

                {/* ── EDITOR TAB ── */}
                {activeTab === 'editor' && (
                    <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">

                        {!currentBranch && (
                            <div className="border border-zinc-200 bg-zinc-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-zinc-700 text-sm text-center sm:text-left">
                                    You're in <strong className="text-zinc-900">read-only mode</strong> — tap Start Editing to make changes.
                                </p>
                                <button onClick={branchID} className="shrink-0 bg-zinc-900 hover:bg-zinc-700 text-white font-bold py-3 px-6 uppercase tracking-widest text-xs transition-colors">
                                    Start Editing
                                </button>
                            </div>
                        )}

                        {/* Section: Job Details */}
                        <div>
                            <SectionHeader label="Job Details" />
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-zinc-600 text-xs font-bold mb-2">
                                        Job Title <span className="text-zinc-600 font-normal">(shown on your website)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        disabled={!currentBranch}
                                        placeholder="e.g. Custom Driveway Gate, Structural Repair, Boat Trailer…"
                                        className="w-full bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-weld-red disabled:opacity-40 transition-colors"
                                    />
                                    {projectName && (
                                        <p className="text-zinc-400 text-[10px] mt-1 font-mono">Folder: {projectName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-zinc-600 text-xs font-bold mb-2">
                                        Client Name <span className="text-zinc-600 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={client}
                                        onChange={e => setClient(e.target.value)}
                                        disabled={!currentBranch}
                                        placeholder="e.g. Smith Family"
                                        className="w-full bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-weld-red disabled:opacity-40 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-600 text-xs font-bold mb-2">
                                        About This Job <span className="text-zinc-600 font-normal">(optional — describe the work, materials, etc.)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        disabled={!currentBranch}
                                        placeholder="What did you build? What materials did you use? What made this job stand out?"
                                        rows={4}
                                        className="w-full bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-weld-red disabled:opacity-40 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Tags */}
                        <div>
                            <SectionHeader label="Job Type / Tags" sublabel="Customers can filter the portfolio by these" />

                            <div className="flex flex-wrap gap-2 mb-4">
                                {PRESET_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => currentBranch && toggleTag(tag)}
                                        disabled={!currentBranch}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border ${
                                            tags.includes(tag)
                                                ? 'bg-weld-red border-weld-red text-white'
                                                : 'border-zinc-300 text-zinc-700 hover:border-zinc-600 hover:text-zinc-900'
                                        } disabled:opacity-40 disabled:cursor-default`}
                                    >
                                        {tag}
                                    </button>
                                ))}

                                {tags.filter(t => !PRESET_TAGS.includes(t)).map(tag => (
                                    <span key={tag} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-weld-red border border-weld-red text-white">
                                        {tag}
                                        {currentBranch && (
                                            <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:opacity-70 transition-opacity">
                                                <X size={10} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customTagInput}
                                    onChange={e => setCustomTagInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                                    placeholder={currentBranch ? "Add a custom tag…" : "Start Editing to add custom tags"}
                                    disabled={!currentBranch}
                                    className="flex-1 bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-600 px-3 py-2.5 text-xs focus:outline-none focus:border-weld-red disabled:opacity-40 disabled:cursor-default transition-colors"
                                />
                                <button
                                    onClick={addCustomTag}
                                    disabled={!currentBranch || !customTagInput.trim()}
                                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-default transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Section: Photos */}
                        <div>
                            <SectionHeader
                                label={`Photos${images.length > 0 ? ` (${images.length})` : ''}`}
                                action={<button onClick={() => loadProject(projectName)} className="text-zinc-500 hover:text-zinc-800 text-xs uppercase tracking-wider transition-colors">Refresh</button>}
                            />

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {images.map(img => {
                                    const imageID = img.name.replace('.webp', '');
                                    return (
                                        <div key={img.sha} className="border border-zinc-200 bg-white shadow-sm">
                                            <div className="relative">
                                                <img src={img.download_url} className="w-full h-32 object-cover" alt="" />
                                                {currentBranch && (
                                                    <button
                                                        onClick={() => deleteImage(img)}
                                                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-weld-red text-white w-7 h-7 flex items-center justify-center transition-colors"
                                                        aria-label="Remove photo"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-2.5">
                                                <input
                                                    type="text"
                                                    value={altTexts[imageID] || ''}
                                                    onChange={e => setAltTexts(prev => ({ ...prev, [imageID]: e.target.value }))}
                                                    placeholder="Photo description…"
                                                    disabled={!currentBranch}
                                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-600 px-2 py-1.5 text-xs focus:outline-none focus:border-weld-red disabled:opacity-40"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {currentBranch && (
                                    <label className="border-2 border-dashed border-zinc-300 hover:border-weld-red h-[8.5rem] flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                        <span className="text-3xl mb-1.5">📷</span>
                                        <span className="text-zinc-600 group-hover:text-weld-red text-xs uppercase tracking-widest font-bold transition-colors">Add Photo</span>
                                        <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files[0])} className="hidden" />
                                    </label>
                                )}

                                {images.length === 0 && !currentBranch && (
                                    <div className="col-span-2 sm:col-span-3 border border-zinc-200 p-10 text-center">
                                        <p className="text-zinc-600 text-sm">No photos yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        {currentBranch && (
                            <div>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={saveProject}
                                    className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-bold py-4 uppercase tracking-widest text-sm transition-colors"
                                >
                                    Save Changes
                                </motion.button>
                                <p className="text-zinc-600 text-xs text-center mt-2">
                                    Saved to staging — use <strong className="text-zinc-700">Publish to Website</strong> at the top when you're done for the day.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Publish Confirm Modal */}
            <AnimatePresence>
            {confirmPublish && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmPublish(false)} />
                    <motion.div
                        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                        className="relative z-10 w-full max-w-sm bg-white border border-zinc-200 shadow-xl p-8"
                    >
                        <h2 className="text-2xl font-black uppercase italic text-zinc-900 mb-2">Publish to Website?</h2>
                        <p className="text-zinc-500 text-sm mb-2 leading-relaxed">
                            All staged changes will go live on <strong className="text-zinc-900">arcwrightwelding.com</strong> in about 1 minute. This is the final step.
                        </p>
                        {drafts.length > 0 && (
                            <p className="text-amber-500 text-xs mb-6 uppercase tracking-widest">
                                {drafts.length} project{drafts.length > 1 ? 's' : ''} will be updated
                            </p>
                        )}
                        {drafts.length === 0 && <div className="mb-6" />}
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmPublish(false)} className="flex-1 border border-zinc-300 hover:border-zinc-500 text-zinc-500 hover:text-zinc-900 font-bold py-3 uppercase tracking-widest text-xs transition-colors">
                                Cancel
                            </button>
                            <button onClick={commitToMerge} className="flex-1 bg-weld-red hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors">
                                Publish Now
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

const SectionHeader = ({ label, sublabel, action }) => (
    <div className="flex items-center gap-3 mb-5">
        <span className="text-zinc-700 text-xs uppercase tracking-widest font-bold shrink-0">{label}</span>
        {sublabel && <span className="text-zinc-600 text-[10px] shrink-0">{sublabel}</span>}
        <div className="flex-1 h-px bg-zinc-200" />
        {action}
    </div>
);

export default AdminPortal;
