import api from "../api";
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

export const getAllCoursesAction = (page = 1, limit = 10, search = "", category = "", isPublished = "") => async (dispatch) => {
    dispatch({ type: GET_ALL_COURSES_REQUEST });
    try {
        const params = { page, limit };
        if (search) params.search = search;
        if (category) params.category = category;
        if (isPublished) params.isPublished = isPublished;

        const { data } = await api.get('/course', { params });

        console.log("Get All Courses Success:", data);
        dispatch({ type: GET_ALL_COURSES_SUCCESS, payload: data.data }); 
    } catch (error) {
        console.log("Get All Courses Failure:", error);
        dispatch({
            type: GET_ALL_COURSES_FAILURE,
            payload: error.response?.data?.message || "Failed to fetch courses"
        });
    }
};

export const getInstructorCoursesAction = (page = 1, limit = 10, search = "", isPublished = "") => async (dispatch) => {
    dispatch({ type: GET_INSTRUCTOR_COURSES_REQUEST });
    try {
        const params = { page, limit };
        if (search) params.search = search;
        if (isPublished) params.isPublished = isPublished;

        const { data } = await api.get('/course/me/courses', { params });
        
        console.log("Get Instructor Courses Success:", data);
        dispatch({ type: GET_INSTRUCTOR_COURSES_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GET_INSTRUCTOR_COURSES_FAILURE,
            payload: error.response?.data?.message || "Failed to fetch your courses"
        });
    }
};

//(Admin/Instructor Detail)
export const getCourseByIdAction = (courseId) => async (dispatch) => {
    dispatch({ type: GET_COURSE_BY_ID_REQUEST });
    try {
        const { data } = await api.get(`/course/${courseId}`);
        dispatch({ type: GET_COURSE_BY_ID_SUCCESS, payload: data.data }); 
    } catch (error) {
        dispatch({
            type: GET_COURSE_BY_ID_FAILURE,
            payload: error.response?.data?.message || "Failed to fetch course detail"
        });
    }
};

export const getCourseBySlugAction = (slug) => async (dispatch) => {
    dispatch({ type: GET_COURSE_BY_SLUG_REQUEST });
    try {
        const { data } = await api.get(`/course/slug/${slug}`);
        dispatch({ type: GET_COURSE_BY_SLUG_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GET_COURSE_BY_SLUG_FAILURE,
            payload: error.response?.data?.message || "Failed to fetch course"
        });
    }
};

export const createCourseAction = (courseData) => async (dispatch) => {
    dispatch({ type: CREATE_COURSE_REQUEST });
    try {
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' }
        };
        
        const { data } = await api.post('/course', courseData, config);

        console.log("Create Course Success:", data);
        dispatch({ type: CREATE_COURSE_SUCCESS, payload: data });
        
        dispatch(getAllCoursesAction());
        dispatch(getInstructorCoursesAction());
        
    } catch (error) {
        dispatch({
            type: CREATE_COURSE_FAILURE,
            payload: error.response?.data?.message || "Failed to create course"
        });
    }
};

export const updateCourseAction = (courseId, courseData) => async (dispatch) => {
    dispatch({ type: UPDATE_COURSE_REQUEST });
    try {
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' }
        };

        const { data } = await api.put(`/course/${courseId}`, courseData, config);

        console.log("Update Course Success:", data);
        dispatch({ type: UPDATE_COURSE_SUCCESS, payload: data });
        
        dispatch(getAllCoursesAction());
        dispatch(getInstructorCoursesAction());
        dispatch(getCourseByIdAction(courseId));

    } catch (error) {
        dispatch({
            type: UPDATE_COURSE_FAILURE,
            payload: error.response?.data?.message || "Failed to update course"
        });
    }
};

export const deleteCourseAction = (courseId) => async (dispatch) => {
    dispatch({ type: DELETE_COURSE_REQUEST });
    try {
        const { data } = await api.delete(`/course/${courseId}`);

        dispatch({ 
            type: DELETE_COURSE_SUCCESS, 
            payload: { message: "Course deleted successfully", courseId } 
        });

        dispatch(getAllCoursesAction());
        dispatch(getInstructorCoursesAction());

    } catch (error) {
        dispatch({
            type: DELETE_COURSE_FAILURE,
            payload: error.response?.data?.message || "Failed to delete course"
        });
    }
};

export const enrollCourseAction = (courseId) => async (dispatch) => {
    dispatch({ type: ENROLL_COURSE_REQUEST });
    try {
        const { data } = await api.post(`/course/${courseId}/enroll`);
        dispatch({ type: ENROLL_COURSE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ENROLL_COURSE_FAILURE,
            payload: error.response?.data?.message || "Failed to enroll"
        });
    }
};

export const getUserEnrollmentsAction = (page = 1, limit = 10, search = "") => async (dispatch) => {
    dispatch({ type: GET_USER_ENROLLMENTS_REQUEST });
    try {
        const params = { page, limit, search };
        const { data } = await api.get('/course/enrollments', { params });
        dispatch({ type: GET_USER_ENROLLMENTS_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GET_USER_ENROLLMENTS_FAILURE,
            payload: error.response?.data?.message || "Failed to get enrollments"
        });
    }
};

export const clearCourseMessage = () => (dispatch) => dispatch({ type: CLEAR_COURSE_MESSAGE });