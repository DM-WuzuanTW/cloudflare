import { useEffect, useState } from 'react';
import { FaSync, FaInfoCircle, FaCheck, FaDownload } from 'react-icons/fa';

export default function Settings() {
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

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Settings</h2>
            </div>

            <div className="card" style={{ maxWidth: 600 }}>
                <h3 style={{ marginBottom: 20 }}>About Application</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>Current Version</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Running version</div>
                    </div>
                    <div className="badge" style={{ background: 'var(--bg-input)', fontSize: 14 }}>v{version}</div>
                </div>

                <div style={{ padding: '20px 0' }}>
                    <div style={{ marginBottom: 15, fontWeight: 500 }}>Software Update</div>

                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCheckUpdate}
                            disabled={checking}
                            style={{ minWidth: 140 }}
                        >
                            {checking ? <FaSync className="spin" /> : <FaSync />}
                            {checking ? ' Checking...' : 'Check for Updates'}
                        </button>

                        {updateStatus && (
                            <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {updateStatus.type === 'latest' && (
                                    <span style={{ color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaCheck /> You are on the latest version.
                                    </span>
                                )}
                                {updateStatus.type === 'available' && (
                                    <span style={{ color: 'var(--cf-orange)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaDownload /> Update v{updateStatus.version} is downloading in background...
                                    </span>
                                )}
                                {updateStatus.type === 'error' && (
                                    <span style={{ color: 'var(--status-error-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaInfoCircle /> Check failed: {updateStatus.msg}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                        Updates are automatically downloaded in the background. Restart the app to apply.
                    </p>
                </div>
            </div>
        </div>
    );
}
