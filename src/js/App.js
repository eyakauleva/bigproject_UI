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
    const [cookies] = useCookies(["token"]);
    document.cookie = "url=" + window.location.pathname + "; path=/";
    if(isUserLoggedIn(cookies.token)) return children;
    else{         
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "project=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "employeeId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        
        return <Navigate to={redirectPath} replace />;
    }
};

const GoToLogin = ({ children }) => {
    const [cookies] = useCookies(["token", "url"]);
    if(isUserLoggedIn(cookies.token))
        return <Navigate to={cookies.url} replace />;
    else return children;
};

function App(){    
    const navigate = useNavigate();
    const [cookies] = useCookies(["token"]);    

    return(
        <Routes>
            <Route path="/*" element={<Navigate to={isUserLoggedIn(cookies.token) ? "/app/*" : "/login"} />} />

            <Route path="/login" 
                element={
                    <GoToLogin>
                        <Authorization navigate={navigate}  />
                    </GoToLogin>
                }/>
                
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
