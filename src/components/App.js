import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';
export function App() {
    const auth = useAuth();
    if (!auth.isLoggedIn) {
        return _jsx(LoginPage, { onLogin: auth.login });
    }
    return _jsx(DashboardPage, { userName: auth.userName, onLogout: auth.logout });
}
