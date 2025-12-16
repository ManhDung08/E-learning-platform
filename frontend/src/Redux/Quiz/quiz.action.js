import api from "../api";
import {
    CREATE_QUIZ_REQUEST, CREATE_QUIZ_SUCCESS, CREATE_QUIZ_FAILURE,
    UPDATE_QUIZ_REQUEST, UPDATE_QUIZ_SUCCESS, UPDATE_QUIZ_FAILURE,
    DELETE_QUIZ_REQUEST, DELETE_QUIZ_SUCCESS, DELETE_QUIZ_FAILURE,
    GET_QUIZ_BY_ID_REQUEST, GET_QUIZ_BY_ID_SUCCESS, GET_QUIZ_BY_ID_FAILURE,
    CLEAR_QUIZ_MESSAGE, CLEAR_QUIZ_ERROR, GET_ALL_QUIZZES_REQUEST, GET_ALL_QUIZZES_SUCCESS, GET_ALL_QUIZZES_FAILURE
} from "./quiz.actionType";

import { getCourseByIdAction } from "../Course/course.action"; 

export const createQuizAction = (lessonId, quizData, courseId) => async (dispatch) => {
    dispatch({ type: CREATE_QUIZ_REQUEST });
    try {
        const { data } = await api.post(`/quiz/lesson/${lessonId}`, quizData);
        
        dispatch({ type: CREATE_QUIZ_SUCCESS, payload: data });
        
        dispatch(getAllQuizzesForLessonAction(lessonId));

        if(courseId) dispatch(getCourseByIdAction(courseId)); 
    } catch (error) {
        dispatch({ 
            type: CREATE_QUIZ_FAILURE, 
            payload: error.response?.data?.message || "Failed to create quiz" 
        });
    }
};


export const updateQuizAction = (quizId, quizData, courseId) => async (dispatch) => {
    dispatch({ type: UPDATE_QUIZ_REQUEST });
    try {
        const { data } = await api.put(`/quiz/${quizId}`, quizData);
        
        dispatch({ type: UPDATE_QUIZ_SUCCESS, payload: data });
        
        if(courseId) dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ 
            type: UPDATE_QUIZ_FAILURE, 
            payload: error.response?.data?.message || "Failed to update quiz" 
        });
    }
};

export const deleteQuizAction = (quizId, courseId) => async (dispatch) => {
    dispatch({ type: DELETE_QUIZ_REQUEST });
    try {
        await api.delete(`/quiz/${quizId}`);
        
        dispatch({ type: DELETE_QUIZ_SUCCESS, payload: quizId });
        
        if(courseId) dispatch(getCourseByIdAction(courseId));
    } catch (error) {
        dispatch({ 
            type: DELETE_QUIZ_FAILURE, 
            payload: error.response?.data?.message || "Failed to delete quiz" 
        });
    }
};


export const getQuizByIdAction = (quizId) => async (dispatch) => {
    dispatch({ type: GET_QUIZ_BY_ID_REQUEST });
    try {
        const { data } = await api.get(`/quiz/${quizId}`);
        dispatch({ type: GET_QUIZ_BY_ID_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ 
            type: GET_QUIZ_BY_ID_FAILURE, 
            payload: error.response?.data?.message || "Failed to fetch quiz details" 
        });
    }
};

export const getAllQuizzesForLessonAction = (lessonId) => async (dispatch) => {
    dispatch({ type: GET_ALL_QUIZZES_REQUEST });
    try {
        const { data } = await api.get(`/quiz/lessons/${lessonId}/quizzes`);
        
        console.log("Quizzes fetched:", data.data);

        dispatch({ type: GET_ALL_QUIZZES_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Get All Quizzes Error:", error);
        dispatch({ 
            type: GET_ALL_QUIZZES_FAILURE, 
            payload: error.response?.data?.message || "Failed to fetch quizzes" 
        });
    }
};

export const clearQuizMessage = () => (dispatch) => dispatch({ type: CLEAR_QUIZ_MESSAGE });
export const clearQuizError = () => (dispatch) => dispatch({ type: CLEAR_QUIZ_ERROR });