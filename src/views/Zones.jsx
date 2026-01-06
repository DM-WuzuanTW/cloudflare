import { useEffect, useState } from 'react';
import { FaGlobe, FaCheckCircle, FaExclamationCircle, FaArrowRight, FaLayerGroup } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Zones({ onSelectZone }) {
    const { t } = useTranslation();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupedZones, setGroupedZones] = useState({});

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = () => {
        setLoading(true);
        window.electronAPI.invoke('getZones').then(res => {
            setZones(res);
            // Group by Account
            const groups = res.reduce((acc, zone) => {
                const accName = zone.account.name;
                if (!acc[accName]) acc[accName] = [];
                acc[accName].push(zone);
                return acc;
            }, {});
            setGroupedZones(groups);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    if (loading) return <div style={{ padding: 20 }}>{t('zones.loading')}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">{t('zones.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('zones.subtitle')}</p>
                </div>
            </div>

            {Object.keys(groupedZones).map(accountName => (
                <div key={accountName} style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                        <FaLayerGroup style={{ color: 'var(--cf-orange)' }} />
                        <h3 style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                            {accountName} <span style={{ fontSize: 12, opacity: 0.7 }}>({groupedZones[accountName].length})</span>
                        </h3>
                    </div>

                    <div className="grid-cols-2">
                        {groupedZones[accountName].map(zone => (
                            <div key={zone.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FaGlobe style={{ color: 'var(--text-muted)' }} />
                                            <h3 style={{ fontSize: 18 }}>{zone.name}</h3>
                                        </div>
                                        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {t('zones.plan')}: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{zone.plan.name}</span>
                                        </div>
                                    </div>
                                    <span className={`badge ${zone.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {zone.status === 'active' && <FaCheckCircle style={{ marginRight: 4, fontSize: 10 }} />}
                                        {zone.status === 'active' ? t('zones.status_active') : t('zones.status_pending')}
                                    </span>
                                </div>

                                <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16, display: 'flex', gap: 10 }}>
                                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => onSelectZone('dns', zone.id)}>
                                        {t('zones.btn_dns')}
                                    </button>
                                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => onSelectZone('cache', zone.id)}>
                                        {t('zones.btn_cache')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
