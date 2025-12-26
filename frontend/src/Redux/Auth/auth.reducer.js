import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPLOAD_AVATAR_REQUEST,
  UPLOAD_AVATAR_SUCCESS,
  UPLOAD_AVATAR_FAILURE,
  DELETE_AVATAR_REQUEST,
  DELETE_AVATAR_SUCCESS,
  DELETE_AVATAR_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  SET_PASSWORD_REQUEST,
  SET_PASSWORD_SUCCESS,
  SET_PASSWORD_FAILURE,
  VERIFY_EMAIL_REQUEST,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_FAILURE,
  RESEND_VERIFICATION_REQUEST,
  RESEND_VERIFICATION_SUCCESS,
  RESEND_VERIFICATION_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  LOG_OUT,
  CLEAR_ERROR,
  GOOGLE_AUTH_REQUEST,
  GOOGLE_AUTH_SUCCESS,
  GOOGLE_AUTH_FAILURE,
  OPEN_AUTH_MODAL,
  CLOSE_AUTH_MODAL,
} from "./auth.actionType";

const initialState = {
  error: null,
  loading: false,
  user: null,
  isAuthenticated: false,
  registrationSuccess: false,
  verificationMessage: null,
  passwordResetMessage: null,
  passwordChangeMessage: null,
  avatarUploadSuccess: false,
  isAuthChecked: false,
  authModalOpen: false,
  authModalView: "login",
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case UPDATE_PROFILE_REQUEST:
    case UPLOAD_AVATAR_REQUEST:
    case DELETE_AVATAR_REQUEST:
    case CHANGE_PASSWORD_REQUEST:
    case SET_PASSWORD_REQUEST:
    case VERIFY_EMAIL_REQUEST:
    case RESEND_VERIFICATION_REQUEST:
    case FORGOT_PASSWORD_REQUEST:
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        registrationSuccess: false,
        verificationMessage: null,
        passwordResetMessage: null,
        passwordChangeMessage: null,
        avatarUploadSuccess: false,
      };

    case GET_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        registrationSuccess: true,
        verificationMessage: action.payload.message,
      };

    case VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null,
        verificationMessage: action.payload.message,
      };

    case GET_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
        loading: false,
        isAuthChecked: true,
      };

    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
        loading: false,
      };

    case UPLOAD_AVATAR_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        avatarUploadSuccess: true,
      };

    case DELETE_AVATAR_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        passwordChangeMessage: action.payload.message,
      };

    case SET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        passwordChangeMessage: action.payload.message,
      };

    case RESEND_VERIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        verificationMessage: action.payload.message,
      };

    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        passwordResetMessage: action.payload.message,
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        passwordResetMessage: action.payload.message,
      };

    case GET_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthChecked: true,
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case UPDATE_PROFILE_FAILURE:
    case UPLOAD_AVATAR_FAILURE:
    case DELETE_AVATAR_FAILURE:
    case CHANGE_PASSWORD_FAILURE:
    case SET_PASSWORD_FAILURE:
    case VERIFY_EMAIL_FAILURE:
    case RESEND_VERIFICATION_FAILURE:
    case FORGOT_PASSWORD_FAILURE:
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case LOG_OUT:
      return {
        ...initialState,
        isAuthChecked: true,
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case GOOGLE_AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case OPEN_AUTH_MODAL:
      return {
        ...state,
        authModalOpen: true,
        authModalView: action.payload || "login",
      };

    case CLOSE_AUTH_MODAL:
      return {
        ...state,
        authModalOpen: false,
      };

    default:
      return state;
  }
};
