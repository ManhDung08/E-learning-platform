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
    CLEAR_COURSE_ERROR, CLEAR_COURSE_MESSAGE,
    UNENROLL_COURSE_REQUEST,
    UNENROLL_COURSE_SUCCESS,
    UNENROLL_COURSE_FAILURE,
    CREATE_MODULE_REQUEST, CREATE_MODULE_SUCCESS, CREATE_MODULE_FAILURE,
    UPDATE_MODULE_REQUEST, UPDATE_MODULE_SUCCESS, UPDATE_MODULE_FAILURE,
    DELETE_MODULE_REQUEST, DELETE_MODULE_SUCCESS, DELETE_MODULE_FAILURE,
    REORDER_MODULES_REQUEST, REORDER_MODULES_SUCCESS, REORDER_MODULES_FAILURE,
    CREATE_LESSON_REQUEST, CREATE_LESSON_SUCCESS, CREATE_LESSON_FAILURE,
    UPDATE_LESSON_REQUEST, UPDATE_LESSON_SUCCESS, UPDATE_LESSON_FAILURE,
    DELETE_LESSON_REQUEST, DELETE_LESSON_SUCCESS, DELETE_LESSON_FAILURE
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
        case UNENROLL_COURSE_REQUEST:
        case CREATE_COURSE_REQUEST:
        case UPDATE_COURSE_REQUEST:
        case DELETE_COURSE_REQUEST:
        case ENROLL_COURSE_REQUEST:
        case GET_USER_ENROLLMENTS_REQUEST:
        case CREATE_MODULE_REQUEST:
        case UPDATE_MODULE_REQUEST:
        case DELETE_MODULE_REQUEST:
        case REORDER_MODULES_REQUEST:
        case CREATE_LESSON_REQUEST:
        case UPDATE_LESSON_REQUEST:
        case DELETE_LESSON_REQUEST:
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
        case UNENROLL_COURSE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Unenrolled successfully!"
            };

        case CREATE_MODULE_SUCCESS:
        case CREATE_LESSON_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Created successfully"
            };

        case UPDATE_MODULE_SUCCESS:
        case UPDATE_LESSON_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Updated successfully"
            };

        case DELETE_MODULE_SUCCESS:
        case DELETE_LESSON_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Deleted successfully"
            };

        case REORDER_MODULES_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                message: "Modules reordered successfully"
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
        case UNENROLL_COURSE_FAILURE:
        //modules
        case CREATE_MODULE_FAILURE:
        case UPDATE_MODULE_FAILURE:
        case DELETE_MODULE_FAILURE:
        case REORDER_MODULES_FAILURE:
        //lessons
        case CREATE_LESSON_FAILURE:
        case UPDATE_LESSON_FAILURE:
        case DELETE_LESSON_FAILURE:
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