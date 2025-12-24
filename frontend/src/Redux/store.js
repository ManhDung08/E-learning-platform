import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/auth.reducer";
import { adminReducer } from "./Admin/admin.reducer";
import { courseReducer } from "./Course/course.reducer"
import { quizReducer } from "./Quiz/quiz.reducer";
import { instructorReducer } from "./Instructor/instructor.reducer";
import { notificationReducer } from "./Notification/notification.reducer";
import { paymentReducer } from "./Payment/payment.reducer";
import { statisticReducer } from "./Statistic/statistic.reducer";

const rootReducers = combineReducers({
    auth: authReducer,
    admin: adminReducer,
    course: courseReducer,
    quiz: quizReducer,
    instructor: instructorReducer,
    notification: notificationReducer,
    payment: paymentReducer,
    statistic: statisticReducer,
});

export const store = legacy_createStore(rootReducers, applyMiddleware(thunk));