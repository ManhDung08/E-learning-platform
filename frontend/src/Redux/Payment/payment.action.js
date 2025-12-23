import api from "../api";
import {
    GET_ALL_PAYMENTS_REQUEST, GET_ALL_PAYMENTS_SUCCESS, GET_ALL_PAYMENTS_FAILURE,
    GET_PAYMENT_STATS_REQUEST, GET_PAYMENT_STATS_SUCCESS, GET_PAYMENT_STATS_FAILURE,
    GET_PAYMENT_DETAIL_REQUEST, GET_PAYMENT_DETAIL_SUCCESS, GET_PAYMENT_DETAIL_FAILURE,
    GET_USER_PAYMENT_HISTORY_REQUEST, GET_USER_PAYMENT_HISTORY_SUCCESS, GET_USER_PAYMENT_HISTORY_FAILURE
} from "./payment.actionType";

export const getAllPaymentsAction = (page = 1, limit = 10, filters = {}) => async (dispatch) => {
    dispatch({ type: GET_ALL_PAYMENTS_REQUEST });
    try {
        let queryString = `page=${page}&limit=${limit}`;
        
        if (filters.status) queryString += `&status=${filters.status}`;
        if (filters.provider) queryString += `&provider=${filters.provider}`;
        if (filters.userId) queryString += `&userId=${filters.userId}`;
        if (filters.courseId) queryString += `&courseId=${filters.courseId}`;

        const { data } = await api.get(`/payment?${queryString}`);
        
        dispatch({ 
            type: GET_ALL_PAYMENTS_SUCCESS, 
            payload: data.data
        });

        console.log("debug", data.data);

    } catch (error) {
        dispatch({ 
            type: GET_ALL_PAYMENTS_FAILURE, 
            payload: error.response?.data?.message || error.message 
        });
    }
};

export const getPaymentStatsAction = () => async (dispatch) => {
    dispatch({ type: GET_PAYMENT_STATS_REQUEST });
    try {
        const { data } = await api.get('/payment/stats');
        dispatch({ 
            type: GET_PAYMENT_STATS_SUCCESS, 
            payload: data.data 
        });

        console.log("debug", data.data);

    } catch (error) {
        dispatch({ 
            type: GET_PAYMENT_STATS_FAILURE, 
            payload: error.response?.data?.message || error.message 
        });
    }
};

export const getPaymentDetailAction = (paymentId) => async (dispatch) => {
    dispatch({ type: GET_PAYMENT_DETAIL_REQUEST });
    try {
        const { data } = await api.get(`/payment/${paymentId}`);
        dispatch({ 
            type: GET_PAYMENT_DETAIL_SUCCESS, 
            payload: data.data 
        });

        console.log("debug", data.data);

    } catch (error) {
        dispatch({ 
            type: GET_PAYMENT_DETAIL_FAILURE, 
            payload: error.response?.data?.message || error.message 
        });
    }
};

export const getUserPaymentHistoryAction = (userId, page = 1, limit = 10) => async (dispatch) => {
    dispatch({ type: GET_USER_PAYMENT_HISTORY_REQUEST });
    try {
        const { data } = await api.get(`/payment/history/${userId}?page=${page}&limit=${limit}`);
        dispatch({ 
            type: GET_USER_PAYMENT_HISTORY_SUCCESS, 
            payload: data.data 
        });

        console.log("debug", data.data);

    } catch (error) {
        dispatch({ 
            type: GET_USER_PAYMENT_HISTORY_FAILURE, 
            payload: error.response?.data?.message || error.message 
        });
    }
};