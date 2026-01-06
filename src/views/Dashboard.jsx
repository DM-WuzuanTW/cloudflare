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

export default function Dashboard({ user, onLogout }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('zones');

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
            case 'zones': return <Zones />;
            case 'workers': return <Workers />;
            case 'pages': return <Pages />;
            case 'settings': return <Settings />;
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
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>{t('common.coming_soon')}</h2>
                    <p>{t('common.dev_module', { module: t(`sidebar.${activeTab}`) })}</p>
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
