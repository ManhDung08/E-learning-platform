import React from "react";

import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import AccountProfile from "../pages/AccountProfile";
import Videos from "../pages/Videos";
import CourseDetailPage from "../pages/CourseDetail/CourseDetail";
import PaymentResultPage from "../pages/PaymentResult";
import ForgotPassword from "../components/auth/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword";
import Certificate from "../components/Certificate";

function AppRoutes() {

   


    return (
        <Routes>



            

            <Route path='/home' element={<HomePage />}></Route>
            {/* <Route path='/course/learn/:courseId' element={<Videos />}></Route> */}
            <Route path='/profile' element={<AccountProfile />}></Route>
            <Route path="/course/:courseId/checkout" element={<CourseDetailPage />} />
            <Route path="/course/:slug" element={<CourseDetailPage />} />

            <Route path="/payment/result" element={<PaymentResultPage />} />
            <Route path='/*' element={<HomePage />}></Route>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/certificate" element={<Certificate />} />


        </Routes>
    );
}

export default AppRoutes;