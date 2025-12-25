import {
  CREATE_QUIZ_REQUEST,
  CREATE_QUIZ_SUCCESS,
  CREATE_QUIZ_FAILURE,
  UPDATE_QUIZ_REQUEST,
  UPDATE_QUIZ_SUCCESS,
  UPDATE_QUIZ_FAILURE,
  DELETE_QUIZ_REQUEST,
  DELETE_QUIZ_SUCCESS,
  DELETE_QUIZ_FAILURE,
  GET_QUIZ_BY_ID_REQUEST,
  GET_QUIZ_BY_ID_SUCCESS,
  GET_QUIZ_BY_ID_FAILURE,
  CLEAR_QUIZ_MESSAGE,
  CLEAR_QUIZ_ERROR,
  GET_ALL_QUIZZES_REQUEST,
  GET_ALL_QUIZZES_SUCCESS,
  GET_ALL_QUIZZES_FAILURE,
  START_QUIZ_ATTEMPT_REQUEST,
  START_QUIZ_ATTEMPT_SUCCESS,
  START_QUIZ_ATTEMPT_FAILURE,
  SUBMIT_QUIZ_ATTEMPT_REQUEST,
  SUBMIT_QUIZ_ATTEMPT_SUCCESS,
  SUBMIT_QUIZ_ATTEMPT_FAILURE,
  GET_QUIZ_ATTEMPT_REQUEST,
  GET_QUIZ_ATTEMPT_SUCCESS,
  GET_QUIZ_ATTEMPT_FAILURE,
  RESET_QUIZ_STATE,
  CLEAR_QUIZ_RESULT,
  GET_USER_QUIZ_ATTEMPTS_REQUEST,
  GET_USER_QUIZ_ATTEMPTS_SUCCESS,
  GET_USER_QUIZ_ATTEMPTS_FAILURE,
  GET_ALL_ATTEMPTS_OF_QUIZ_REQUEST,
  GET_ALL_ATTEMPTS_OF_QUIZ_SUCCESS,
  GET_ALL_ATTEMPTS_OF_QUIZ_FAILURE,
} from "./quiz.actionType";

const initialState = {
  loading: false,
  quiz: null,
  quizzes: [],
  error: null,
  message: null,
  success: false,
  userAttempts: [],
  instructorQuizAttempts: [], //lịch sử làm bài của tất cả học viên
  currentAttempt: null,
  quizResult: null,
};

export const quizReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_QUIZ_REQUEST:
    case UPDATE_QUIZ_REQUEST:
    case DELETE_QUIZ_REQUEST:
    case GET_QUIZ_BY_ID_REQUEST:
    case START_QUIZ_ATTEMPT_REQUEST:
    case SUBMIT_QUIZ_ATTEMPT_REQUEST:
    case GET_QUIZ_ATTEMPT_REQUEST:
    case GET_USER_QUIZ_ATTEMPTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case GET_ALL_ATTEMPTS_OF_QUIZ_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_ALL_QUIZZES_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_QUIZ_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        quiz: action.payload,
        error: null,
      };

    case CREATE_QUIZ_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: "Quiz created successfully!",
        quiz: action.payload.data,
      };

    case UPDATE_QUIZ_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: "Quiz updated successfully!",
        quiz: action.payload.data,
      };

    case DELETE_QUIZ_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: "Quiz deleted successfully!",
        quiz: null,
        quizzes: state.quizzes.filter((q) => q.id !== action.payload),
      };

    case GET_ALL_QUIZZES_SUCCESS:
      return {
        ...state,
        loading: false,
        quizzes: action.payload,
      };

    case START_QUIZ_ATTEMPT_SUCCESS:
      return {
        ...state,
        loading: false,
        currentAttempt: action.payload,
        quizResult: null,
        error: null,
      };

    case SUBMIT_QUIZ_ATTEMPT_SUCCESS:
      return {
        ...state,
        loading: false,
        quizResult: action.payload,
        // currentAttempt: null,
        error: null,
      };

    case GET_QUIZ_ATTEMPT_SUCCESS:
      return {
        ...state,
        loading: false,
        currentAttempt: action.payload,
        error: null,
      };

    case GET_USER_QUIZ_ATTEMPTS_SUCCESS:
      return {
        ...state,
        loading: false,
        userAttempts: action.payload,
      };

    case GET_ALL_ATTEMPTS_OF_QUIZ_SUCCESS:
      return {
        ...state,
        loading: false,
        instructorQuizAttempts: action.payload.attempts || [],
        error: null,
      };

    case CREATE_QUIZ_FAILURE:
    case UPDATE_QUIZ_FAILURE:
    case DELETE_QUIZ_FAILURE:
    case GET_QUIZ_BY_ID_FAILURE:
    case START_QUIZ_ATTEMPT_FAILURE:
    case SUBMIT_QUIZ_ATTEMPT_FAILURE:
    case GET_QUIZ_ATTEMPT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case GET_ALL_QUIZZES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case GET_USER_QUIZ_ATTEMPTS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case GET_ALL_ATTEMPTS_OF_QUIZ_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_QUIZ_MESSAGE:
      return { ...state, message: null, success: false };

    case CLEAR_QUIZ_ERROR:
      return { ...state, error: null };

    case RESET_QUIZ_STATE:
      return {
        ...state,
        currentAttempt: null,
        quizResult: null,
        error: null,
      };

    case CLEAR_QUIZ_RESULT:
      return {
        ...state,
        quizResult: null, // Only clear quizResult, keep currentAttempt
        error: null,
      };

    default:
      return state;
  }
};
