import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Events Page
 * 이벤트 필터링, 테이블, 상세 패널
 */
import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Select, } from '@/components/Common';
import { useAppSelector, useAppDispatch } from '@/store';
import { setFilter, acknowledgeEvent } from '@/store/slices/eventSlice';
// Mock events data
const mockEvents = [
    {
        id: 1,
        cameraId: 1,
        type: 'motion_detected',
        severity: 'low',
        description: 'Motion detected in area A',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        acknowledged: false,
    },
    {
        id: 2,
        cameraId: 2,
        type: 'camera_offline',
        severity: 'high',
        description: 'Camera 2 went offline',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        acknowledged: false,
    },
    {
        id: 3,
        cameraId: 3,
        type: 'tampering_detected',
        severity: 'critical',
        description: 'Tampering detected on camera lens',
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        acknowledged: false,
    },
    {
        id: 4,
        cameraId: 1,
        type: 'motion_detected',
        severity: 'medium',
        description: 'Sustained motion detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: true,
    },
];
export function Events() {
    const dispatch = useAppDispatch();
    const filter = useAppSelector((state) => state.event.filter);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [events, setEvents] = useState(mockEvents);
    const cameras = useAppSelector((state) => state.camera.cameras);
    const cameraOptions = cameras.map((c) => ({
        value: c.id.toString(),
        label: c.name,
    }));
    const severityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
    ];
    const typeOptions = [
        { value: 'motion_detected', label: 'Motion Detected' },
        { value: 'camera_offline', label: 'Camera Offline' },
        { value: 'tampering_detected', label: 'Tampering Detected' },
        { value: 'recording_error', label: 'Recording Error' },
    ];
    // Filter events
    const filteredEvents = events.filter((event) => {
        if (filter.severity && event.severity !== filter.severity)
            return false;
        if (filter.cameraId && event.cameraId !== filter.cameraId)
            return false;
        if (filter.type && event.type !== filter.type)
            return false;
        return true;
    });
    const handleAcknowledge = (eventId) => {
        setEvents(events.map((e) => e.id === eventId ? { ...e, acknowledged: true } : e));
        dispatch(acknowledgeEvent(eventId));
    };
    const handleBulkAcknowledge = () => {
        const unacknowledgedIds = filteredEvents
            .filter((e) => !e.acknowledged)
            .map((e) => e.id);
        setEvents(events.map((e) => unacknowledgedIds.includes(e.id) ? { ...e, acknowledged: true } : e));
    };
    const getCameraName = (cameraId) => {
        return cameras.find((c) => c.id === cameraId)?.name || `Camera ${cameraId}`;
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'medium':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'high':
                return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
            case 'critical':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };
    const unacknowledgedCount = events.filter((e) => !e.acknowledged).length;
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-2", children: "Events" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Monitor and manage system events and alerts" })] }), unacknowledgedCount > 0 && (_jsxs("div", { className: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg", children: [_jsx("span", { className: "font-semibold", children: unacknowledgedCount }), ' ', "unacknowledged events"] }))] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }) }), _jsx(CardBody, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Select, { label: "Severity", options: [
                                        { value: '', label: 'All Severities' },
                                        ...severityOptions,
                                    ], value: filter.severity || '', onChange: (e) => dispatch(setFilter({
                                        ...filter,
                                        severity: e.target.value,
                                    })) }), _jsx(Select, { label: "Camera", options: [{ value: '', label: 'All Cameras' }, ...cameraOptions], value: filter.cameraId?.toString() || '', onChange: (e) => dispatch(setFilter({
                                        ...filter,
                                        cameraId: e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                    })) }), _jsx(Select, { label: "Type", options: [{ value: '', label: 'All Types' }, ...typeOptions], value: filter.type || '', onChange: (e) => dispatch(setFilter({
                                        ...filter,
                                        type: e.target.value,
                                    })) }), _jsx("div", { className: "flex items-end gap-2", children: _jsx(Button, { variant: "secondary", className: "w-full", onClick: () => dispatch(setFilter({})), children: "Clear Filters" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "font-semibold text-gray-900 dark:text-white", children: ["Events (", filteredEvents.length, ")"] }), unacknowledgedCount > 0 && (_jsx(Button, { size: "sm", variant: "secondary", onClick: handleBulkAcknowledge, children: "Acknowledge All" }))] }), _jsx(CardBody, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [_jsx("th", { className: "text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300", children: "Time" }), _jsx("th", { className: "text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300", children: "Camera" }), _jsx("th", { className: "text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300", children: "Type" }), _jsx("th", { className: "text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300", children: "Severity" }), _jsx("th", { className: "text-center px-4 py-2 font-semibold text-gray-700 dark:text-gray-300", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: filteredEvents.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center px-4 py-8 text-gray-600 dark:text-gray-400", children: "No events found" }) })) : (filteredEvents.map((event) => (_jsxs("tr", { className: `
                            hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                            ${!event.acknowledged
                                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                                            : ''}
                          `, onClick: () => {
                                                            setSelectedEvent(event);
                                                            setIsDetailsOpen(true);
                                                        }, children: [_jsx("td", { className: "px-4 py-3", children: event.timestamp.toLocaleTimeString() }), _jsx("td", { className: "px-4 py-3", children: getCameraName(event.cameraId) }), _jsx("td", { className: "px-4 py-3 capitalize", children: event.type.replace(/_/g, ' ') }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `
                                px-2 py-1 rounded text-xs font-medium
                                ${getSeverityColor(event.severity)}
                              `, children: event.severity.charAt(0).toUpperCase() +
                                                                        event.severity.slice(1) }) }), _jsx("td", { className: "px-4 py-3 text-center", children: !event.acknowledged && (_jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleAcknowledge(event.id);
                                                                    }, children: "ACK" })) })] }, event.id)))) })] }) }) })] }) }), _jsx("div", { children: selectedEvent ? (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Event Details" }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "ID" }), _jsxs("p", { className: "font-mono text-sm text-gray-900 dark:text-white", children: ["#", selectedEvent.id] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "Time" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: selectedEvent.timestamp.toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "Camera" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: getCameraName(selectedEvent.cameraId) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "Type" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-white capitalize", children: selectedEvent.type.replace(/_/g, ' ') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "Severity" }), _jsx("span", { className: `
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${getSeverityColor(selectedEvent.severity)}
                    `, children: selectedEvent.severity.charAt(0).toUpperCase() +
                                                        selectedEvent.severity.slice(1) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "Status" }), _jsx("span", { className: `
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${selectedEvent.acknowledged
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}
                    `, children: selectedEvent.acknowledged ? 'Acknowledged' : 'Pending' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide", children: "Description" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: selectedEvent.description })] }), !selectedEvent.acknowledged && (_jsx("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: _jsx(Button, { className: "w-full", onClick: () => handleAcknowledge(selectedEvent.id), children: "Acknowledge Event" }) }))] })] })) : (_jsx(Card, { children: _jsx(CardBody, { className: "text-center py-8", children: _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Select an event to view details" }) }) })) })] })] }));
}
export default Events;
