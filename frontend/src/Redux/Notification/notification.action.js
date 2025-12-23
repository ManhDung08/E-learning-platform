import api from "../api";

import {
    GET_NOTIFICATIONS_REQUEST, GET_NOTIFICATIONS_SUCCESS, GET_NOTIFICATIONS_FAILURE,
    GET_UNREAD_COUNT_REQUEST, GET_UNREAD_COUNT_SUCCESS, GET_UNREAD_COUNT_FAILURE,
    MARK_NOTIFICATION_READ_REQUEST, MARK_NOTIFICATION_READ_SUCCESS, MARK_NOTIFICATION_READ_FAILURE,
    MARK_ALL_READ_REQUEST, MARK_ALL_READ_SUCCESS, MARK_ALL_READ_FAILURE,
    DELETE_NOTIFICATION_REQUEST, DELETE_NOTIFICATION_SUCCESS, DELETE_NOTIFICATION_FAILURE,
    DELETE_ALL_NOTIFICATIONS_REQUEST, DELETE_ALL_NOTIFICATIONS_SUCCESS, DELETE_ALL_NOTIFICATIONS_FAILURE
} from "./notification.actionType";

export const getNotificationsAction = (page = 1, limit = 20) => async (dispatch) => {
    dispatch({ type: GET_NOTIFICATIONS_REQUEST });
    try {
        const { data } = await api.get(`/notification?page=${page}&limit=${limit}`);
        dispatch({ type: GET_NOTIFICATIONS_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ type: GET_NOTIFICATIONS_FAILURE, payload: error.response?.data?.message || error.message });
    }
};

export const getUnreadCountAction = () => async (dispatch) => {
    dispatch({ type: GET_UNREAD_COUNT_REQUEST });
    try {
        const { data } = await api.get('/notification/unread-count');
        dispatch({ type: GET_UNREAD_COUNT_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ type: GET_UNREAD_COUNT_FAILURE, payload: error.response?.data?.message || error.message });
    }
};

export const markNotificationReadAction = (id) => async (dispatch) => {
    dispatch({ type: MARK_NOTIFICATION_READ_REQUEST });
    try {
        const { data } = await api.patch(`/notification/${id}/read`);
        dispatch({ type: MARK_NOTIFICATION_READ_SUCCESS, payload: { id, data: data.data } });
    } catch (error) {
        dispatch({ type: MARK_NOTIFICATION_READ_FAILURE, payload: error.response?.data?.message || error.message });
    }
};

export const markAllReadAction = () => async (dispatch) => {
    dispatch({ type: MARK_ALL_READ_REQUEST });
    try {
        const { data } = await api.patch('/notification/read-all');
        dispatch({ type: MARK_ALL_READ_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ type: MARK_ALL_READ_FAILURE, payload: error.response?.data?.message || error.message });
    }
};

export const deleteNotificationAction = (id) => async (dispatch) => {
    dispatch({ type: DELETE_NOTIFICATION_REQUEST });
    try {
        await api.delete(`/notification/${id}`);
        dispatch({ type: DELETE_NOTIFICATION_SUCCESS, payload: id });
    } catch (error) {
        dispatch({ type: DELETE_NOTIFICATION_FAILURE, payload: error.response?.data?.message || error.message });
    }
};

export const deleteAllNotificationsAction = () => async (dispatch) => {
    dispatch({ type: DELETE_ALL_NOTIFICATIONS_REQUEST });
    try {
        await api.delete('/notification/delete-all');
        dispatch({ type: DELETE_ALL_NOTIFICATIONS_SUCCESS });
    } catch (error) {
        dispatch({ type: DELETE_ALL_NOTIFICATIONS_FAILURE, payload: error.response?.data?.message || error.message });
    }
};