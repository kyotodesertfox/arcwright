import React, { useState, useEffect } from 'react';

const $projectRoot = 'public/projects/';
const metadataFile = 'metadata.json';

const AdminPortal = () => {
    const [currentBranch, setCurrentBranch] = useState(null);
    const [status, setStatus] = useState('Idle');
    const [projectName, setProjectName] = useState('IMG_' + new Date().toISOString().split('T')[0].replace(/-/g, ''));
    const [description, setDescription] = useState('');
    const [client, setClient] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [images, setImages] = useState([]);
    const [altTexts, setAltTexts] = useState({});
    const [token, setToken] = useState(localStorage.getItem('github_token') || null);

    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
    const REPO_OWNER = import.meta.env.VITE_REPO_OWNER;
    const REPO_NAME = import.meta.env.VITE_REPO_NAME;

    useEffect(() => {
        if (currentBranch && projectList.length > 0) {
            syncSessionDrafts(currentBranch);
        }
    }, [currentBranch, projectList.length]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && !token) {
            handleTokenExchange(code);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchProjects();
        }
    }, [token]);

    const loginWithGithub = () => {
        const scope = 'repo';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}`;
    };

    const logout = () => {
        localStorage.removeItem('github_token');
        setToken(null);
        setStatus("Logged out.");
    };

    const handleTokenExchange = async (code) => {
        setStatus("Authenticating...");
        try {
            const res = await fetch(`/.netlify/functions/auth?code=${code}`);
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('github_token', data.token);
                setToken(data.token);
                window.history.replaceState({}, document.title, "/");
                setStatus("Authenticated!");
            }
        } catch (err) { setStatus("Login failed."); }
    };

    const fetchProjects = async () => {
        setStatus("Fetching projects...");
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}?ref=main`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProjectList(data.filter(item => item.type === 'dir').map(item => item.name));
                setStatus("List updated.");
            }
        } catch (err) { setStatus(`Fetch error: ${err.message}`); }
    };

    const loadProject = async (folderName) => {
        setStatus(`Loading ${folderName}...`);
        setProjectName(folderName);
        setImages([]);
        setAltTexts({});

        const cleanRoot = $projectRoot.replace(/^\/+|\/+$/g, '');
        const cleanFolder = folderName.replace(/^\/+|\/+$/g, '');
        const fullPath = `${cleanRoot}/${cleanFolder}`;

        const fetchFromBranch = async (branch) => {
            try {
                const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fullPath}?ref=${branch}`, {
                    headers: { Authorization: `Bearer ${token}` } // Must be Bearer ${token}
                });
                return res.ok ? await res.json() : null;
            } catch (e) { return null; }
        };

        let branchFiles = currentBranch ? await fetchFromBranch(currentBranch) : null;
        let mainFiles = await fetchFromBranch('main');

        const fileMap = new Map();
        if (Array.isArray(mainFiles)) mainFiles.forEach(f => fileMap.set(f.name, f));
        if (Array.isArray(branchFiles)) branchFiles.forEach(f => fileMap.set(f.name, f));

        const allFiles = Array.from(fileMap.values());
        const webps = allFiles.filter(f => f.name.toLowerCase().endsWith('.webp'));

        setImages(webps.map(img => ({ ...img, displayUrl: img.download_url })));

        const fetchMeta = async (branch) => {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fullPath}/${metadataFile}?ref=${branch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                return JSON.parse(atob(data.content));
            }
            return null;
        };

        const meta = (currentBranch ? await fetchMeta(currentBranch) : null) || await fetchMeta('main');

        if (meta) {
            setClient(meta.client || '');
            setDescription(meta.description || '');
            setAltTexts(meta.images || {});
            setStatus(`Loaded ${folderName} (Synced)`);
        } else {
            setClient('');
            setDescription('');
            setStatus(`Ready for ${folderName} (New Project)`);
        }
    };

    const syncSessionDrafts = async (branchName) => {
        setStatus("Syncing drafts...");
        try {
            const checks = projectList.map(name =>
            fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}${name}/${metadataFile}?ref=${branchName}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.ok ? name : null)
            );
            const results = await Promise.all(checks);
            setDrafts(results.filter(name => name !== null));
            setStatus("Drafts synced.");
        } catch (err) { setStatus("Draft sync failed."); }
    };

    const commitToBranch = async (folderName, projectData) => {
        if (!currentBranch) return alert("Start a session first!");
        setStatus(`Saving to ${folderName}...`);
        const pathUpdate = `${$projectRoot}${folderName}/${metadataFile}`;
        const content = btoa(JSON.stringify(projectData, null, 2));

        try {
            const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pathUpdate}?ref=${currentBranch}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const fileData = await getFile.json();
            const sha = fileData.sha || null;

            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pathUpdate}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: `Admin Update: ${folderName}`, content, branch: currentBranch, sha })
            });

            setStatus(`Saved ${folderName}!`);
            if (!drafts.includes(folderName)) setDrafts(prev => [...prev, folderName]);
        } catch (err) { setStatus(`Save failed: ${err.message}`); }
    };

    const handleUpload = async (file) => {
        if (!currentBranch) return alert("Start a session first!");
        setStatus("Converting to WebP...");
        const webpBlob = await convertToWebP(file);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            const fileName = `${file.name.split('.')[0]}.webp`;
            const path = `${$projectRoot}${projectName}/${fileName}`;
            setStatus(`Uploading ${fileName}...`);
            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: `Add image: ${fileName}`, content: base64data, branch: currentBranch })
            });
            setStatus("Image Uploaded!");
            loadProject(projectName);
        };
        reader.readAsDataURL(webpBlob);
    };

    const deleteImage = async (img) => {
        if (!currentBranch || !window.confirm("Delete this image?")) return;
        setStatus(`Deleting ${img.name}...`);
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${img.path}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: `Remove image: ${img.name}`, sha: img.sha, branch: currentBranch })
        });
        loadProject(projectName);
    };

    const convertToWebP = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const branchID = async () => {
        const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sessionBranch = `update-${currentDate}`;
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
                setStatus(`Session Active: ${sessionBranch}`);
                await fetchProjects();
            }
        } catch (err) { setStatus(`Error: ${err.message}`); }
    };

    const commitToMerge = async () => {
        if (!currentBranch || !window.confirm("Publish changes to live site?")) return;
        setStatus("Merging...");
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/merges`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ base: 'main', head: currentBranch, commit_message: `Admin Publish: ${new Date().toLocaleString()}` })
            });
            if (res.ok) {
                setStatus("LIVE!");
                setDrafts([]);
                setCurrentBranch(null);
                fetchProjects();
            }
        } catch (err) { setStatus(`Merge error: ${err.message}`); }
    };

    const mainLayout = { display: 'flex', gap: '40px', padding: '40px', color: '#fff', background: '#111', minHeight: '100vh', fontFamily: 'sans-serif' };
    const sidebarStyle = { width: '300px', background: '#222', padding: '20px', borderRadius: '12px', border: '1px solid #333' };
    const editorStyle = { flex: 1, background: '#1a1a1a', padding: '30px', borderRadius: '12px', border: '1px solid #333' };
    const inputStyle = { width: '100%', padding: '12px', margin: '10px 0 20px 0', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px' };

    if (!token) {
        return (
            <div style={{ ...mainLayout, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', background: '#222', padding: '50px', borderRadius: '12px', border: '1px solid #333' }}>
            <h1 style={{ color: '#fff' }}>Arcwright Admin</h1><br />
            <button onClick={loginWithGithub} style={{ padding: '15px 30px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>LOGIN WITH GITHUB</button>
            <p style={{ marginTop: '20px', color: '#888' }}>{status}</p>
            </div>
            </div>
        );
    }

    return (
        <div style={mainLayout}>
        <div style={sidebarStyle}>
        <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Projects</h2>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {projectList
            .sort((a, b) => (drafts.includes(a) ? -1 : drafts.includes(b) ? 1 : b.localeCompare(a)))
            .map(name => (
                <div key={name} onClick={() => loadProject(name)} style={{ padding: '12px', cursor: 'pointer', background: projectName === name ? '#007bff' : 'transparent', display: 'flex', justifyContent: 'space-between', borderRadius: '6px', borderLeft: drafts.includes(name) ? '4px solid #ffc107' : 'none' }}>
                <span>{name}</span>
                {drafts.includes(name) && <span style={{ fontSize: '0.7rem', color: '#ffc107' }}>● DRAFT</span>}
                </div>
            ))}
            </div>
            <button onClick={() => setProjectName('IMG_' + new Date().toISOString().split('T')[0].replace(/-/g, ''))} style={{ width: '100%', marginTop: '20px' }}>+ New Project</button>
            </div>

            <div style={editorStyle}>
            <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '6px', background: '#2d333b', border: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
            <div>{currentBranch ? <span>⚠️ Session: <strong style={{ color: '#ffc107' }}>{currentBranch}</strong></span> : <span>🌐 Live: <strong>main</strong></span>}</div>
            <button onClick={logout} style={{ background: 'none', color: '#888', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
            {currentBranch && <button onClick={commitToMerge} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold' }}>PUBLISH CHANGES</button>}
            </div>

            <div style={{ background: '#333', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
            <strong>Status:</strong> <span style={{ color: '#00ff00' }}>{status}</span>
            </div>

            <div style={{ background: '#222', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0 }}>Project Assets</h4>
            <div>
            <span style={{ fontSize: '0.8rem', color: '#888', marginRight: '10px' }}>Count: {images.length}</span>
            <button onClick={() => loadProject(projectName)} style={{ background: '#444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>REFRESH</button>
            </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
            {images.map(img => {
                const imageID = img.name.replace('.webp', '');
                return (
                    <div key={img.sha} style={{ background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #444' }}>
                    <img src={img.download_url} style={{ width: '100%', height: '100px', objectFit: 'cover' }} alt="" />
                    <input type="text" value={altTexts[imageID] || ''} onChange={(e) => setAltTexts(prev => ({ ...prev, [imageID]: e.target.value }))} style={{ ...inputStyle, padding: '5px', fontSize: '0.75rem' }} placeholder="Alt Text" />
                    <button onClick={() => deleteImage(img)} style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '0.7rem', width: '100%' }}>Delete</button>
                    </div>
                );
            })}
            </div>
            <label style={{ display: 'inline-block', padding: '10px 20px', background: '#007bff', color: 'white', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }}>
            CHOOSE IMAGE
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files[0])} style={{ display: 'none' }} />
            </label>
            </div>

            {!currentBranch ? (
                <button onClick={branchID} style={{ padding: '20px 40px', fontSize: '1.2rem' }}>Start Daily Session</button>
            ) : (
                <>
                <h3>Edit: {projectName}</h3>
                <label>Client</label>
                <input type="text" value={client} onChange={e => setClient(e.target.value)} style={inputStyle} />
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: '150px' }} />
                <button onClick={() => commitToBranch(projectName, { title: projectName, client, description, images: altTexts })} style={{ width: '100%', padding: '20px', background: '#28a745', color: '#fff', fontWeight: 'bold' }}>SAVE TO BRANCH</button>
                </>
            )}
            </div>
            </div>
    );
};

export default AdminPortal;
