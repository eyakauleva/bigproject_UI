import React from "react";
import { Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";

import Authorization from './Authorization';
import Main from './Main';
import 'bootstrap/dist/css/bootstrap.min.css';

const isUserLoggedIn = (token) => {  
    if (token==undefined) {
        return false;
    } else{
        let decodedToken = jwt_decode(token);
        if (decodedToken.exp < new Date().getTime()){
            //console.log(window.location.pathname); //put in cookie and after login navidate to it
            return false;
        }            
        else return true;
    }    
};

const ProtectedRoute = ({ redirectPath = '/login', children }) => {
    const [cookies, setCookie] = useCookies(["token"]);
    if(isUserLoggedIn(cookies.token)) return children;
    else return <Navigate to={redirectPath} replace />;
};

function App(){
    
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(["token"]);    

    return(
        <Routes>
            {/* <Route path="/*" element={<Navigate to={isUserLoggedIn(cookies.token) ? "/app/*" : "/login"} />} /> */}
            <Route path="/*" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Authorization navigate={navigate}  /> } />
            {/* <Route path="/app/*"
                element={
                    <ProtectedRoute>
                        <Main navigate={navigate}  /> 
                    </ProtectedRoute>
                }
                /> */}
            <Route path="/app/*" element={<Main navigate={navigate}  /> } />
        </Routes>        
    );
}

export default App;
