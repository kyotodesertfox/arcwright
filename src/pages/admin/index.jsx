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

    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
    const REPO_OWNER = import.meta.env.VITE_REPO_OWNER;
    const REPO_NAME = import.meta.env.VITE_REPO_NAME;

    const fetchProjects = async () => {
        setStatus("Fetching projects...");
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}?ref=main`, {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
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
        try {
            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${$projectRoot}${folderName}/${metadataFile}?ref=main`, {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            const data = await res.json();
            const content = JSON.parse(atob(data.content));
            setClient(content.client || '');
            setDescription(content.description || '');
            setStatus(`Loaded ${folderName}`);
        } catch (err) { setStatus(`Ready for ${folderName}`); }
    };

    const commitToBranch = async (folderName, projectData) => {
        if (!currentBranch) return alert("Start a session first!");
        setStatus(`Saving to ${folderName}...`);
        const pathUpdate = `${$projectRoot}${folderName}/${metadataFile}`;
        const content = btoa(JSON.stringify(projectData, null, 2));

        try {
            const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pathUpdate}?ref=${currentBranch}`, {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            const fileData = await getFile.json();
            const sha = fileData.sha || null;

            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pathUpdate}`, {
                method: 'PUT',
                headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Admin Update: ${folderName}`, content, branch: currentBranch, sha })
            });
            setStatus(`Saved ${folderName}!`);
            fetchProjects();
        } catch (err) { setStatus(`Save failed: ${err.message}`); }
    };

    const branchID = async () => {
        const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sessionBranch = `update-${currentDate}`;
        try {
            const mainRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/main`, {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            const mainData = await mainRes.json();
            const createRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`, {
                method: 'POST',
                headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref: `refs/heads/${sessionBranch}`, sha: mainData.object.sha })
            });
            if (createRes.ok || createRes.status === 422) {
                setCurrentBranch(sessionBranch);
                setStatus(`Session Active: ${sessionBranch}`);
                fetchProjects();
            }
        } catch (err) { setStatus(`Error: ${err.message}`); }
    };

    const mainLayout = { display: 'flex', gap: '40px', padding: '40px', color: '#fff', background: '#111', minHeight: '100vh', fontFamily: 'sans-serif' };
    const sidebarStyle = { width: '300px', background: '#222', padding: '20px', borderRadius: '12px', border: '1px solid #333' };
    const editorStyle = { flex: 1, background: '#1a1a1a', padding: '30px', borderRadius: '12px', border: '1px solid #333' };
    const inputStyle = { width: '100%', padding: '12px', margin: '10px 0 20px 0', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px' };

    return (
        <div style={mainLayout}>
        <div style={sidebarStyle}>
        <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Projects</h2>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {projectList.map(name => (
            <div key={name} onClick={() => loadProject(name)} style={{ padding: '12px', cursor: 'pointer', background: projectName === name ? '#007bff' : 'transparent', borderRadius: '6px', marginBottom: '5px' }}>
            {name}
            </div>
        ))}
        </div>
        <button onClick={() => setProjectName('IMG_' + new Date().toISOString().split('T')[0].replace(/-/g, ''))} style={{ width: '100%', marginTop: '20px', padding: '10px' }}>+ New Project</button>
        </div>
        <div style={editorStyle}>
        <div style={{ background: '#333', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
        <strong>Status:</strong> <span style={{ color: '#00ff00' }}>{status}</span>
        </div>
        {!currentBranch ? (
            <button onClick={branchID} style={{ padding: '20px 40px', fontSize: '1.2rem', cursor: 'pointer' }}>Start Daily Session</button>
        ) : (
            <>
            <h3>Edit: {projectName}</h3>
            <label>Folder Name</label>
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} style={inputStyle} />
            <label>Client</label>
            <input type="text" value={client} onChange={e => setClient(e.target.value)} style={inputStyle} />
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: '150px' }} />
            <button onClick={() => commitToBranch(projectName, {title: projectName, client, description})} style={{ width: '100%', padding: '20px', background: '#28a745', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>SAVE TO BRANCH</button>
            </>
        )}
        </div>
        </div>
    );
};

export default AdminPortal;
