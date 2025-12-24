import api from "../api";
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
} from "./certificate.actionType";

// Lấy certificate theo ID
export const getCertificateByIdAction = (certificateId) => async (dispatch) => {
  dispatch({ type: GET_CERTIFICATE_BY_ID_REQUEST });
  try {
    const { data } = await api.get(`/certificate/${certificateId}`);
    console.log("Get Certificate By ID Success:", data);
    dispatch({ type: GET_CERTIFICATE_BY_ID_SUCCESS, payload: data.data });
  } catch (error) {
    console.log("Get Certificate By ID Failure:", error);
    dispatch({
      type: GET_CERTIFICATE_BY_ID_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch certificate",
    });
  }
};

// Lấy danh sách certificate của user hiện tại
export const getMyCertificatesAction = () => async (dispatch) => {
  dispatch({ type: GET_MY_CERTIFICATES_REQUEST });
  try {
    const { data } = await api.get("/certificate/me");
    console.log("Get My Certificates Success:", data);
    dispatch({ type: GET_MY_CERTIFICATES_SUCCESS, payload: data.data });
  } catch (error) {
    console.log("Get My Certificates Failure:", error);
    dispatch({
      type: GET_MY_CERTIFICATES_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch certificates",
    });
  }
};

// Lấy danh sách certificate của user cụ thể
export const getCertificatesByUserAction = (userId) => async (dispatch) => {
  dispatch({ type: GET_CERTIFICATES_BY_USER_REQUEST });
  try {
    const { data } = await api.get(`/certificate/user/${userId}`);
    console.log("Get Certificates By User Success:", data);
    dispatch({ type: GET_CERTIFICATES_BY_USER_SUCCESS, payload: data.data });
  } catch (error) {
    console.log("Get Certificates By User Failure:", error);
    dispatch({
      type: GET_CERTIFICATES_BY_USER_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch certificates",
    });
  }
};

export const clearCertificateError = () => (dispatch) =>
  dispatch({ type: "CLEAR_CERTIFICATE_ERROR" });

export const clearCertificateMessage = () => (dispatch) =>
  dispatch({ type: "CLEAR_CERTIFICATE_MESSAGE" });

