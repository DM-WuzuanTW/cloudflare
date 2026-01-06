import { useState } from 'react';

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
                <h2 style={{ marginBottom: '20px' }}>Cloudflare Desktop</h2>
                <p className="text-sec" style={{ marginBottom: '30px' }}>Secure API Management</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        className="input"
                        placeholder="Cloudflare Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        type="email"
                    />
                    <input
                        className="input"
                        placeholder="Global API Key"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        required
                        type="password"
                    />
                    <button className="btn btn-primary" disabled={loading}>
                        {loading ? 'Verifying...' : 'Connect to Cloudflare'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                    Keys are encrypted and stored locally on your device.
                </p>
            </div>
        </div>
    );
}
