import React from "react";

import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import AccountProfile from "../pages/AccountProfile";
import CourseDetailPage from "../pages/CourseDetail/CourseDetail";

function AppRoutes() {

   


    return (
        <Routes>


            <Route path='/*' element={<HomePage />}></Route>
            <Route path='/home' element={<HomePage />}></Route>


            <Route path='/profile' element={<AccountProfile />}></Route>
            <Route path="/course/:courseId/checkout" element={<CourseDetailPage />} />


        </Routes>
    );
}

export default AppRoutes;