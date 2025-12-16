import api from "../api";
import { GET_PUBLIC_INSTRUCTORS_REQUEST, GET_PUBLIC_INSTRUCTORS_SUCCESS, GET_PUBLIC_INSTRUCTORS_FAILURE } from "./instructor.actionType";

export const getPublicInstructorsAction = (page = 1, limit = 10, search = "") => async (dispatch) => {
    dispatch({ type: GET_PUBLIC_INSTRUCTORS_REQUEST });
    try {
        const params = { page, limit };
        if (search) params.search = search;

        const { data } = await api.get('/user/instructors', { params });

        dispatch({
            type: GET_PUBLIC_INSTRUCTORS_SUCCESS,
            payload: {
                instructors: data.data,
                pagination: data.pagination
            }
        });
    } catch (error) {
        dispatch({
            type: GET_PUBLIC_INSTRUCTORS_FAILURE,
            payload: error.response?.data?.message || "Can't get all instructors"
        });
    }
};