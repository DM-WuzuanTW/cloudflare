import { useEffect, useState } from 'react';
import { FaSync, FaInfoCircle, FaCheck, FaDownload, FaLanguage } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const [version, setVersion] = useState('');
    const [checking, setChecking] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(null); // null, 'available', 'latest', 'error'

    useEffect(() => {
        window.electronAPI.getVersion().then(setVersion);
    }, []);

    const handleCheckUpdate = async () => {
        setChecking(true);
        setUpdateStatus(null);
        try {
            const res = await window.electronAPI.checkUpdate();
            if (res.success) {
                if (res.updateAvailable) {
                    setUpdateStatus({ type: 'available', version: res.version });
                } else {
                    setUpdateStatus({ type: 'latest' });
                }
            } else {
                setUpdateStatus({ type: 'error', msg: res.error });
            }
        } catch (e) {
            setUpdateStatus({ type: 'error', msg: e.message });
        } finally {
            setChecking(false);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">{t('settings.title')}</h2>
            </div>

            <div className="card" style={{ maxWidth: 600 }}>
                <h3 style={{ marginBottom: 20 }}>{t('settings.lang_title')}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 15 }}>{t('settings.lang_subtitle')}</p>

                <div style={{ display: 'flex', gap: 10, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
                    <button
                        className={`btn ${i18n.language.startsWith('en') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => changeLanguage('en')}
                        style={{ minWidth: 100 }}
                    >
                        English
                    </button>
                    <button
                        className={`btn ${i18n.language.startsWith('zh') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => changeLanguage('zh')}
                        style={{ minWidth: 100 }}
                    >
                        中文 (繁體)
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => changeLanguage('en-US')} // Reset to auto or similar if needed, but fixed options are better for now
                        style={{ display: 'none' }}
                    >
                        Auto
                    </button>
                </div>

                <h3 style={{ marginBottom: 20, marginTop: 30 }}>{t('settings.about')}</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>{t('settings.current_ver')}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('settings.running_ver')}</div>
                    </div>
                    <div className="badge" style={{ background: 'var(--bg-input)', fontSize: 14 }}>v{version}</div>
                </div>

                <div style={{ padding: '20px 0' }}>
                    <div style={{ marginBottom: 15, fontWeight: 500 }}>{t('settings.update_title')}</div>

                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCheckUpdate}
                            disabled={checking}
                            style={{ minWidth: 140 }}
                        >
                            {checking ? <FaSync className="spin" /> : <FaSync />}
                            {checking ? ` ${t('settings.btn_checking')}` : ` ${t('settings.btn_check')}`}
                        </button>

                        {updateStatus && (
                            <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {updateStatus.type === 'latest' && (
                                    <span style={{ color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaCheck /> {t('settings.status_latest')}
                                    </span>
                                )}
                                {updateStatus.type === 'available' && (
                                    <span style={{ color: 'var(--cf-orange)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaDownload /> {t('settings.status_downloading', { version: updateStatus.version })}
                                    </span>
                                )}
                                {updateStatus.type === 'error' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ color: 'var(--status-error-text)', display: 'flex', alignItems: 'flex-start', gap: 6, maxWidth: '100%' }}>
                                            <FaInfoCircle style={{ marginTop: 3, flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, wordBreak: 'break-word', lineHeight: 1.4, maxWidth: 300 }}>
                                                {t('settings.status_error')} {updateStatus.msg.length > 100 ? updateStatus.msg.substring(0, 100) + '...' : updateStatus.msg}
                                            </span>
                                        </div>
                                        <a
                                            href="https://github.com/DM-WuzuanTW/cloudflare/releases"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-primary"
                                            style={{ fontSize: 13, height: 32, padding: '0 12px', width: 'fit-content' }}
                                        >
                                            <FaDownload style={{ marginRight: 6 }} /> Download Manually
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                        {t('settings.note')}
                    </p>
                </div>
            </div>
        </div>
    );
}
