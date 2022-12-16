import React from "react";
import { Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";

import Authorization from './Authorization';
import Main from './Main';
import 'bootstrap/dist/css/bootstrap.min.css';

const isUserLoggedIn = (token) => {  
    if (token==null || token==undefined || token ==="undefined" || token === '') {
        return false;
    } else{
        try{
            let decodedToken = jwt_decode(token);
            if (decodedToken.exp > new Date().getTime()) {
                return false;
            }
            else return true;
        } catch(error){
            return false;
        }        
    }    
};

const ProtectedRoute = ({ redirectPath = '/login', children }) => {
    const [cookies] = useCookies(["token", "url"]);
    if(isUserLoggedIn(cookies.token)) return children;
    else{
        document.cookie = "url=" + window.location.pathname + "; path=/"; 
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "projectId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "employeeId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        
        return <Navigate to={redirectPath} replace />;
    }
};

function App(){    
    const navigate = useNavigate();
    const [cookies] = useCookies(["token"]);    

    return(
        <Routes>
            <Route path="/*" element={<Navigate to={isUserLoggedIn(cookies.token) ? "/app/*" : "/login"} />} />
            <Route path="/login" element={<Authorization navigate={navigate}  /> } />
            <Route path="/app/*"
                element={
                    <ProtectedRoute>
                        <Main navigate={navigate}  /> 
                    </ProtectedRoute>
                }/>
        </Routes>        
    );
}

export default App;
