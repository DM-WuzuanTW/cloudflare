import { useState } from 'react';
import { FaShieldAlt, FaKey, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function Login({ onLogin }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onLogin(email, key);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-box">
                <div style={{ marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: 12, background: 'rgba(246, 130, 31, 0.1)', borderRadius: '50%', color: 'var(--cf-orange)', fontSize: 32 }}>
                        <FaShieldAlt />
                    </div>
                    <h2 style={{ fontSize: 24 }}>{t('login.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('login.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <span className="input-label">{t('login.email')}</span>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                style={{ paddingLeft: 36 }}
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                type="email"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <span className="input-label">{t('login.key')}</span>
                        <div style={{ position: 'relative' }}>
                            <FaKey style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                style={{ paddingLeft: 36 }}
                                placeholder="Global API Key"
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                required
                                type="password"
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" disabled={loading} style={{ height: 44, fontSize: 16 }}>
                        {loading ? t('login.btn_verify') : t('login.btn_signin')}
                    </button>
                </form>
                <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t('login.disclaimer')}
                </p>
            </div>
        </div>
    );
}
