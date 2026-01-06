import { useEffect, useState } from 'react';
import { FaNetworkWired, FaEdit, FaTrash, FaCloud, FaCloudShowersHeavy, FaPlus } from 'react-icons/fa';

export default function DNS() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRecord, setNewRecord] = useState({ type: 'A', name: '', content: '', proxied: true, ttl: 1 });

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

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newRecord.name || !newRecord.content) return;
        setLoading(true);
        try {
            await window.electronAPI.invoke('createDNSRecord', selectedZone, newRecord);
            setShowAddForm(false);
            setNewRecord({ type: 'A', name: '', content: '', proxied: true, ttl: 1 });
            loadRecords(selectedZone);
        } catch (err) {
            alert('Failed to create record: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        setLoading(true);
        try {
            await window.electronAPI.invoke('deleteDNSRecord', selectedZone, recordId);
            loadRecords(selectedZone);
        } catch (err) {
            alert('Delete failed: ' + err.message);
            setLoading(false);
        }
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
                    <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                        <FaPlus /> {showAddForm ? 'Cancel' : 'Add Record'}
                    </button>
                </div>

                {showAddForm && (
                    <form onSubmit={handleCreate} style={{ padding: 20, background: 'var(--bg-app)', marginBottom: 20, borderRadius: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 12 }}>Type</label>
                            <select className="input" value={newRecord.type} onChange={e => setNewRecord({ ...newRecord, type: e.target.value })} style={{ width: 100 }}>
                                {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                            <label style={{ fontSize: 12 }}>Name (@ for root)</label>
                            <input className="input" placeholder="e.g. www" value={newRecord.name} onChange={e => setNewRecord({ ...newRecord, name: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 2 }}>
                            <label style={{ fontSize: 12 }}>Content</label>
                            <input className="input" placeholder="IP address or domain" value={newRecord.content} onChange={e => setNewRecord({ ...newRecord, content: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 12 }}>Proxy</label>
                            <div style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 10px', background: 'var(--bg-input)', borderRadius: 4, cursor: 'pointer' }} onClick={() => setNewRecord({ ...newRecord, proxied: !newRecord.proxied })}>
                                {newRecord.proxied ? <FaCloud style={{ color: '#F6821F' }} /> : <FaCloudShowersHeavy style={{ color: '#666' }} />}
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit">Save</button>
                    </form>
                )}

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
                                            <FaTrash style={{ cursor: 'pointer', color: 'var(--status-error-text)' }} title="Delete" onClick={() => handleDelete(r.id)} />
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
