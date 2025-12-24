import api from "../api"; 
import {
    GET_OVERVIEW_STATS_REQUEST, GET_OVERVIEW_STATS_SUCCESS, GET_OVERVIEW_STATS_FAILURE,
    GET_REVENUE_STATS_REQUEST, GET_REVENUE_STATS_SUCCESS, GET_REVENUE_STATS_FAILURE,
    GET_USER_STATS_REQUEST, GET_USER_STATS_SUCCESS, GET_USER_STATS_FAILURE,
    GET_COURSE_STATS_REQUEST, GET_COURSE_STATS_SUCCESS, GET_COURSE_STATS_FAILURE,
    GET_GROWTH_TRENDS_REQUEST, GET_GROWTH_TRENDS_SUCCESS, GET_GROWTH_TRENDS_FAILURE
} from "./Statistic.actionType";

const getErrorMessage = (error) => {
    return error.response?.data?.message || error.message || "Something went wrong";
};

export const getOverviewStatsAction = () => async (dispatch) => {
    dispatch({ type: GET_OVERVIEW_STATS_REQUEST });
    try {
        const { data } = await api.get('/statistic/overview');
        dispatch({ type: GET_OVERVIEW_STATS_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Fetch overview error:", error.response?.data || error.message);
        dispatch({ type: GET_OVERVIEW_STATS_FAILURE, payload: getErrorMessage(error) });
    }
};

export const getRevenueStatsAction = (filters = {}) => async (dispatch) => {
    dispatch({ type: GET_REVENUE_STATS_REQUEST });
    try {
        const { data } = await api.get('/statistic/revenue', { params: filters });
        dispatch({ type: GET_REVENUE_STATS_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Fetch revenue stats error:", error.response?.data || error.message);
        dispatch({ type: GET_REVENUE_STATS_FAILURE, payload: getErrorMessage(error) });
    }
};

export const getUserStatsAction = (filters = {}) => async (dispatch) => {
    dispatch({ type: GET_USER_STATS_REQUEST });
    try {
        const { data } = await api.get('/statistic/users', { params: filters });
        dispatch({ type: GET_USER_STATS_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Fetch user stats error:", error.response?.data || error.message);
        dispatch({ type: GET_USER_STATS_FAILURE, payload: getErrorMessage(error) });
    }
};

export const getCourseStatsAction = (filters = {}) => async (dispatch) => {
    dispatch({ type: GET_COURSE_STATS_REQUEST });
    try {
        const { data } = await api.get('/statistic/courses', { params: filters });
        dispatch({ type: GET_COURSE_STATS_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Fetch course stats error:", error.response?.data || error.message);
        dispatch({ type: GET_COURSE_STATS_FAILURE, payload: getErrorMessage(error) });
    }
};

export const getGrowthTrendsAction = (period = 'monthly', limit = 12) => async (dispatch) => {
    dispatch({ type: GET_GROWTH_TRENDS_REQUEST });
    try {
        const { data } = await api.get('/statistic/growth-trends', { 
            params: { period, limit } 
        });
        dispatch({ type: GET_GROWTH_TRENDS_SUCCESS, payload: data.data });
    } catch (error) {
        console.error("Fetch growth trends error:", error.response?.data || error.message);
        dispatch({ type: GET_GROWTH_TRENDS_FAILURE, payload: getErrorMessage(error) });
    }
};