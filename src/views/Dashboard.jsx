import { useState } from 'react';
import {
    FaChartPie, FaGlobe, FaNetworkWired, FaShieldAlt,
    FaBolt, FaHammer, FaFileCode, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import Zones from './Zones';
import Workers from './Workers';
import Pages from './Pages';

export default function Dashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('zones');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaChartPie /> },
        { id: 'zones', label: 'Websites (Zones)', icon: <FaGlobe /> },
        { id: 'dns', label: 'DNS', icon: <FaNetworkWired /> },
        { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
        { id: 'cache', label: 'Caching', icon: <FaBolt /> },
        { id: 'workers', label: 'Workers & KV', icon: <FaHammer /> },
        { id: 'pages', label: 'Pages', icon: <FaFileCode /> },
        { id: 'settings', label: 'Settings', icon: <FaCog /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'zones': return <Zones />;
            case 'workers': return <Workers />;
            case 'pages': return <Pages />;
            default: return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                    color: 'var(--text-secondary)'
                }}>
                    <FaCog style={{ fontSize: 48, marginBottom: 20, opacity: 0.2 }} />
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>Coming Soon</h2>
                    <p>The {activeTab} module is under development.</p>
                </div>
            );
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar-area">
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                        {/* Simple Logo Placeholder */}
                        <div style={{ width: 28, height: 28, background: 'var(--cf-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>
                            <FaBolt />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Cloudflare</div>
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
                        Log Out
                    </button>
                </div>
            </div>

            <div className="content-area">
                {renderContent()}
            </div>
        </div>
    );
}
