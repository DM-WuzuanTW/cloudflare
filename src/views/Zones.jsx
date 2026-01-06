import { useEffect, useState } from 'react';
import { FaSync, FaGlobe, FaCheckCircle, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Zones() {
    const { t } = useTranslation();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = () => {
        setLoading(true);
        window.electronAPI.invoke('getZones').then(res => {
            setZones(res);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
            <FaSync className="spin" /> {t('zones.loading')}
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">{t('zones.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '5px 0 0 0' }}>
                        {t('zones.subtitle')}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={loadZones}>
                    <FaSync /> {t('zones.refresh')}
                </button>
            </div>

            <div className="grid-cols-2">
                {zones.map(zone => (
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
                                {zone.status !== 'active' && <FaExclamationCircle style={{ marginRight: 4, fontSize: 10 }} />}
                                {zone.status === 'active' ? t('zones.status_active') : t('zones.status_pending')}
                            </span>
                        </div>

                        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16, display: 'flex', gap: 10 }}>
                            <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }}>{t('zones.btn_dns')}</button>
                            <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }}>{t('zones.btn_cache')}</button>
                            <button className="btn btn-primary" style={{ width: 40 }}>
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
