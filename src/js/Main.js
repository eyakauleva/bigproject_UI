import React from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Profile from './Profile';
import Dashboard from './dashboard/Dashboard';
import SingleTask from './dashboard/SingleTask';
import Projects from './Projects';
import Users from './Users';
import ProjectPage from './ProjectPage';

import '.././css/Main.css';

function Main(props){
    const navigate = useNavigate();

    return(
        <div className="main">
            <Sidebar navigate={navigate} />
            <Routes>
                <Route path="/*" element={<Navigate to="profile/1" />} /> {/* TODO set user id dynamically*/}
                <Route path="profile/:id" element={<Profile navigate={navigate}  /> } />
                <Route path="dashboard/:id" element={<Dashboard navigate={navigate}  /> } />
                <Route exact path="ticket/:id" element={<SingleTask navigate={navigate}  /> } />
                <Route path="projects" element={<Projects navigate={navigate}  /> } />
                <Route path="users" element={<Users navigate={navigate}  /> } />
                <Route path="project/:id" element={<ProjectPage navigate={navigate}  /> } />
            </Routes> 
        </div>               
    );
}

export default Main;
