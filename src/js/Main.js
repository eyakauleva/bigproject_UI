import React from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Profile from './Profile';

import '.././css/Main.css';

function Main(props){
    const navigate = useNavigate();

    return(
        <div className="main">
            <Sidebar />
            <Routes>
                <Route path="*" element={<Navigate to="profile" />} />
                <Route path="profile" element={<Profile navigate={navigate}  /> } />
            </Routes> 
        </div>               
    );
}

export default Main;
