/**
 * Redux Slice for UI State
 */
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    sidebarOpen: true,
    themeMode: 'dark',
    notifications: [],
    modal: {
        isOpen: false,
        type: null,
    },
    selectedTab: '',
};
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        setThemeMode: (state, action) => {
            state.themeMode = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        openModal: (state, action) => {
            state.modal = {
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data,
            };
        },
        closeModal: (state) => {
            state.modal = {
                isOpen: false,
                type: null,
            };
        },
        toggleTheme: (state) => {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        setSelectedTab: (state, action) => {
            state.selectedTab = action.payload;
        },
    },
});
export const { toggleSidebar, setSidebarOpen, setThemeMode, addNotification, removeNotification, openModal, closeModal, toggleTheme, clearNotifications, setSelectedTab, } = uiSlice.actions;
export default uiSlice.reducer;
