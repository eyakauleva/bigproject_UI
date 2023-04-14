import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Profile from './Profile';
import Dashboard from './dashboard/Dashboard';
import SingleTask from './single_task/SingleTask';
import Projects from './Projects';
import Orders from './Orders';
import Users from './Users';
import ProjectPage from './ProjectPage';
import CreateProject from './CreateProject';
import CreateTask from './dashboard/CreateTask';
import Statistics from './Statistics';
import jwt_decode from "jwt-decode";

const OnlyManagerAdminRoute = ({ redirectPath = '/', children }) => {
    const [cookies] = useCookies(["token"]);
    let decodedToken = jwt_decode(cookies.token);
    if(decodedToken.role==="ROLE_MANAGER" || decodedToken.role==="ROLE_ADMIN") return children;
    else return <Navigate to={redirectPath} replace />;
};

export default function Main(){
    const navigate = useNavigate();
    const[cookies] = useCookies(["token", "employeeId"]);
    const[decodedToken, setDecodedToken] = useState({});

    useLayoutEffect(() => {        
        setDecodedToken(jwt_decode(cookies.token));
    }, []);

    const getCookieCurrentProjectId = () => {
        return document.cookie
                        .split("; ")
                        .find((row) => row.startsWith("project="))
                        ?.split("=")[1];
    }

    const listenCookieChange = (callback, interval = 1000) => {
        let lastCookie = getCookieCurrentProjectId();
        setInterval(()=> {
            let cookie = getCookieCurrentProjectId();
            if (cookie !== lastCookie) {
                try {
                    callback();
                } finally {
                    lastCookie = cookie;
                }
            }
        }, interval);
    }

    return(
        <div className="main">
            <Sidebar navigate={navigate} />
            <Routes>                  
                <Route path="/*" element={<Navigate to={decodedToken.role!=="ROLE_CUSTOMER" 
                                                        ? "profile/" +  cookies.employeeId
                                                        : "dashboard"} />} />
                <Route path="profile/:id" element={<Profile navigate={navigate}  /> } />
                {
                    cookies.project!==undefined
                    ?<Route path="dashboard" element={<Dashboard navigate={navigate} listenCookieChange={listenCookieChange}  /> } />
                    : ''
                }
                <Route exact path="ticket/:id" element={<SingleTask navigate={navigate}  /> } />                
                <Route path="projects" element={<Projects navigate={navigate}  /> } />                
                <Route path="users" element={<Users navigate={navigate}  /> } />
                <Route path="project/:id" element={<ProjectPage navigate={navigate} /> } />
                <Route path="statistics" element={<Statistics navigate={navigate}  /> } />

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
                    ? <Route path="ticket_new" element={<CreateTask navigate={navigate} listenCookieChange={listenCookieChange}  /> } />
                    : ''
                }
            </Routes> 
        </div>               
    );
}
