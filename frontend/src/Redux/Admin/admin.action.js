import api from "../api";
import {
    GET_ALL_USERS_REQUEST, GET_ALL_USERS_SUCCESS, GET_ALL_USERS_FAILURE,
    CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE,
    GET_USER_BY_ID_REQUEST, GET_USER_BY_ID_SUCCESS, GET_USER_BY_ID_FAILURE,
    UPDATE_USER_REQUEST, UPDATE_USER_SUCCESS, UPDATE_USER_FAILURE,
    DELETE_USER_REQUEST, DELETE_USER_SUCCESS, DELETE_USER_FAILURE,
    CLEAR_ADMIN_ERROR, CLEAR_ADMIN_MESSAGE
} from "./admin.actionType";

export const getAllUsersAction = (page = 1, limit = 10, search = "", role = "", isActive = null) => async (dispatch) => {
    dispatch({ type: GET_ALL_USERS_REQUEST });

    try {
        const params = { page, limit };
        if (search) params.search = search;
        if (role) params.role = role;
        if (isActive !== null) params.isActive = isActive;

        const { data } = await api.get('/user', { params });

        console.log("Admin Get Users Success:", data);
        dispatch({
            type: GET_ALL_USERS_SUCCESS,
            payload: data
        });

    } catch (error) {
        console.log("Admin Get Users Failure:", error);
        dispatch({
            type: GET_ALL_USERS_FAILURE,
            payload: error.response?.data?.message || "Failed to fetch users"
        });
    }
};

export const createUserAction = (userData) => async (dispatch) => {
    dispatch({ type: CREATE_USER_REQUEST });

    try {
        const { data } = await api.post('/user', userData);

        console.log("Admin Create User Success:", data);
        dispatch({
            type: CREATE_USER_SUCCESS,
            payload: data
        });
        
        dispatch(getAllUsersAction());

    } catch (error) {
        console.log("Admin Create User Failure:", error);
        dispatch({
            type: CREATE_USER_FAILURE,
            payload: error.response?.data?.message || "Failed to create user"
        });
    }
};

export const deleteUserAction = (userId) => async (dispatch) => {
    dispatch({ type: DELETE_USER_REQUEST });

    try {
        const { data } = await api.delete(`/user/${userId}`);

        console.log("Admin Delete User Success:", data);
        dispatch({
            type: DELETE_USER_SUCCESS,
            payload: { message: "User deleted successfully", userId }
        });

        dispatch(getAllUsersAction());

    } catch (error) {
        console.log("Admin Delete User Failure:", error);
        dispatch({
            type: DELETE_USER_FAILURE,
            payload: error.response?.data?.message || "Failed to delete user"
        });
    }
};

export const updateUserAction = (userId, updatedData) => async (dispatch) => {
    dispatch({ type: UPDATE_USER_REQUEST });

    try {
        const { data } = await api.put(`/user/${userId}`, updatedData);

        console.log("Admin Update User Success:", data);
        dispatch({
            type: UPDATE_USER_SUCCESS,
            payload: data
        });
        
        dispatch(getAllUsersAction());

    } catch (error) {
        console.log("Admin Update User Failure:", error);
        dispatch({
            type: UPDATE_USER_FAILURE,
            payload: error.response?.data?.message || "Failed to update user"
        });
    }
};

export const getUserByIdAction = (userId) => async (dispatch) => {
    dispatch({ type: GET_USER_BY_ID_REQUEST });

    try {
        const { data } = await api.get(`/user/${userId}`);
        
        console.log("Admin Get User Detail Success:", data);
        dispatch({
            type: GET_USER_BY_ID_SUCCESS,
            payload: data.data
        });

    } catch (error) {
        dispatch({
            type: GET_USER_BY_ID_FAILURE,
            payload: error.response?.data?.message || "Failed to fetch user detail"
        });
    }
};

export const clearAdminError = () => (dispatch) => {
    dispatch({ type: CLEAR_ADMIN_ERROR });
};

export const clearAdminMessage = () => (dispatch) => {
    dispatch({ type: CLEAR_ADMIN_MESSAGE });
};