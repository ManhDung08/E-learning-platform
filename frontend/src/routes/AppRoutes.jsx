import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AccountProfile from "../pages/AccountProfile";

function AppRoutes() {

   


    return (
        <Routes>
            <Route path='/' element={<HomePage />}></Route>
            <Route path='/home' element={<HomePage />}></Route>

            <Route path='/profile' element={<AccountProfile  />}></Route>

        </Routes>
    );
}

export default AppRoutes;