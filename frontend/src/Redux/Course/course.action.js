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
    CLEAR_COURSE_ERROR, CLEAR_COURSE_MESSAGE,
    UNENROLL_COURSE_REQUEST,
    UNENROLL_COURSE_SUCCESS,
    UNENROLL_COURSE_FAILURE, CREATE_MODULE_REQUEST, CREATE_MODULE_SUCCESS, CREATE_MODULE_FAILURE,
    UPDATE_MODULE_REQUEST, UPDATE_MODULE_SUCCESS, UPDATE_MODULE_FAILURE,
    DELETE_MODULE_REQUEST, DELETE_MODULE_SUCCESS, DELETE_MODULE_FAILURE,
    CREATE_LESSON_REQUEST, CREATE_LESSON_SUCCESS, CREATE_LESSON_FAILURE,
    UPDATE_LESSON_REQUEST, UPDATE_LESSON_SUCCESS, UPDATE_LESSON_FAILURE,
    DELETE_LESSON_REQUEST, DELETE_LESSON_SUCCESS, DELETE_LESSON_FAILURE,
    REORDER_MODULES_REQUEST, REORDER_MODULES_SUCCESS, REORDER_MODULES_FAILURE,
} from "./course.actionType";

//admin, student
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

export const getInstructorCourseByIdAction = (id) => async (dispatch) => {
    dispatch({ type: GET_COURSE_BY_ID_REQUEST });
    try {
        const { data } = await api.get('/course/me/courses');
        
        let courseArray = [];

        if (data.data && Array.isArray(data.data.courses)) {
            courseArray = data.data.courses;
        } 
        else if (data.courses && Array.isArray(data.courses)) {
            courseArray = data.courses;
        }
        else if (Array.isArray(data.data)) {
            courseArray = data.data;
        }

        const foundCourse = courseArray.find(c => c.id == id);

        if (foundCourse) {
            dispatch({ type: GET_COURSE_BY_ID_SUCCESS, payload: foundCourse });
        } else {
            throw new Error(`Không tìm thấy khóa học ID ${id} trong danh sách của bạn.`);
        }

    } catch (error) {
        console.error("Lỗi Action Instructor:", error);
        dispatch({ 
            type: GET_COURSE_BY_ID_FAILURE, 
            payload: error.response?.data?.message || error.message || "Lỗi lấy dữ liệu" 
        });
    }
};

//student
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
        const config = {};

        if (!(courseData instanceof FormData)) {
            config.headers = {
                'Content-Type': 'application/json'
            };
        }

        const { data } = await api.put(`/course/${courseId}`, courseData, config);

        console.log("Update Course Success:", data);
        dispatch({ type: UPDATE_COURSE_SUCCESS, payload: data });
        
        dispatch(getAllCoursesAction());
        dispatch(getInstructorCoursesAction());
        // dispatch(getCourseByIdAction(courseId));

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

export const unenrollCourseAction = (courseId) => async (dispatch) => {
    dispatch({ type: UNENROLL_COURSE_REQUEST });
    try {
        const { data } = await api.delete(`/course/${courseId}/enrollments`);
        dispatch({ type: UNENROLL_COURSE_SUCCESS, payload: data });
        dispatch(getUserEnrollmentsAction());
    } catch (error) {
        dispatch({
            type: UNENROLL_COURSE_FAILURE,
            payload: error.response?.data?.message || "Failed to unenroll"
        });
    }
};

export const getUserEnrollmentsAction = (page = 1, limit = 10, search = "") => async (dispatch) => {
    dispatch({ type: GET_USER_ENROLLMENTS_REQUEST });
    try {
        const params = { page, limit, search };

        const { data } = await api.get('/course/me/enrollments', { params }); 
        console.log("enrollment me: ",data);       

        dispatch({ type: GET_USER_ENROLLMENTS_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Get enrollments error:", error);
        dispatch({
            type: GET_USER_ENROLLMENTS_FAILURE,
            payload: error.response?.data?.message || "Failed to get enrollments"
        });
    }
};

//modules
export const createModuleAction = (courseId, moduleData) => async (dispatch) => {
    dispatch({ type: CREATE_MODULE_REQUEST });
    try {
        const { data } = await api.post(`/module/course/${courseId}`, moduleData);
        
        console.log("Create Module Success:", data);
        dispatch({ type: CREATE_MODULE_SUCCESS, payload: data.data });
        
        //load lại chi tiết khóa học để hiển thị module mới
        // dispatch(getCourseByIdAction(courseId)); 
    } catch (error) {
        dispatch({ 
            type: CREATE_MODULE_FAILURE, 
            payload: error.response?.data?.message || "Failed to create module"
        });
    }
};

export const updateModuleAction = (moduleId, moduleData, courseId) => async (dispatch) => {
    dispatch({ type: UPDATE_MODULE_REQUEST });
    try {
        const { data } = await api.put(`/module/${moduleId}`, moduleData);
        
        dispatch({ type: UPDATE_MODULE_SUCCESS, payload: data.data });
        
        dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ 
            type: UPDATE_MODULE_FAILURE, 
            payload: error.response?.data?.message || "Failed to update module"
        });
    }
};

export const deleteModuleAction = (moduleId, courseId) => async (dispatch) => {
    dispatch({ type: DELETE_MODULE_REQUEST });
    try {
        const { data } = await api.delete(`/module/${moduleId}`);
        
        dispatch({ type: DELETE_MODULE_SUCCESS, payload: { message: data.message, moduleId } });
        
        dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ 
            type: DELETE_MODULE_FAILURE, 
            payload: error.response?.data?.message || "Failed to delete module"
        });
    }
};

export const reorderModulesAction = (courseId, moduleOrders) => async (dispatch) => {
    dispatch({ type: REORDER_MODULES_REQUEST });
    try {
        const { data } = await api.patch(`/module/course/${courseId}/reorder`, { moduleOrders });
        
        dispatch({ type: REORDER_MODULES_SUCCESS, payload: data.data });
        
        dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ 
            type: REORDER_MODULES_FAILURE, 
            payload: error.response?.data?.message || "Failed to reorder modules"
        });
    }
};

//lessons
export const createLessonAction = (moduleId, lessonData, courseId) => async (dispatch) => {
    dispatch({ type: CREATE_LESSON_REQUEST });
    try {
        const config = lessonData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        
        const { data } = await api.post(`/lesson/module/${moduleId}`, lessonData, config);

        dispatch({ type: CREATE_LESSON_SUCCESS, payload: data });
        console.log('create lesson success', data);

        dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ type: CREATE_LESSON_FAILURE, payload: error.response?.data?.message });
    }
};

export const updateLessonAction = (lessonId, lessonData, courseId) => async (dispatch) => {
    dispatch({ type: UPDATE_LESSON_REQUEST });
    try {
        const config = lessonData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const { data } = await api.put(`/lesson/${lessonId}`, lessonData, config);
        dispatch({ type: UPDATE_LESSON_SUCCESS, payload: data });
        dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ type: UPDATE_LESSON_FAILURE, payload: error.response?.data?.message });
    }
};

export const deleteLessonAction = (lessonId, courseId) => async (dispatch) => {
    dispatch({ type: DELETE_LESSON_REQUEST });
    try {
        await api.delete(`/lesson/${lessonId}`);
        dispatch({ type: DELETE_LESSON_SUCCESS, payload: lessonId });
        dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ type: DELETE_LESSON_FAILURE, payload: error.response?.data?.message });
    }
};


export const clearCourseMessage = () => (dispatch) => dispatch({ type: CLEAR_COURSE_MESSAGE });