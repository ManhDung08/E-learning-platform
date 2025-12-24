import {
    GET_OVERVIEW_STATS_REQUEST, GET_OVERVIEW_STATS_SUCCESS, GET_OVERVIEW_STATS_FAILURE,
    GET_REVENUE_STATS_REQUEST, GET_REVENUE_STATS_SUCCESS, GET_REVENUE_STATS_FAILURE,
    GET_USER_STATS_REQUEST, GET_USER_STATS_SUCCESS, GET_USER_STATS_FAILURE,
    GET_COURSE_STATS_REQUEST, GET_COURSE_STATS_SUCCESS, GET_COURSE_STATS_FAILURE,
    GET_GROWTH_TRENDS_REQUEST, GET_GROWTH_TRENDS_SUCCESS, GET_GROWTH_TRENDS_FAILURE
} from "./Statistic.actionType";

const initialState = {
    loading: false,
    error: null,
    overview: null,
    revenueStats: null,
    userStats: null,
    courseStats: null,
    growthTrends: null
};

export const statisticReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_OVERVIEW_STATS_REQUEST:
        case GET_REVENUE_STATS_REQUEST:
        case GET_USER_STATS_REQUEST:
        case GET_COURSE_STATS_REQUEST:
        case GET_GROWTH_TRENDS_REQUEST:
            return { ...state, loading: true, error: null };

        case GET_OVERVIEW_STATS_SUCCESS:
            return { ...state, loading: false, overview: action.payload };
        
        case GET_REVENUE_STATS_SUCCESS:
            return { ...state, loading: false, revenueStats: action.payload };

        case GET_USER_STATS_SUCCESS:
            return { ...state, loading: false, userStats: action.payload };

        case GET_COURSE_STATS_SUCCESS:
            return { ...state, loading: false, courseStats: action.payload };

        case GET_GROWTH_TRENDS_SUCCESS:
            return { ...state, loading: false, growthTrends: action.payload };

        case GET_OVERVIEW_STATS_FAILURE:
        case GET_REVENUE_STATS_FAILURE:
        case GET_USER_STATS_FAILURE:
        case GET_COURSE_STATS_FAILURE:
        case GET_GROWTH_TRENDS_FAILURE:
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};