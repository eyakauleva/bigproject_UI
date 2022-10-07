import React from "react";

import '.././css/Sidebar.css';

function Sidebar(props){
    return(
        <div className="sidenav">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#clients">Clients</a>
            <a href="#contact">Contact</a>
        </div>               
    );
}

export default Sidebar;
