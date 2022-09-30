import React from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';

import Dashboard from './dashboard/Dashboard';
import Authorization from './Authorization';

function App(){
    const navigate = useNavigate();

    return(
        <Routes>
            <Route path="/login" element={<Authorization navigate={navigate}  /> } />
        </Routes>        
    );
}

export default App;
