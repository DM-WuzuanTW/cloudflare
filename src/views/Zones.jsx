import { useEffect, useState } from 'react';

export default function Zones() {
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

    if (loading) return <div>Loading Zones...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Active Zones</h2>
                <button className="btn btn-primary" onClick={loadZones}>Refresh</button>
            </div>
            <div className="grid-cols-2">
                {zones.map(zone => (
                    <div key={zone.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ marginBottom: 5, fontSize: '1.2em' }}>{zone.name}</h3>
                            <span className={`status-badge ${zone.status === 'active' ? 'status-active' : 'status-pending'}`}>{zone.status}</span>
                        </div>
                        <p className="text-sec" style={{ fontSize: '14px', margin: '5px 0 15px 0' }}>
                            {zone.plan.name} Plan
                        </p>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 10 }}>
                            <button className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>DNS</button>
                            <button className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Cache</button>
                            <button className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Settings</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
