import { useEffect, useState } from 'react';

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Cloudflare Pages</h2>
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
                        <h3 style={{ fontSize: '1.2em' }}>{project.name}</h3>
                        <p className="text-sec" style={{ fontSize: 13, marginBottom: 10 }}>
                            {project.production_branch} • {project.source?.type || 'Direct Upload'}
                        </p>
                        <a href={`https://${project.subdomain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>
                            {project.subdomain}
                        </a>
                        <div style={{ marginTop: 15 }}>
                            <span className="status-badge status-active">Active</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
