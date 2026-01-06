import { useEffect, useState } from 'react';
import { FaBolt, FaTrash } from 'react-icons/fa';

export default function Cache() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [purging, setPurging] = useState(false);

    useEffect(() => {
        window.electronAPI.invoke('getZones').then(res => {
            setZones(res);
            if (res.length > 0) setSelectedZone(res[0].id);
        });
    }, []);

    const handlePurgeAll = async () => {
        if (!confirm('Are you sure you want to purge EVERYTHING? This may cause load spikes on your origin.')) return;
        setPurging(true);
        try {
            await window.electronAPI.invoke('purgeCache', selectedZone, true, []);
            alert('Purge request sent successfully.');
        } catch (e) {
            alert('Purge failed: ' + e.message);
        }
        setPurging(false);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cache Management</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Speed up your site by managing Cloudflare cache.</p>
                </div>
                <select className="input" style={{ width: 250 }} value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                    <FaBolt style={{ fontSize: 24, color: 'var(--cf-blue)' }} />
                    <div>
                        <h3 style={{ margin: 0 }}>Purge Cache</h3>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                            Clear cached files to force Cloudflare to fetch a fresh version from your server.
                        </p>
                    </div>
                </div>

                <div style={{ padding: 20, background: 'var(--bg-app)', borderRadius: 8 }}>
                    <h4 style={{ marginBottom: 10 }}>Purge Everything</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 15 }}>
                        Remove all cached resources for this zone.
                    </p>
                    <button className="btn btn-secondary" onClick={handlePurgeAll} disabled={purging} style={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}>
                        <FaTrash style={{ marginRight: 8 }} />
                        {purging ? 'Purging...' : 'Banish All Cache'}
                    </button>
                </div>
            </div>
        </div>
    );
}
