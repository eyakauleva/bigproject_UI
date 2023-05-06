import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Profile from './Profile';
import Dashboard from './dashboard/Dashboard';
import SingleTask from './single_task/SingleTask';
import Projects from './project/Projects';
import Orders from './Orders';
import Users from './Users';
import ProjectPage from './project/ProjectPage';
import CreateProject from './project/CreateProject';
import Statistics from './statistics/Statistics';
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

    const getCookieByKey = (key) => {
        return document.cookie
                        .split("; ")
                        .find((row) => row.startsWith(key + "="))
                        ?.split("=")[1];
    }

    const listenCookieChange = (callback, interval = 1000) => {
        let lastCookie = getCookieByKey("project");
        setInterval(()=> {
            let cookie = getCookieByKey("project");
            if (cookie !== lastCookie) {
                try {
                    callback();
                } finally {
                    lastCookie = cookie;
                }
            }
        }, interval);
    }

    const handleAuthExpiration = () => {
        setInterval(()=> {
            let isExpired = getCookieByKey("expired");
            if (isExpired && isExpired === "true") {
                document.cookie = "expired=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                document.cookie = "project=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                document.cookie = "employeeId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                alert('Authorization is required');
                navigate('/login'); 
            }
        }, 1000);
    }

    return(
        <div className="main">
            {handleAuthExpiration()}
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
            </Routes> 
        </div>               
    );
}
