import { useState } from 'react';
import {
    FaChartPie, FaGlobe, FaNetworkWired, FaShieldAlt,
    FaBolt, FaHammer, FaFileCode, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Zones from './Zones';
import Workers from './Workers';
import Pages from './Pages';
import Settings from './Settings';
import DNS from './DNS';
import Security from './Security';
import Cache from './Cache';

export default function Dashboard({ user, onLogout }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('zones');
    const [targetZone, setTargetZone] = useState(null);

    const handleZoneSelect = (page, zoneId) => {
        setTargetZone(zoneId);
        setActiveTab(page);
    };

    const menuItems = [
        { id: 'dashboard', label: t('sidebar.dashboard'), icon: <FaChartPie /> },
        { id: 'zones', label: t('sidebar.zones'), icon: <FaGlobe /> },
        { id: 'dns', label: t('sidebar.dns'), icon: <FaNetworkWired /> },
        { id: 'security', label: t('sidebar.security'), icon: <FaShieldAlt /> },
        { id: 'cache', label: t('sidebar.cache'), icon: <FaBolt /> },
        { id: 'workers', label: t('sidebar.workers'), icon: <FaHammer /> },
        { id: 'pages', label: t('sidebar.pages'), icon: <FaFileCode /> },
        { id: 'settings', label: t('sidebar.settings'), icon: <FaCog /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'zones': return <Zones onSelectZone={handleZoneSelect} />;
            case 'dns': return <DNS initialZone={targetZone} />;
            case 'security': return <Security initialZone={targetZone} />;
            case 'cache': return <Cache initialZone={targetZone} />;
            case 'workers': return <Workers />;
            case 'pages': return <Pages />;
            case 'settings': return <Settings />;
            default: return (
                <div style={{ padding: 20 }}>
                    <h2>Welcome back, {user}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Select a module to manage your Cloudflare resources.</p>
                    <div className="grid-cols-3" style={{ marginTop: 30 }}>
                        <div className="card" onClick={() => setActiveTab('zones')} style={{ cursor: 'pointer' }}>
                            <h3>{t('sidebar.zones')}</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage domains</p>
                        </div>
                        <div className="card" onClick={() => setActiveTab('workers')} style={{ cursor: 'pointer' }}>
                            <h3>{t('sidebar.workers')}</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Serverless functions</p>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar-area">
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                        <div style={{ width: 28, height: 28, background: 'var(--cf-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>
                            <FaBolt />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{t('sidebar.welcome')}</div>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user}
                    </p>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </nav>

                <div style={{ padding: 20, borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                        onClick={onLogout}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', color: '#ff6b6b' }}
                    >
                        <FaSignOutAlt style={{ marginRight: 12 }} />
                        {t('sidebar.logout')}
                    </button>
                </div>
            </div>

            <div className="content-area">
                {renderContent()}
            </div>
        </div>
    );
}
