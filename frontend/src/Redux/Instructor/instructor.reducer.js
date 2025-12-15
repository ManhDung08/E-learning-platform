import {
    GET_PUBLIC_INSTRUCTORS_REQUEST,
    GET_PUBLIC_INSTRUCTORS_SUCCESS,
    GET_PUBLIC_INSTRUCTORS_FAILURE
} from "./instructor.actionType";

const initialState = {
    instructors: [],
    pagination: null,
    loading: false,
    error: null,
};

export const instructorReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_PUBLIC_INSTRUCTORS_REQUEST:
            return { ...state, loading: true, error: null };
        
        case GET_PUBLIC_INSTRUCTORS_SUCCESS:
            return {
                ...state,
                loading: false,
                instructors: action.payload.instructors,
                pagination: action.payload.pagination,
            };

        case GET_PUBLIC_INSTRUCTORS_FAILURE:
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};