import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Draggable Cell Component
 * 개별 그리드 셀 - 카메라 또는 빈 셀
 */
import { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
export const DraggableCell = ({ cellId, index, camera, onAddCamera, onRemoveCamera, isDragging = false, }) => {
    const [showActions, setShowActions] = useState(false);
    return (_jsx(Droppable, { droppableId: cellId, type: "CAMERA", children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: `relative bg-gray-50 dark:bg-gray-700 rounded-lg border-2 transition-all duration-200
            ${snapshot.isDraggingOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-600'}
            ${isDragging ? 'opacity-50' : 'opacity-100'}
            min-h-32 flex flex-col items-center justify-center
          `, onMouseEnter: () => setShowActions(true), onMouseLeave: () => setShowActions(false), children: [camera ? (_jsx(Draggable, { draggableId: `camera-${camera.id}`, index: index, children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, className: `w-full h-full flex flex-col items-center justify-center p-4
                    ${snapshot.isDragging ? 'opacity-80 shadow-lg' : 'opacity-100'}
                    transition-opacity cursor-move
                  `, children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-full\n                                    bg-blue-100 dark:bg-blue-900 mb-2", children: _jsx("svg", { className: "w-6 h-6 text-blue-600 dark:text-blue-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }) }) }), _jsx("h3", { className: "font-semibold text-gray-900 dark:text-white text-sm", children: camera.name }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: camera.location }), _jsx("span", { className: `inline-block mt-2 px-2 py-1 rounded text-xs font-medium
                      ${camera.status === 'online'
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                                            : camera.status === 'offline'
                                                ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}
                    `, children: camera.status })] }), showActions && (_jsx("button", { onClick: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRemoveCamera();
                                }, className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white\n                                 rounded-full p-1 transition-colors shadow-md", title: "Remove camera", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })) })) : (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer group", children: [_jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-full\n                             bg-gray-200 dark:bg-gray-600 group-hover:bg-blue-200 dark:group-hover:bg-blue-900\n                             transition-colors", children: _jsx("button", { onClick: onAddCamera, className: "w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-400\n                             group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors", title: "Add camera", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) }) }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Click to add camera" })] })), provided.placeholder] })) }));
};
export default DraggableCell;
