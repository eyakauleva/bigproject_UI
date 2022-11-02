import React from "react";
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";

import '.././css/Sidebar.css';

function Sidebar(props){
    const [cookies, removeCookie] = useCookies(["token"]);

    const goToProfile = () => {
        // let decodedToken = jwt_decode(cookies.token);
        // props.navigate('profile/' + decodedToken.sub);
        props.navigate('profile/1'); 
    }

    const goToDashboard = () => {
        // let decodedToken = jwt_decode(cookies.token);
        // props.navigate('profile/' + decodedToken.sub);
        props.navigate('dashboard/1');
    }

    const logout = () => {
        removeCookie("token");        
        props.navigate('/login'); 
    }

    return(
        <div className="sidenav">
            <a onClick={goToProfile}>
                <i className="bi bi-person"></i>
                <span>Profile</span>
            </a>
            <a href="">
                <i className="bi bi-search"></i>
                <span>Search...</span>
            </a>
            <a onClick={goToDashboard}>
            <i className="bi bi-check2-square"></i>
                <span>Tickets</span>
            </a>
            <a href="/app/projects">
                <i className="bi bi-list"></i>    
                <span>Projects</span>
            </a> 
            <hr/>
            <a onClick={logout}>
                <i className="bi bi-box-arrow-left"></i>
                <span>Logout</span>  
            </a>
        </div>               
    );
}

export default Sidebar;
