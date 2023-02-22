import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Profile from './Profile';
import Dashboard from './dashboard/Dashboard';
import SingleTask from './dashboard/SingleTask';
import Projects from './Projects';
import Orders from './Orders';
import Users from './Users';
import ProjectPage from './ProjectPage';
import CreateProject from './CreateProject';
import CreateTask from './dashboard/CreateTask';
import jwt_decode from "jwt-decode";

const OnlyManagerAdminRoute = ({ redirectPath = '/', children }) => {
    const [cookies] = useCookies(["token"]);
    let decodedToken = jwt_decode(cookies.token);
    if(decodedToken.role==="ROLE_MANAGER" || decodedToken.role==="ROLE_ADMIN") return children;
    else return <Navigate to={redirectPath} replace />;
};

export default function Main(){
    const navigate = useNavigate();
    const[cookies] = useCookies(["token", "employeeId", "project"]);
    const[decodedToken, setDecodedToken] = useState({});

    useLayoutEffect(() => {        
        setDecodedToken(jwt_decode(cookies.token));
    }, []);

    return(
        <div className="main">
            <Sidebar navigate={navigate} />
            <Routes>                  
                <Route path="/*" element={<Navigate to={decodedToken.role!=="ROLE_CUSTOMER" 
                                                        ? "profile/" +  cookies.employeeId
                                                        : "dashboard/" + cookies.project} />} />
                <Route path="profile/:id" element={<Profile navigate={navigate}  /> } />
                {
                    cookies.project!==undefined
                    ?<Route path="dashboard/:id" element={<Dashboard navigate={navigate}  /> } />
                    : ''
                }
                <Route exact path="ticket/:id" element={<SingleTask navigate={navigate}  /> } />                
                <Route path="projects" element={<Projects navigate={navigate}  /> } />                
                <Route path="users" element={<Users navigate={navigate}  /> } />
                <Route path="project/:id" element={<ProjectPage navigate={navigate} /> } />

                <Route path="orders" element={
                    <OnlyManagerAdminRoute>
                        <Orders navigate={navigate} />
                    </OnlyManagerAdminRoute>
                }/>

                <Route path="orders/:id/create" element={
                    <OnlyManagerAdminRoute>
                        <CreateProject navigate={navigate} />
                    </OnlyManagerAdminRoute>
                }/>

                {
                    decodedToken.role!=="ROLE_CUSTOMER" && cookies.project!==undefined
                    ? <Route path="ticket_new" element={<CreateTask navigate={navigate}  /> } />
                    : ''
                }
            </Routes> 
        </div>               
    );
}
