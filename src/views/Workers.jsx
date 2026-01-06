import { useEffect, useState } from 'react';

export default function Workers() {
    const [accounts, setAccounts] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.electronAPI.invoke('getAccounts').then(accs => {
            setAccounts(accs);
            if (accs.length > 0) {
                setSelectedAccount(accs[0].id);
                fetchScripts(accs[0].id);
            } else {
                setLoading(false);
            }
        }).catch(e => setLoading(false));
    }, []);

    const fetchScripts = (accId) => {
        setLoading(true);
        window.electronAPI.invoke('getWorkersScripts', accId)
            .then(res => {
                setScripts(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    if (loading && accounts.length === 0) return <div>Loading Workers...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Cloudflare Workers</h2>
                {accounts.length > 0 && (
                    <select
                        className="input"
                        style={{ width: 200 }}
                        onChange={e => { setSelectedAccount(e.target.value); fetchScripts(e.target.value); }}
                        value={selectedAccount || ''}
                    >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                )}
            </div>

            {scripts.length === 0 ? <div className="text-sec">No workers found.</div> : (
                <div className="grid-cols-3">
                    {scripts.map(script => (
                        <div key={script.id} className="card">
                            <h3 style={{ fontSize: '1.1em' }}>{script.id}</h3>
                            <p className="text-sec" style={{ fontSize: 12 }}>
                                Updated: {new Date(script.modified_on).toLocaleDateString()}
                            </p>
                            <div style={{ marginTop: 15, display: 'flex', gap: 5 }}>
                                <button className="btn" style={{ fontSize: 12, background: '#238636', color: 'white' }}>Deploy</button>
                                <button className="btn" style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)' }}>Logs</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
