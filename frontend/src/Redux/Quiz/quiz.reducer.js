import {
    CREATE_QUIZ_REQUEST, CREATE_QUIZ_SUCCESS, CREATE_QUIZ_FAILURE,
    UPDATE_QUIZ_REQUEST, UPDATE_QUIZ_SUCCESS, UPDATE_QUIZ_FAILURE,
    DELETE_QUIZ_REQUEST, DELETE_QUIZ_SUCCESS, DELETE_QUIZ_FAILURE,
    GET_QUIZ_BY_ID_REQUEST, GET_QUIZ_BY_ID_SUCCESS, GET_QUIZ_BY_ID_FAILURE,
    CLEAR_QUIZ_MESSAGE, CLEAR_QUIZ_ERROR, GET_ALL_QUIZZES_REQUEST, GET_ALL_QUIZZES_SUCCESS, GET_ALL_QUIZZES_FAILURE
} from "./quiz.actionType";

const initialState = {
    loading: false,
    quiz: null,
    quizzes: [],
    error: null,
    message: null,
    success: false
};

export const quizReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_QUIZ_REQUEST:
        case UPDATE_QUIZ_REQUEST:
        case DELETE_QUIZ_REQUEST:
        case GET_QUIZ_BY_ID_REQUEST:
            return { 
                ...state, 
                loading: true, 
                error: null, 
                success: false 
            };

        case GET_ALL_QUIZZES_REQUEST:
            return { ...state, loading: true, error: null };

        case GET_QUIZ_BY_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                quiz: action.payload,
                error: null
            };

        case CREATE_QUIZ_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Quiz created successfully!",
                quiz: action.payload.data
            };

        case UPDATE_QUIZ_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Quiz updated successfully!",
                quiz: action.payload.data
            };

        case DELETE_QUIZ_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Quiz deleted successfully!",
                quiz: null,
                quizzes: state.quizzes.filter(q => q.id !== action.payload)
            };

        case GET_ALL_QUIZZES_SUCCESS:
            return { 
                ...state, 
                loading: false, 
                quizzes: action.payload
            };

        case CREATE_QUIZ_FAILURE:
        case UPDATE_QUIZ_FAILURE:
        case DELETE_QUIZ_FAILURE:
        case GET_QUIZ_BY_ID_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false
            };
        
        case GET_ALL_QUIZZES_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case CLEAR_QUIZ_MESSAGE:
            return { ...state, message: null, success: false };
        
        case CLEAR_QUIZ_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};