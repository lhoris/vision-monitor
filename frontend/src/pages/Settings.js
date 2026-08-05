import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Settings Page
 * 카메라 설정 및 관리 UI
 */
import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, Modal, } from '@/components/Common';
import { useAppSelector, useAppDispatch } from '@/store';
import { addCamera, updateCamera, deleteCamera, } from '@/store/slices/cameraSlice';
export function Settings() {
    const dispatch = useAppDispatch();
    const cameras = useAppSelector((state) => state.camera.cameras);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCamera, setEditingCamera] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        zone: '',
        streamUrl: '',
        status: 'offline',
    });
    const handleAddClick = () => {
        setEditingCamera(null);
        setFormData({
            name: '',
            location: '',
            zone: '',
            streamUrl: '',
            status: 'offline',
        });
        setIsModalOpen(true);
    };
    const handleEditClick = (camera) => {
        setEditingCamera(camera);
        setFormData({
            name: camera.name,
            location: camera.location,
            zone: camera.zone,
            streamUrl: camera.streamUrl,
            status: camera.status,
        });
        setIsModalOpen(true);
    };
    const handleSave = () => {
        if (editingCamera) {
            dispatch(updateCamera({
                ...editingCamera,
                ...formData,
            }));
        }
        else {
            dispatch(addCamera({
                id: Math.max(...cameras.map((c) => c.id), 0) + 1,
                ...formData,
            }));
        }
        setIsModalOpen(false);
    };
    const handleDelete = (cameraId) => {
        if (confirm('Are you sure you want to delete this camera?')) {
            dispatch(deleteCamera(cameraId));
        }
    };
    const zoneOptions = [
        { value: 'Zone 1', label: 'Zone 1' },
        { value: 'Zone 2', label: 'Zone 2' },
        { value: 'Zone 3', label: 'Zone 3' },
        { value: 'Zone 4', label: 'Zone 4' },
    ];
    const statusOptions = [
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
        { value: 'error', label: 'Error' },
    ];
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-2", children: "Settings" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Manage cameras and system preferences" })] }), _jsx(Button, { onClick: handleAddClick, children: "Add Camera" })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Cameras" }), cameras.length === 0 ? (_jsx(Card, { children: _jsxs(CardBody, { className: "text-center py-12", children: [_jsx("svg", { className: "w-12 h-12 mx-auto mb-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }) }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: "No cameras configured yet" }), _jsx(Button, { onClick: handleAddClick, children: "Add Your First Camera" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 gap-4", children: cameras.map((camera) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: camera.name }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: [camera.location, " \u2022 ", camera.zone] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono", children: camera.streamUrl }), _jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [_jsx("span", { className: `
                            px-2 py-1 rounded-full font-medium
                            ${camera.status === 'online'
                                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                                : camera.status === 'offline'
                                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}
                          `, children: camera.status.charAt(0).toUpperCase() +
                                                                camera.status.slice(1) }), camera.resolution && (_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: camera.resolution })), camera.fps && (_jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [camera.fps, " FPS"] }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: () => handleEditClick(camera), children: "Edit" }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => handleDelete(camera.id), children: "Delete" })] })] }) }) }, camera.id))) }))] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "System Preferences" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Recording Settings" }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), _jsx("span", { className: "text-sm text-gray-900 dark:text-white", children: "Enable automatic recording" })] }) }), _jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), _jsx("span", { className: "text-sm text-gray-900 dark:text-white", children: "Archive old recordings" })] }) }), _jsx(Select, { label: "Retention Period", options: [
                                                    { value: '7', label: '7 days' },
                                                    { value: '30', label: '30 days' },
                                                    { value: '90', label: '90 days' },
                                                    { value: '365', label: '1 year' },
                                                ] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Notification Settings" }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), _jsx("span", { className: "text-sm text-gray-900 dark:text-white", children: "Email notifications" })] }) }), _jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", className: "rounded" }), _jsx("span", { className: "text-sm text-gray-900 dark:text-white", children: "SMS alerts" })] }) }), _jsx(Input, { type: "email", label: "Notification Email", placeholder: "admin@example.com" })] })] })] })] }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: editingCamera ? 'Edit Camera' : 'Add Camera', children: _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Camera Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "e.g., Camera 1" }), _jsx(Input, { label: "Location", value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), placeholder: "e.g., Area A" }), _jsx(Select, { label: "Zone", options: zoneOptions, value: formData.zone, onChange: (e) => setFormData({ ...formData, zone: e.target.value }) }), _jsx(Input, { label: "Stream URL", value: formData.streamUrl, onChange: (e) => setFormData({ ...formData, streamUrl: e.target.value }), placeholder: "rtsp://example.com/stream" }), _jsx(Select, { label: "Status", options: statusOptions, value: formData.status, onChange: (e) => setFormData({
                                ...formData,
                                status: e.target.value,
                            }) }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsxs(Button, { className: "flex-1", onClick: handleSave, children: [editingCamera ? 'Update' : 'Add', " Camera"] }), _jsx(Button, { variant: "secondary", className: "flex-1", onClick: () => setIsModalOpen(false), children: "Cancel" })] })] }) })] }));
}
export default Settings;
