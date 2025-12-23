import React from "react";

import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import AccountProfile from "../pages/AccountProfile";
import Videos from "../pages/Videos";
import CourseDetailPage from "../pages/CourseDetail/CourseDetail";
import PaymentResultPage from "../pages/PaymentResult";

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



        </Routes>
    );
}

export default AppRoutes;