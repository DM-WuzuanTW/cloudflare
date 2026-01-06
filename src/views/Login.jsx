import { useState } from 'react';
import { FaShieldAlt, FaKey, FaEnvelope } from 'react-icons/fa';

export default function Login({ onLogin }) {
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
                    <h2 style={{ fontSize: 24 }}>Cloudflare Mobile</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <span className="input-label">Email Address</span>
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
                        <span className="input-label">Global API Key</span>
                        <div style={{ position: 'relative' }}>
                            <FaKey style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                style={{ paddingLeft: 36 }}
                                placeholder="Your Global API Key"
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                required
                                type="password"
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" disabled={loading} style={{ height: 44, fontSize: 16 }}>
                        {loading ? 'Verifying Credentials...' : 'Sign In securely'}
                    </button>
                </form>
                <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Your credentials are encrypted using <strong>AES-256</strong> and stored ONLY on your local device. We never see your keys.
                </p>
            </div>
        </div>
    );
}
