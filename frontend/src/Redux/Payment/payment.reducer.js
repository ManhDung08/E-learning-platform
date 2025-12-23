import {
    GET_ALL_PAYMENTS_REQUEST, GET_ALL_PAYMENTS_SUCCESS, GET_ALL_PAYMENTS_FAILURE,
    GET_PAYMENT_STATS_REQUEST, GET_PAYMENT_STATS_SUCCESS, GET_PAYMENT_STATS_FAILURE,
    GET_PAYMENT_DETAIL_REQUEST, GET_PAYMENT_DETAIL_SUCCESS, GET_PAYMENT_DETAIL_FAILURE,
    GET_USER_PAYMENT_HISTORY_REQUEST, GET_USER_PAYMENT_HISTORY_SUCCESS, GET_USER_PAYMENT_HISTORY_FAILURE,
    CLEAR_PAYMENT_ERROR
} from "./payment.actionType";

const initialState = {
    loading: false,
    error: null,
    payments: [], 
    pagination: {},
    
    stats: {
        totalRevenue: 0,
        totalPayments: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        successRate: 0,
        recentPayments: []
    },

    currentPayment: null,
    userHistory: [],
    userHistoryPagination: {} 
};

export const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_PAYMENTS_REQUEST:
        case GET_PAYMENT_STATS_REQUEST:
        case GET_PAYMENT_DETAIL_REQUEST:
        case GET_USER_PAYMENT_HISTORY_REQUEST:
            return { 
                ...state, 
                loading: true, 
                error: null 
            };


        case GET_ALL_PAYMENTS_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: action.payload.payments,
                pagination: action.payload.pagination
            };

        case GET_PAYMENT_STATS_SUCCESS:
            return {
                ...state,
                loading: false,
                stats: action.payload
            };

        case GET_PAYMENT_DETAIL_SUCCESS:
            return {
                ...state,
                loading: false,
                currentPayment: action.payload
            };

        case GET_USER_PAYMENT_HISTORY_SUCCESS:
            return {
                ...state,
                loading: false,
                userHistory: action.payload.payments,
                userHistoryPagination: action.payload.pagination
            };

        case GET_ALL_PAYMENTS_FAILURE:
        case GET_PAYMENT_STATS_FAILURE:
        case GET_PAYMENT_DETAIL_FAILURE:
        case GET_USER_PAYMENT_HISTORY_FAILURE:
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };

        case CLEAR_PAYMENT_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};