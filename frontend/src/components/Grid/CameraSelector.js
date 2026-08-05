import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Camera Selector Modal Component
 * 사용 가능한 CCTV 카메라 목록 표시 및 선택
 */
import { useEffect, useState } from 'react';
export const CameraSelector = ({ isOpen, cameras, usedCameraIds, onSelect, onClose, loading = false, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCameras, setFilteredCameras] = useState([]);
    // 사용 가능한 카메라 필터링 (이미 사용 중인 카메라 제외)
    useEffect(() => {
        const available = cameras.filter((cam) => !usedCameraIds.includes(cam.id));
        const filtered = available.filter((cam) => cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cam.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cam.zone.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredCameras(filtered);
    }, [cameras, usedCameraIds, searchTerm]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Select Camera" }), _jsx("button", { onClick: onClose, className: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300\n                       transition-colors", "aria-label": "Close", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("input", { type: "text", placeholder: "Search cameras...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600\n                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white\n                       placeholder-gray-500 dark:placeholder-gray-400\n                       focus:outline-none focus:ring-2 focus:ring-blue-500" }) }), _jsx("div", { className: "max-h-96 overflow-y-auto", children: loading ? (_jsx("div", { className: "p-6 text-center text-gray-500 dark:text-gray-400", children: "Loading cameras..." })) : filteredCameras.length === 0 ? (_jsx("div", { className: "p-6 text-center text-gray-500 dark:text-gray-400", children: cameras.length === 0 ? 'No cameras available' : 'No matching cameras' })) : (_jsx("ul", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: filteredCameras.map((camera) => (_jsx("li", { children: _jsxs("button", { onClick: () => {
                                    onSelect(camera);
                                    setSearchTerm('');
                                    onClose();
                                }, className: "w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700\n                               transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white", children: camera.name }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [camera.location, " \u2022 Zone: ", camera.zone] })] }), _jsx("div", { className: "ml-2 flex-shrink-0", children: _jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${camera.status === 'online'
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                                                        : camera.status === 'offline'
                                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}
                          `, children: camera.status }) })] }), camera.resolution && (_jsxs("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: [camera.resolution, " \u2022 ", camera.fps, "fps"] }))] }) }, camera.id))) })) }), _jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700", children: _jsx("button", { onClick: onClose, className: "w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300\n                       bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600\n                       rounded-md transition-colors", children: "Cancel" }) })] }) }));
};
export default CameraSelector;
