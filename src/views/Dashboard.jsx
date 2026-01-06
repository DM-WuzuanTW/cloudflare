import { useState } from 'react';
import Zones from './Zones';
import Workers from './Workers';
import Pages from './Pages';

export default function Dashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('zones');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'zones', label: 'Zones', icon: '🌐' },
        { id: 'dns', label: 'DNS', icon: '📡' },
        { id: 'security', label: 'Security', icon: '🛡️' },
        { id: 'cache', label: 'Cache', icon: '⚡' },
        { id: 'workers', label: 'Workers', icon: '👷' },
        { id: 'pages', label: 'Pages', icon: '📄' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'zones': return <Zones />;
            case 'workers': return <Workers />;
            case 'pages': return <Pages />;
            default: return (
                <div style={{ textAlign: 'center', marginTop: 100 }}>
                    <h2 style={{ color: 'var(--text-secondary)' }}>Select a module to get started</h2>
                    <p className="text-sec">Module "{activeTab}" is coming soon.</p>
                </div>
            );
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>Cloudflare</h3>
                    <p className="text-sec" style={{ fontSize: 12, margin: '5px 0 0 0' }}>{user}</p>
                </div>

                <nav style={{ flex: 1 }}>
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 6,
                                marginBottom: 4,
                                cursor: 'pointer',
                                background: activeTab === item.id ? 'var(--accent)' : 'transparent',
                                color: activeTab === item.id ? '#fff' : 'var(--text-secondary)',
                                fontWeight: activeTab === item.id ? 600 : 400,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </nav>

                <button
                    onClick={onLogout}
                    className="btn"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#ff6b6b' }}
                >
                    Sign Out
                </button>
            </div>

            <div className="main-content">
                {renderContent()}
            </div>
        </div>
    );
}
