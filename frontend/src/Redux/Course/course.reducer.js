import {
    GET_ALL_COURSES_REQUEST, GET_ALL_COURSES_SUCCESS, GET_ALL_COURSES_FAILURE,
    GET_INSTRUCTOR_COURSES_REQUEST, GET_INSTRUCTOR_COURSES_SUCCESS, GET_INSTRUCTOR_COURSES_FAILURE,
    GET_COURSE_BY_ID_REQUEST, GET_COURSE_BY_ID_SUCCESS, GET_COURSE_BY_ID_FAILURE,
    GET_COURSE_BY_SLUG_REQUEST, GET_COURSE_BY_SLUG_SUCCESS, GET_COURSE_BY_SLUG_FAILURE,
    CREATE_COURSE_REQUEST, CREATE_COURSE_SUCCESS, CREATE_COURSE_FAILURE,
    UPDATE_COURSE_REQUEST, UPDATE_COURSE_SUCCESS, UPDATE_COURSE_FAILURE,
    DELETE_COURSE_REQUEST, DELETE_COURSE_SUCCESS, DELETE_COURSE_FAILURE,
    ENROLL_COURSE_REQUEST, ENROLL_COURSE_SUCCESS, ENROLL_COURSE_FAILURE,
    GET_USER_ENROLLMENTS_REQUEST, GET_USER_ENROLLMENTS_SUCCESS, GET_USER_ENROLLMENTS_FAILURE,
    CLEAR_COURSE_ERROR, CLEAR_COURSE_MESSAGE
} from "./course.actionType";

const initialState = {
    loading: false,
    error: null,
    message: null,
    success: false,
    courses: [],
    instructorCourses: [],
    userEnrollments: [],
    course: null,
    pagination: {},       
};

export const courseReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_COURSES_REQUEST:
        case GET_INSTRUCTOR_COURSES_REQUEST:
        case GET_COURSE_BY_ID_REQUEST:
        case GET_COURSE_BY_SLUG_REQUEST:
        case CREATE_COURSE_REQUEST:
        case UPDATE_COURSE_REQUEST:
        case DELETE_COURSE_REQUEST:
        case ENROLL_COURSE_REQUEST:
        case GET_USER_ENROLLMENTS_REQUEST:
            return { ...state, loading: true, error: null, success: false };

       case GET_ALL_COURSES_SUCCESS:
            return {
                ...state,
                loading: false,
                courses: action.payload.courses, 
                pagination: action.payload.pagination
            };

        case GET_INSTRUCTOR_COURSES_SUCCESS:
            return {
                ...state,
                loading: false,
                instructorCourses: action.payload.courses,
                pagination: action.payload.pagination
            };

        case GET_USER_ENROLLMENTS_SUCCESS:
            return {
                ...state,
                loading: false,
                userEnrollments: action.payload.enrollments,
                pagination: action.payload.pagination
            };

        case GET_COURSE_BY_ID_SUCCESS:
        case GET_COURSE_BY_SLUG_SUCCESS:
            return {
                ...state,
                loading: false,
                course: action.payload
            };

        case CREATE_COURSE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Course created successfully!"
            };

        case UPDATE_COURSE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Course updated successfully!",
                course: action.payload.data 
            };

        case DELETE_COURSE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: action.payload.message
            };
            
        case ENROLL_COURSE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Enrolled successfully!"
            };

        case GET_ALL_COURSES_FAILURE:
        case GET_INSTRUCTOR_COURSES_FAILURE:
        case GET_COURSE_BY_ID_FAILURE:
        case GET_COURSE_BY_SLUG_FAILURE:
        case CREATE_COURSE_FAILURE:
        case UPDATE_COURSE_FAILURE:
        case DELETE_COURSE_FAILURE:
        case ENROLL_COURSE_FAILURE:
        case GET_USER_ENROLLMENTS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false
            };

        case CLEAR_COURSE_ERROR:
            return { ...state, error: null };
        case CLEAR_COURSE_MESSAGE:
            return { ...state, message: null, success: false };

        default:
            return state;
    }
};