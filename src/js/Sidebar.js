import React from "react";
import { useCookies } from 'react-cookie';

import '.././css/Sidebar.css';

function Sidebar(props){
    const [cookies, removeCookie] = useCookies(["token"]);

    const logout = () => {
        removeCookie("token");
        props.navigate('/login'); 
    }

    return(
        <div className="sidenav">
            <a href="">
                <i className="bi bi-person"></i>
                <span>Profile</span>
            </a>
            <a href="">
                <i className="bi bi-search"></i>
                <span>Search...</span>
            </a>
            <a href="">
            <i className="bi bi-check2-square"></i>
                <span>Tickets</span>
            </a>
            <a href="">
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