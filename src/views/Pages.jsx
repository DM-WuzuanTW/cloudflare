import { useEffect, useState } from 'react';
import { FaFileCode, FaExternalLinkAlt, FaGitAlt } from 'react-icons/fa';

export default function Pages() {
    const [accounts, setAccounts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.electronAPI.invoke('getAccounts').then(accs => {
            setAccounts(accs);
            if (accs.length > 0) {
                setSelectedAccount(accs[0].id);
                fetchProjects(accs[0].id);
            }
        });
    }, []);

    const fetchProjects = (accId) => {
        setLoading(true);
        window.electronAPI.invoke('getPagesProjects', accId)
            .then(res => {
                setProjects(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    if (loading && accounts.length === 0) return <div>Loading Pages...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cloudflare Pages</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '5px 0 0 0' }}>Build and deploy full-stack applications.</p>
                </div>
                {accounts.length > 0 && (
                    <select
                        className="input"
                        style={{ width: 200 }}
                        onChange={e => { setSelectedAccount(e.target.value); fetchProjects(e.target.value); }}
                        value={selectedAccount || ''}
                    >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                )}
            </div>

            <div className="grid-cols-2">
                {projects.map(project => (
                    <div key={project.name} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: 18 }}>{project.name}</h3>
                            <span className="badge badge-success">Active</span>
                        </div>

                        <div style={{ margin: '15px 0', padding: 12, background: 'var(--bg-app)', borderRadius: 6, fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: 'var(--text-secondary)' }}>
                                <FaGitAlt /> Source
                            </div>
                            <div style={{ color: 'var(--text-primary)' }}>
                                {project.production_branch}
                                <span style={{ color: 'var(--text-muted)' }}> • {project.source?.type || 'Direct Upload'}</span>
                            </div>
                        </div>

                        <a href={`https://${project.subdomain}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
                            {project.subdomain} <FaExternalLinkAlt style={{ fontSize: 12 }} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
