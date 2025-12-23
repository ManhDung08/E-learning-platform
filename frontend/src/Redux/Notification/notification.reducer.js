import {
    GET_NOTIFICATIONS_REQUEST, GET_NOTIFICATIONS_SUCCESS, GET_NOTIFICATIONS_FAILURE,
    GET_UNREAD_COUNT_REQUEST, GET_UNREAD_COUNT_SUCCESS, GET_UNREAD_COUNT_FAILURE,
    MARK_NOTIFICATION_READ_REQUEST, MARK_NOTIFICATION_READ_SUCCESS, MARK_NOTIFICATION_READ_FAILURE,
    MARK_ALL_READ_REQUEST, MARK_ALL_READ_SUCCESS, MARK_ALL_READ_FAILURE,
    DELETE_NOTIFICATION_REQUEST, DELETE_NOTIFICATION_SUCCESS, DELETE_NOTIFICATION_FAILURE,
    DELETE_ALL_NOTIFICATIONS_REQUEST, DELETE_ALL_NOTIFICATIONS_SUCCESS, DELETE_ALL_NOTIFICATIONS_FAILURE,
    NEW_NOTIFICATION_RECEIVED, UPDATE_UNREAD_COUNT_REALTIME
} from "./notification.actionType";

const initialState = {
    loading: false,
    notifications: [],
    unreadCount: 0,
    pagination: {},
    error: null,
};

export const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_NOTIFICATIONS_REQUEST:
        case GET_UNREAD_COUNT_REQUEST:
        case MARK_NOTIFICATION_READ_REQUEST:
        case MARK_ALL_READ_REQUEST:
        case DELETE_NOTIFICATION_REQUEST:
        case DELETE_ALL_NOTIFICATIONS_REQUEST:
            return { ...state, loading: true, error: null };

        case GET_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: action.payload.items,
                pagination: action.payload.meta
            };

        case GET_UNREAD_COUNT_SUCCESS:
            return {
                ...state,
                loading: false,
                unreadCount: action.payload.unreadCount
            };

        case MARK_NOTIFICATION_READ_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: state.notifications.map(notif => 
                    notif.id === action.payload.id ? { ...notif, isRead: true } : notif
                ),
            };

        case MARK_ALL_READ_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            };

        case DELETE_NOTIFICATION_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };

        case DELETE_ALL_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: [],
                unreadCount: 0
            };

        case NEW_NOTIFICATION_RECEIVED:
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + 1
            };
        
        case UPDATE_UNREAD_COUNT_REALTIME:
            return {
                ...state,
                unreadCount: action.payload
            };

        case GET_NOTIFICATIONS_FAILURE:
        case GET_UNREAD_COUNT_FAILURE:
        case MARK_NOTIFICATION_READ_FAILURE:
        case MARK_ALL_READ_FAILURE:
        case DELETE_NOTIFICATION_FAILURE:
        case DELETE_ALL_NOTIFICATIONS_FAILURE:
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};