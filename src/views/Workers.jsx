import { useEffect, useState } from 'react';
import { FaHammer, FaPlay, FaHistory, FaCodeBranch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Workers() {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.electronAPI.invoke('getAccounts').then(accs => {
            setAccounts(accs);
            if (accs.length > 0) {
                setSelectedAccount(accs[0].id);
                fetchScripts(accs[0].id);
            } else {
                setLoading(false);
            }
        }).catch(e => setLoading(false));
    }, []);

    const fetchScripts = (accId) => {
        setLoading(true);
        window.electronAPI.invoke('getWorkersScripts', accId)
            .then(res => {
                setScripts(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    if (loading && accounts.length === 0) return <div>{t('workers.loading')}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">{t('workers.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '5px 0 0 0' }}>{t('workers.subtitle')}</p>
                </div>

                {accounts.length > 0 && (
                    <div className="input-group">
                        <select
                            className="input"
                            style={{ minWidth: 200 }}
                            onChange={e => { setSelectedAccount(e.target.value); fetchScripts(e.target.value); }}
                            value={selectedAccount || ''}
                        >
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}{t('workers.account')}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {scripts.length === 0 ? <div className="text-secondary">{t('workers.no_workers')}</div> : (
                <div className="grid-cols-3">
                    {scripts.map(script => (
                        <div key={script.id} className="card">
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, background: 'rgba(246, 130, 31, 0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cf-orange)' }}>
                                    <FaHammer />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16 }}>{script.id}</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                                        {new Date(script.modified_on).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: 15, display: 'flex', gap: 8 }}>
                                <button className="btn btn-secondary" style={{ fontSize: 12, flex: 1 }}>
                                    <FaHistory style={{ marginRight: 4 }} /> {t('workers.btn_logs')}
                                </button>
                                <button className="btn btn-primary" style={{ fontSize: 12, flex: 1, backgroundColor: '#2da44e', borderColor: '#2da44e' }}>
                                    <FaPlay style={{ marginRight: 4, fontSize: 10 }} /> {t('workers.btn_deploy')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
