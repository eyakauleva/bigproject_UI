import React from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Profile from './Profile';
import Dashboard from './dashboard/Dashboard';

import '.././css/Main.css';

function Main(props){
    const navigate = useNavigate();

    return(
        <div className="main">
            <Sidebar navigate={navigate} />
            <Routes>
                <Route path="/*" element={<Navigate to="profile" />} />
                <Route path="profile" element={<Profile navigate={navigate}  /> } />
                <Route path="qqq" element={<Dashboard navigate={navigate}  /> } />
            </Routes> 
        </div>               
    );
}

export default Main;
