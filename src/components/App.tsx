import { useAuth } from '../hooks/useAuth';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';

export function App() {
  const auth = useAuth();

  if (!auth.isLoggedIn) {
    return <LoginPage onLogin={auth.login} />;
  }

  return <DashboardPage userName={auth.userName} onLogout={auth.logout} />;
}
