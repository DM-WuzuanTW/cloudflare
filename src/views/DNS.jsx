import { useEffect, useState } from 'react';
import { FaNetworkWired, FaEdit, FaTrash, FaCloud, FaCloudShowersHeavy, FaPlus } from 'react-icons/fa';

export default function DNS() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load zones for selection
        window.electronAPI.invoke('getZones').then(res => {
            setZones(res);
            if (res.length > 0) {
                setSelectedZone(res[0].id);
                loadRecords(res[0].id);
            }
        });
    }, []);

    const loadRecords = (zoneId) => {
        setLoading(true);
        window.electronAPI.invoke('getDNSRecords', zoneId).then(res => {
            setRecords(res);
            setLoading(false);
        });
    };

    const handleZoneChange = (e) => {
        const zid = e.target.value;
        setSelectedZone(zid);
        loadRecords(zid);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">DNS Management</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage DNS records for your zones.</p>
                </div>
                <select className="input" style={{ width: 250 }} value={selectedZone} onChange={handleZoneChange}>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3>DNS Records</h3>
                    <button className="btn btn-primary"><FaPlus /> Add Record</button>
                </div>

                {loading ? <div>Loading records...</div> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                <th style={{ padding: 10, color: 'var(--text-secondary)' }}>Type</th>
                                <th style={{ padding: 10, color: 'var(--text-secondary)' }}>Name</th>
                                <th style={{ padding: 10, color: 'var(--text-secondary)' }}>Content</th>
                                <th style={{ padding: 10, color: 'var(--text-secondary)' }}>Proxy</th>
                                <th style={{ padding: 10, color: 'var(--text-secondary)' }}>TTL</th>
                                <th style={{ padding: 10, color: 'var(--text-secondary)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: 10, fontWeight: 'bold' }}>{r.type}</td>
                                    <td style={{ padding: 10 }}>{r.name}</td>
                                    <td style={{ padding: 10, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</td>
                                    <td style={{ padding: 10 }}>
                                        {r.proxied ?
                                            <FaCloud style={{ color: '#F6821F' }} title="Proxied" /> :
                                            <FaCloudShowersHeavy style={{ color: 'var(--text-secondary)' }} title="DNS Only" />
                                        }
                                    </td>
                                    <td style={{ padding: 10 }}>{r.ttl === 1 ? 'Auto' : r.ttl}</td>
                                    <td style={{ padding: 10 }}>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <FaEdit style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
                                            <FaTrash style={{ cursor: 'pointer', color: 'var(--status-error-text)' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
