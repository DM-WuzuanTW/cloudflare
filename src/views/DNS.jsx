import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FaPlus, FaSearch, FaTimes, FaCheck, FaGlobeAmericas, FaShieldAlt,
    FaChevronDown
} from 'react-icons/fa';

export default function DNS() {
    const { t } = useTranslation();
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

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
            alert(t('dns_mgmt.alerts.op_failed') + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!confirm(t('dns_mgmt.alerts.delete_confirm'))) return;
        setLoading(true);
        try {
            await window.electronAPI.invoke('deleteDNSRecord', selectedZone, recordId);
            loadRecords(selectedZone);
        } catch (err) {
            alert(t('dns_mgmt.alerts.delete_failed') + err.message);
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
                        {t('dns_mgmt.title')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
                        {t('dns_mgmt.subtitle')}
                    </p>
                </div>

                <div style={{ position: 'relative', minWidth: 280, zIndex: 100 }}>
                    <div
                        onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'var(--bg-input)',
                            border: `1px solid ${isZoneDropdownOpen ? 'var(--cf-orange)' : 'var(--border-subtle)'}`,
                            padding: '10px 14px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: isZoneDropdownOpen ? '0 0 0 1px var(--cf-orange)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FaGlobeAmericas style={{ color: selectedZone ? 'var(--cf-orange)' : 'var(--text-muted)' }} />
                            <span style={{ fontWeight: 600, color: selectedZone ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 14 }}>
                                {zones.find(z => z.id === selectedZone)?.name || t('dns_mgmt.select_zone')}
                            </span>
                        </div>
                        <FaChevronDown size={12} style={{ color: 'var(--text-secondary)', transform: isZoneDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>

                    {isZoneDropdownOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 99, cursor: 'default' }} onClick={() => setIsZoneDropdownOpen(false)} />
                            <div className="card" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
                                padding: 6, zIndex: 100, maxHeight: 300, overflowY: 'auto',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--border-active)'
                            }}>
                                {zones.map(z => (
                                    <div
                                        key={z.id}
                                        onClick={() => {
                                            if (z.id !== selectedZone) {
                                                setSelectedZone(z.id);
                                                loadRecords(z.id);
                                            }
                                            setIsZoneDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '10px 12px', borderRadius: 4, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            background: z.id === selectedZone ? 'rgba(246, 130, 31, 0.1)' : 'transparent',
                                            color: z.id === selectedZone ? 'var(--cf-orange)' : 'var(--text-primary)',
                                            marginBottom: 2, transition: 'background 0.2s'
                                        }}
                                        className="zone-option"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: z.status === 'active' ? 'var(--status-success-text)' : (z.status === 'pending' ? 'var(--status-warning-text)' : '#666'),
                                                boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                                            }} />
                                            <span style={{ fontWeight: 500, fontSize: 14 }}>{z.name}</span>
                                        </div>
                                        {z.id === selectedZone && <FaCheck size={12} />}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid-cols-3" style={{ marginBottom: 24 }}>
                <StatsCard label={t('dns_mgmt.total_records')} value={stats.total} icon={<FaNetworkWired />} color="#0051C3" />
                <StatsCard label={t('dns_mgmt.proxied')} value={stats.proxied} icon={<FaCloud />} color="#F6821F" />
                <StatsCard label={t('dns_mgmt.dns_only')} value={stats.dnsOnly} icon={<FaCloudShowersHeavy />} color="#666" />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div className="input-group" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '0 12px' }}>
                    <FaSearch style={{ color: 'var(--text-muted)' }} />
                    <input
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '10px', width: '100%', outline: 'none' }}
                        placeholder={t('dns_mgmt.search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && <FaTimes style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchQuery('')} />}
                </div>
                <button className="btn btn-primary" onClick={handleAddNew} style={{ padding: '0 24px', height: 42 }}>
                    <FaPlus /> {t('dns_mgmt.add_record')}
                </button>
            </div>

            {/* Records List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '16px 24px', width: 80 }}>{t('dns_mgmt.table.type')}</th>
                                <th style={{ padding: '16px 24px' }}>{t('dns_mgmt.table.name')}</th>
                                <th style={{ padding: '16px 24px' }}>{t('dns_mgmt.table.content')}</th>
                                <th style={{ padding: '16px 24px', width: 100 }}>{t('dns_mgmt.table.proxy_status')}</th>
                                <th style={{ padding: '16px 24px', width: 80 }}>{t('dns_mgmt.table.ttl')}</th>
                                <th style={{ padding: '16px 24px', width: 100, textAlign: 'right' }}>{t('dns_mgmt.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {t('dns_mgmt.table.loading')}
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {searchQuery ? t('dns_mgmt.table.no_match') : t('dns_mgmt.table.no_records')}
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
                                                    <FaCloud /> <span style={{ fontSize: 13, fontWeight: 500 }}>{t('dns_mgmt.proxied')}</span>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                                    <FaCloudShowersHeavy /> <span style={{ fontSize: 13 }}>{t('dns_mgmt.dns_only')}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                                            {r.ttl === 1 ? t('dns_mgmt.modal.ttl_auto') : `${r.ttl}s`}
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
                            <h3 style={{ fontSize: 18 }}>{editingRecord ? t('dns_mgmt.modal.edit_title') : t('dns_mgmt.modal.add_title')}</h3>
                            <FaTimes style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        </div>

                        <form onSubmit={handleSave} style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gap: 20 }}>
                                <div className="grid-cols-2" style={{ gap: 16 }}>
                                    <div className="input-group">
                                        <label className="input-label">{t('dns_mgmt.modal.type')}</label>
                                        <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">{t('dns_mgmt.modal.ttl')}</label>
                                        <select className="input" value={formData.ttl} onChange={e => setFormData({ ...formData, ttl: Number(e.target.value) })}>
                                            <option value={1}>{t('dns_mgmt.modal.ttl_auto')}</option>
                                            <option value={60}>1 min</option>
                                            <option value={120}>2 mins</option>
                                            <option value={300}>5 mins</option>
                                            <option value={3600}>1 hour</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('dns_mgmt.modal.name_label')}</label>
                                    <input className="input" placeholder={t('dns_mgmt.modal.name_placeholder')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('dns_mgmt.modal.content_label')}</label>
                                    <textarea
                                        className="input"
                                        placeholder={t('dns_mgmt.modal.content_placeholder')}
                                        rows={3}
                                        style={{ resize: 'vertical', minHeight: 80, fontFamily: 'monospace' }}
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('dns_mgmt.modal.proxy_status')}</label>
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
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{formData.proxied ? t('dns_mgmt.proxied') : t('dns_mgmt.dns_only')}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    {formData.proxied ? t('dns_mgmt.modal.proxied_desc') : t('dns_mgmt.modal.dns_only_desc')}
                                                </div>
                                            </div>
                                        </div>
                                        {formData.proxied && <FaCheck color="var(--cf-orange)" />}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>{t('dns_mgmt.modal.cancel')}</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? t('dns_mgmt.modal.saving') : t('dns_mgmt.modal.save')}
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
                .zone-option:hover { background: rgba(255,255,255,0.05) !important; }
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
