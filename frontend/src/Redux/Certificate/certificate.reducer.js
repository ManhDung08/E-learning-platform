import {
  GET_CERTIFICATE_BY_ID_REQUEST,
  GET_CERTIFICATE_BY_ID_SUCCESS,
  GET_CERTIFICATE_BY_ID_FAILURE,
  GET_MY_CERTIFICATES_REQUEST,
  GET_MY_CERTIFICATES_SUCCESS,
  GET_MY_CERTIFICATES_FAILURE,
  GET_CERTIFICATES_BY_USER_REQUEST,
  GET_CERTIFICATES_BY_USER_SUCCESS,
  GET_CERTIFICATES_BY_USER_FAILURE,
  CLEAR_CERTIFICATE_ERROR,
  CLEAR_CERTIFICATE_MESSAGE,
} from "./certificate.actionType";

const initialState = {
  loading: false,
  error: null,
  message: null,
  success: false,
  certificate: null, // Certificate detail
  myCertificates: [], // List of current user's certificates
  userCertificates: [], // List of specific user's certificates
};

export const certificateReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CERTIFICATE_BY_ID_REQUEST:
    case GET_MY_CERTIFICATES_REQUEST:
    case GET_CERTIFICATES_BY_USER_REQUEST:
      return { ...state, loading: true, error: null, success: false };

    case GET_CERTIFICATE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        certificate: action.payload,
        success: true,
      };

    case GET_MY_CERTIFICATES_SUCCESS:
      return {
        ...state,
        loading: false,
        myCertificates: action.payload,
        success: true,
      };

    case GET_CERTIFICATES_BY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        userCertificates: action.payload,
        success: true,
      };

    case GET_CERTIFICATE_BY_ID_FAILURE:
    case GET_MY_CERTIFICATES_FAILURE:
    case GET_CERTIFICATES_BY_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case CLEAR_CERTIFICATE_ERROR:
      return { ...state, error: null };

    case CLEAR_CERTIFICATE_MESSAGE:
      return { ...state, message: null, success: false };

    default:
      return state;
  }
};

