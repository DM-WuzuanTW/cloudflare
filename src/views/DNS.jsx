import { useEffect, useState, useMemo } from 'react';
import {
    FaNetworkWired, FaEdit, FaTrash, FaCloud, FaCloudShowersHeavy,
    FaPlus, FaSearch, FaTimes, FaCheck, FaGlobeAmericas, FaShieldAlt
} from 'react-icons/fa';

export default function DNS() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null); // null = create mode
    const [formData, setFormData] = useState({
        type: 'A', name: '', content: '', proxied: true, ttl: 1
    });

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        try {
            const res = await window.electronAPI.invoke('getZones');
            setZones(res);
            if (res.length > 0) {
                const initialZone = res[0].id;
                setSelectedZone(initialZone);
                loadRecords(initialZone);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadRecords = async (zoneId) => {
        if (!zoneId) return;
        setLoading(true);
        try {
            const res = await window.electronAPI.invoke('getDNSRecords', zoneId);
            setRecords(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleZoneChange = (e) => {
        const zid = e.target.value;
        setSelectedZone(zid);
        loadRecords(zid);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            type: record.type,
            name: record.name,
            content: record.content,
            proxied: record.proxied,
            ttl: record.ttl
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingRecord(null);
        setFormData({ type: 'A', name: '', content: '', proxied: true, ttl: 1 });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingRecord) {
                await window.electronAPI.invoke('updateDNSRecord', selectedZone, editingRecord.id, formData);
            } else {
                await window.electronAPI.invoke('createDNSRecord', selectedZone, formData);
            }
            setIsModalOpen(false);
            loadRecords(selectedZone);
        } catch (err) {
            alert('Operation failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
        setLoading(true);
        try {
            await window.electronAPI.invoke('deleteDNSRecord', selectedZone, recordId);
            loadRecords(selectedZone);
        } catch (err) {
            alert('Delete failed: ' + err.message);
            setLoading(false);
        }
    };

    const filteredRecords = useMemo(() => {
        return records.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [records, searchQuery]);

    const stats = useMemo(() => {
        return {
            total: records.length,
            proxied: records.filter(r => r.proxied).length,
            dnsOnly: records.filter(r => !r.proxied).length
        };
    }, [records]);

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header Section */}
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FaNetworkWired style={{ color: 'var(--cf-orange)' }} />
                        DNS Management
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
                        Manage DNS records for your domains with ease.
                    </p>
                </div>

                <div style={{ position: 'relative' }}>
                    <FaGlobeAmericas style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <select
                        className="input"
                        style={{ paddingLeft: 36, minWidth: 250, borderColor: selectedZone ? 'var(--cf-orange)' : '' }}
                        value={selectedZone}
                        onChange={handleZoneChange}
                    >
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid-cols-3" style={{ marginBottom: 24 }}>
                <StatsCard label="Total Records" value={stats.total} icon={<FaNetworkWired />} color="#0051C3" />
                <StatsCard label="Proxied" value={stats.proxied} icon={<FaCloud />} color="#F6821F" />
                <StatsCard label="DNS Only" value={stats.dnsOnly} icon={<FaCloudShowersHeavy />} color="#666" />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div className="input-group" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '0 12px' }}>
                    <FaSearch style={{ color: 'var(--text-muted)' }} />
                    <input
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '10px', width: '100%', outline: 'none' }}
                        placeholder="Search records by name, content, or type..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && <FaTimes style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchQuery('')} />}
                </div>
                <button className="btn btn-primary" onClick={handleAddNew} style={{ padding: '0 24px', height: 42 }}>
                    <FaPlus /> Add Record
                </button>
            </div>

            {/* Records List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '16px 24px', width: 80 }}>Type</th>
                                <th style={{ padding: '16px 24px' }}>Name</th>
                                <th style={{ padding: '16px 24px' }}>Content</th>
                                <th style={{ padding: '16px 24px', width: 100 }}>Proxy Status</th>
                                <th style={{ padding: '16px 24px', width: 80 }}>TTL</th>
                                <th style={{ padding: '16px 24px', width: 100, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Loading records...
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {searchQuery ? 'No matching records found.' : 'No DNS records found for this zone.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: 13, padding: '4px 8px', borderRadius: 4, background: getTypeColor(r.type), color: '#fff' }}>
                                                {r.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: 500 }}>{r.name}</td>
                                        <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                            <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.content}>
                                                {r.content}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {r.proxied ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cf-orange)' }}>
                                                    <FaCloud /> <span style={{ fontSize: 13, fontWeight: 500 }}>Proxied</span>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                                    <FaCloudShowersHeavy /> <span style={{ fontSize: 13 }}>DNS Only</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                                            {r.ttl === 1 ? 'Auto' : `${r.ttl}s`}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button className="btn-icon" onClick={() => handleEdit(r)} title="Edit">
                                                    <FaEdit />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => handleDelete(r.id)} title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: 500, padding: 0, border: '1px solid var(--border-active)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: 18 }}>{editingRecord ? 'Edit DNS Record' : 'Add DNS Record'}</h3>
                            <FaTimes style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        </div>

                        <form onSubmit={handleSave} style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gap: 20 }}>
                                <div className="grid-cols-2" style={{ gap: 16 }}>
                                    <div className="input-group">
                                        <label className="input-label">Type</label>
                                        <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">TTL</label>
                                        <select className="input" value={formData.ttl} onChange={e => setFormData({ ...formData, ttl: Number(e.target.value) })}>
                                            <option value={1}>Auto</option>
                                            <option value={60}>1 min</option>
                                            <option value={120}>2 mins</option>
                                            <option value={300}>5 mins</option>
                                            <option value={3600}>1 hour</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Name</label>
                                    <input className="input" placeholder="e.g. www (use @ for root)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Content</label>
                                    <textarea
                                        className="input"
                                        placeholder="IPv4 address (e.g. 1.2.3.4) or target domain"
                                        rows={3}
                                        style={{ resize: 'vertical', minHeight: 80, fontFamily: 'monospace' }}
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Proxy Status</label>
                                    <div
                                        onClick={() => setFormData({ ...formData, proxied: !formData.proxied })}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: 16, border: '1px solid', borderColor: formData.proxied ? 'var(--cf-orange)' : 'var(--border-subtle)',
                                            borderRadius: 6, cursor: 'pointer', background: formData.proxied ? 'rgba(246, 130, 31, 0.1)' : 'transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {formData.proxied ? <FaCloud size={20} color="var(--cf-orange)" /> : <FaCloudShowersHeavy size={20} color="var(--text-muted)" />}
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{formData.proxied ? 'Proxied' : 'DNS Only'}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    {formData.proxied ? 'Traffic is accelerated and protected by Cloudflare.' : 'Traffic bypasses Cloudflare causing exposure.'}
                                                </div>
                                            </div>
                                        </div>
                                        {formData.proxied && <FaCheck color="var(--cf-orange)" />}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .btn-icon {
                    width: 32px; height: 32px;
                    display: flex; align-items: center; justifyContent: center;
                    border: none; background: transparent; border-radius: 4px;
                    color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
                }
                .btn-icon:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
                .btn-icon.danger:hover { background: rgba(248, 81, 73, 0.2); color: var(--status-error-text); }
                .table-row-hover:hover { background: rgba(255,255,255,0.03) !important; }
            `}</style>
        </div>
    );
}

function getTypeColor(type) {
    switch (type) {
        case 'A': return '#2c7be5';
        case 'AAAA': return '#1d55e0';
        case 'CNAME': return '#e5a52c';
        case 'TXT': return '#38a853';
        case 'MX': return '#d13c71';
        case 'NS': return '#763cd1';
        default: return '#666';
    }
}

function StatsCard({ label, value, icon, color }) {
    return (
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: color }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
            </div>
        </div>
    );
}
