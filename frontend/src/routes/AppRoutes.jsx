import React from "react";

import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import AccountProfile from "../pages/AccountProfile";
import Videos from "../pages/Videos";


function AppRoutes() {




    return (
        <Routes>


            <Route path='/*' element={<HomePage />}></Route>


            <Route path='/profile' element={<AccountProfile />}></Route>
            <Route path='/videos' element={<Videos />}></Route>


        </Routes>
    );
}

export default AppRoutes;