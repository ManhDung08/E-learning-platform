import api from "../api";
import { 
    LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
    REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
    GET_PROFILE_REQUEST, GET_PROFILE_SUCCESS, GET_PROFILE_FAILURE,
    UPDATE_PROFILE_REQUEST, UPDATE_PROFILE_SUCCESS, UPDATE_PROFILE_FAILURE,
    UPLOAD_AVATAR_REQUEST, UPLOAD_AVATAR_SUCCESS, UPLOAD_AVATAR_FAILURE,
    DELETE_AVATAR_REQUEST, DELETE_AVATAR_SUCCESS, DELETE_AVATAR_FAILURE,
    CHANGE_PASSWORD_REQUEST, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAILURE,
    SET_PASSWORD_REQUEST, SET_PASSWORD_SUCCESS, SET_PASSWORD_FAILURE,
    VERIFY_EMAIL_REQUEST, VERIFY_EMAIL_SUCCESS, VERIFY_EMAIL_FAILURE,
    RESEND_VERIFICATION_REQUEST, RESEND_VERIFICATION_SUCCESS, RESEND_VERIFICATION_FAILURE,
    FORGOT_PASSWORD_REQUEST, FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAILURE,
    RESET_PASSWORD_REQUEST, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAILURE,
    LOG_OUT, CLEAR_ERROR
} from "./auth.actionType";

export const loginUserAction = (loginData) => async (dispatch) => {
    console.log("Starting login action...", loginData);
    dispatch({ type: LOGIN_REQUEST });

    try {
        const identifier = loginData.usernameOrEmail?.trim();

        if (!identifier) {
            throw new Error("email or usename is required");
        }

        const payload = {
            username: identifier,
            password: loginData.password
        };

        console.log("Sending login payload:", {
            username: identifier,
            password: "***hidden***"
        });

        const { data } = await api.post('/auth/login', payload);

        console.log("Login success", data);

        dispatch({
            type: LOGIN_SUCCESS,
            payload: data
        });

        dispatch(getProfileAction());

    } catch (error) {
        console.log("Login failure");

        let errorMessage = "login failed, try again";

        if (error.response) {
            console.log("Error:", error.response.data);
            errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }

        dispatch({
            type: LOGIN_FAILURE,
            payload: { message: errorMessage }
        });
    }
};

export const registerUserAction = (registerData) => async (dispatch) => {
    dispatch({ type: REGISTER_REQUEST });
    
    try {
        
        const { data } = await api.post('/auth/signup', {
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
            role: registerData.role || "student",
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            gender: registerData.gender,
            dateOfBirth: registerData.dateOfBirth,
            phoneNumber: registerData.phoneNumber
        });

        console.log("Register success:", data);
        
        dispatch({
            type: REGISTER_SUCCESS,
            payload: data
        });

        dispatch(getProfileAction());

    } catch (error) {
        console.log("Register failure:", error);
        dispatch({
            type: REGISTER_FAILURE,
            payload: error || { message: "Register failed" }
        });
    }
};

//chưa chạy??
export const getProfileAction = () => async (dispatch) => {
    dispatch({ type: GET_PROFILE_REQUEST });
    
    try {
        const { data } = await api.get('/users/me');
        
        console.log("Get profile success:", data);
        dispatch({type: GET_PROFILE_SUCCESS, payload: data.data})
    } catch (error) {
        console.log("Get profile failure:", error);
        dispatch({
            type: GET_PROFILE_FAILURE,
            payload: error || { message: "Failed to get profile" }
        })
    } 
};

export const updateProfileAction = (reqData) => async (dispatch) => {
    console.log("Starting update profile action...", reqData);
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    
    try {
        const {data} = await api.put('/users/update-profile', reqData);

        console.log("Update profile success:", data);
        dispatch({type: UPDATE_PROFILE_SUCCESS, payload: data});
    } catch (error) {
        console.log("Update profile failure:", error);
        dispatch({
            type: UPDATE_PROFILE_FAILURE,
            payload: error || { message: "Failed to update profile" }
        });
    }
};

export const uploadAvatarAction = (file) => async (dispatch) => {
    dispatch({type: UPLOAD_AVATAR_REQUEST});
    
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const { data } = await api.post('/users/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log("Upload avatar success:", data);
        dispatch({
            type: UPLOAD_AVATAR_SUCCESS,
            payload: data
        });
        dispatch(getProfileAction());
    } catch (error) {
        console.log("Upload avatar failure:", error);
        dispatch({
            type: UPLOAD_AVATAR_FAILURE,
            payload: error || {message: 'failed to upload avatar'}
        });
    }
};

export const deleteAvatarAction = () => async (dispatch) => {
    dispatch({type: DELETE_AVATAR_REQUEST});
    
    try {
        const {data} = await api.delete('/users/delete-avatar');

        console.log("Delete avatar success:", data);
        dispatch({
            type: DELETE_AVATAR_SUCCESS,
            payload: data
        });

        dispatch(getProfileAction());
    } catch (error) {
        console.log("Delete avatar failure:", error);
        dispatch({
            type: DELETE_AVATAR_FAILURE,
            payload: error || {message: "Failed to delete avatar"}
        });
    }
};

export const changePasswordAction = (currentPassword, newPassword) => async (dispatch) => {
    dispatch({type: CHANGE_PASSWORD_REQUEST});

    try {
        const {data} = await api.put('/users/change-password', {
            currentPassword,
            newPassword
        });

        console.log("Change password success:", data);
        dispatch({
            type: CHANGE_PASSWORD_SUCCESS,
            payload: data
        });
    } catch (error) {
        console.log("Change password failure:", error);
        dispatch({
            type: CHANGE_PASSWORD_FAILURE,
            payload: error || {message: "failed to change password"}
        });
    }
};

export const setPasswordAction = (newPassword) => async (dispatch) => {
    dispatch({type: SET_PASSWORD_REQUEST});
    
    try {
        const {data} = await api.put('/users/set-password', {
            newPassword
        });

        console.log("Set password success:", data);
        dispatch({
            type: SET_PASSWORD_SUCCESS,
            payload: data
        });
    } catch (error) {
        console.log("Set password failure:", error);
        dispatch({
            type: SET_PASSWORD_FAILURE,
            payload: error || {message: "failed to set password"}
        });
    }
};

export const verifyEmailAction = (token) => async (dispatch) => {
    dispatch({type: VERIFY_EMAIL_REQUEST});
    
    try {
        const {data} = await api.get(`/auth/verify-email?token=${token}`);

        console.log("Verify email success:", data);
        dispatch({
            type: VERIFY_EMAIL_SUCCESS,
            payload: data
        });
        
        dispatch(getProfileAction());
    } catch (error) {
        console.log("Verify email failure:", error);
        dispatch({
            type: VERIFY_EMAIL_FAILURE,
            payload: error || {message: "Email verification failed"}
        });
    }
};

export const resendVerificationAction = (email) => async (dispatch) => {
    dispatch({type: RESEND_VERIFICATION_REQUEST});
    
    try {
        const {data} = await api.post('/auth/resend-verification', {email});

        console.log("Resend verification success:", data);
        dispatch({
            type: RESEND_VERIFICATION_SUCCESS,
            payload: data
        });
    } catch (error) {
        console.log("Resend verification failure:", error);
        dispatch({
            type: RESEND_VERIFICATION_FAILURE,
            payload: error || {message: "failed to resend verification"}
        });
    }
};

export const forgotPasswordAction = (email) => async (dispatch) => {
    dispatch({type: FORGOT_PASSWORD_REQUEST});
    
    try {
        const {data} = await api.post('/auth/forgot-password', { email });
        
        console.log("Forgot password success:", data);
        dispatch({
            type: FORGOT_PASSWORD_SUCCESS,
            payload: data
        });
    } catch (error) {
        console.log("Forgot password failure:", error);
        dispatch({
            type: FORGOT_PASSWORD_FAILURE,
            payload: error || {message: "failed to send reset link"}
        });
    }
};

export const resetPasswordAction = (token, newPassword) => async (dispatch) => {
    dispatch({type: RESET_PASSWORD_REQUEST});
    
    try {
        const {data} = await api.post('/auth/reset-password', {
            token,
            newPassword
        });

        console.log("Reset password success:", data);
        dispatch({
            type: RESET_PASSWORD_SUCCESS,
            payload: data
        });
    } catch (error) {
        console.log("Reset password failure:", error);
        dispatch({
            type: RESET_PASSWORD_FAILURE,
            payload: error || {message: "failed to reset password"}
        });
    }
};

export const logoutUserAction = () => async (dispatch) => {
    
    try {
        await api.post('/auth/logout');
        console.log("Logout success");
    } catch (error) {
        console.log("Logout error:", error);
    } finally {
        dispatch({type: LOG_OUT});
        console.log("Logout action dispatched");
    }
};

export const clearErrorAction = () => (dispatch) => {
    dispatch({type: CLEAR_ERROR});
};
