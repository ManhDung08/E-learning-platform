import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/auth.reducer";
import { adminReducer } from "./Admin/admin.reducer";
import { courseReducer } from "./Course/course.reducer"

const rootReducers = combineReducers({
    auth: authReducer,
    admin: adminReducer,
    course: courseReducer,
});

export const store = legacy_createStore(rootReducers, applyMiddleware(thunk));