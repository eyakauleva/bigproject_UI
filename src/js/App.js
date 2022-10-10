import React from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Authorization from './Authorization';
import Main from './Main';
import 'bootstrap/dist/css/bootstrap.min.css';


function App(){
    
    const navigate = useNavigate();

    return(
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Authorization navigate={navigate}  /> } />
            <Route path="/app/*" element={<Main navigate={navigate}  /> } />
        </Routes>        
    );
}

export default App;
