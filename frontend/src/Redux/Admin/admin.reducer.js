import {
    GET_ALL_USERS_REQUEST, GET_ALL_USERS_SUCCESS, GET_ALL_USERS_FAILURE,
    CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE,
    GET_USER_BY_ID_REQUEST, GET_USER_BY_ID_SUCCESS, GET_USER_BY_ID_FAILURE,
    UPDATE_USER_REQUEST, UPDATE_USER_SUCCESS, UPDATE_USER_FAILURE,
    DELETE_USER_REQUEST, DELETE_USER_SUCCESS, DELETE_USER_FAILURE,
    CLEAR_ADMIN_ERROR, CLEAR_ADMIN_MESSAGE
} from "./admin.actionType";
import { GET_INSTRUCTORS_SUCCESS } from "./admin.actionType";

const initialState = {
    loading: false,
    error: null,
    users: [],        
    user: null,
    pagination: {},
    message: null,
    success: false,
    instructors: []
};

export const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_USERS_REQUEST:
        case CREATE_USER_REQUEST:
        case GET_USER_BY_ID_REQUEST:
        case UPDATE_USER_REQUEST:
        case DELETE_USER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                success: false
            };

        case GET_ALL_USERS_SUCCESS:
            return {
                ...state,
                loading: false,
                users: action.payload.data,
                pagination: action.payload.pagination
            };

        case CREATE_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Create user successfully!"
            };

        case DELETE_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: action.payload.message
            };

        case UPDATE_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Update user successfully!",
                user: action.payload.data
            };

        case GET_USER_BY_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                user: action.payload
            };

        case GET_INSTRUCTORS_SUCCESS:
            return {
                ...state,
                instructors: action.payload
            };

        case GET_ALL_USERS_FAILURE:
        case CREATE_USER_FAILURE:
        case GET_USER_BY_ID_FAILURE:
        case UPDATE_USER_FAILURE:
        case DELETE_USER_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false
            };

        case CLEAR_ADMIN_ERROR:
            return { ...state, error: null };
        
        case CLEAR_ADMIN_MESSAGE:
            return { ...state, message: null, success: false };

        default:
            return state;
    }
};