import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Radio } from 'lucide-react';
import styles from '../styles/LoginPage.module.css';
export function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            if (onLogin(username, password)) {
                setUsername('');
                setPassword('');
            }
            else {
                setError('Invalid username or password');
            }
            setIsLoading(false);
        }, 300);
    };
    return (_jsx("div", { className: styles.container, children: _jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.header, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'center', gap: '8px' }, children: _jsx(Radio, { size: 28, color: "var(--accent)" }) }), _jsx("h1", { className: styles.title, children: "Vision Monitor" }), _jsx("p", { className: styles.subtitle, children: "Manufacturing AI Monitoring Dashboard" })] }), _jsxs("form", { className: styles.form, onSubmit: handleSubmit, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "username", className: styles.label, children: "Username" }), _jsx("input", { id: "username", type: "text", className: styles.input, placeholder: "tester", value: username, onChange: (e) => setUsername(e.target.value), disabled: isLoading })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "password", className: styles.label, children: "Password" }), _jsx("input", { id: "password", type: "password", className: styles.input, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), disabled: isLoading })] }), error && _jsx("div", { className: styles.error, children: error }), _jsx("button", { type: "submit", className: styles.button, disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: styles.footer, children: "Demo account: tester / tester123" })] }) }));
}
