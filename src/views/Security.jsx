import { useEffect, useState } from 'react';
import { FaShieldAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function Security() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [securityLevel, setSecurityLevel] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.electronAPI.invoke('getZones').then(res => {
            setZones(res);
            if (res.length > 0) {
                setSelectedZone(res[0].id);
                loadSecurity(res[0].id);
            }
        });
    }, []);

    const loadSecurity = async (zid) => {
        setLoading(true);
        // Note: You need to implement getSecurityLevel in cloudflare-api.js or just use updateSecurityLevel logic
        // We will assume backend handles this via a new 'getZoneSettings' or similar. 
        // For now, let's just use the update structure to 'patch' but we need to GET first.
        // Assuming we added a 'getZoneDetail' that includes settings? Not exactly.
        // Let's mocking the fetch for now or user needs to implementing GET /zones/:id/settings/security_level
        setLoading(false);
    };

    const handleLevelChange = async (level) => {
        setLoading(true);
        try {
            await window.electronAPI.invoke('updateSecurityLevel', selectedZone, level);
            setSecurityLevel(level);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Security Settings</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>WAF and Security Level Configuration.</p>
                </div>
                <select className="input" style={{ width: 250 }} value={selectedZone} onChange={e => { setSelectedZone(e.target.value); loadSecurity(e.target.value); }}>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
            </div>

            <div className="card">
                <h3>Security Level</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                    Control the captcha challenge aggression for visitors.
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                    {['off', 'essentially_off', 'low', 'medium', 'high', 'under_attack'].map(lvl => (
                        <button
                            key={lvl}
                            className={`btn ${securityLevel === lvl ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleLevelChange(lvl)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {lvl.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <h3>WAF Rules</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Firewall rules management coming in next update.</p>
            </div>
        </div>
    );
}
