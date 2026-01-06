import { useEffect, useState } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';

function App() {
    const [auth, setAuth] = useState({ loading: true, user: null });

    useEffect(() => {
        // Check initial auth on mount
        if (window.electronAPI) {
            window.electronAPI.checkAuth().then(res => {
                setAuth({ loading: false, user: res.authenticated ? res.email : null });
            });
        } else {
            setAuth({ loading: false, user: null }); // Fallback for browser dev
        }
    }, []);

    const handleLogin = async (email, key) => {
        if (window.electronAPI) {
            await window.electronAPI.login(email, key);
            setAuth({ loading: false, user: email });
        }
    };

    const handleLogout = async () => {
        if (window.electronAPI) {
            await window.electronAPI.logout();
        }
        setAuth({ loading: false, user: null });
    };

    if (auth.loading) return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Initializing...</div>;

    return auth.user ? <Dashboard user={auth.user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}

export default App;
