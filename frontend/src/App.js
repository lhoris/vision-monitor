import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Root Application Component
 */
import { Provider } from 'react-redux';
import { store } from '@/store';
import Live from '@/pages/Live';
import '@/styles/global.css';
export function App() {
    return (_jsx(Provider, { store: store, children: _jsx("div", { className: "flex h-screen w-screen bg-gray-50 dark:bg-gray-900", children: _jsx(Live, {}) }) }));
}
export default App;
