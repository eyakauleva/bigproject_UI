import React from "react";
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";

import ClientProfileModal, {clearErrorMessage, noEditMode} from './ClientProfileModal.js';
import '.././css/Sidebar.css';

var logout;
export {logout}
function Sidebar(props){
    const[cookies] = useCookies(["token", "employeeId", "projectId"]);
    const[clientId, setClientId] = useState();
    const[showModal, setShowModal] = useState(false);
    const[decodedToken, setDecodedToken] = useState({});

    useEffect(() => {        
        setDecodedToken(jwt_decode(cookies.token))
    }, []);

    const goToProfile = () => {
        let decodedToken = jwt_decode(cookies.token);
        setClientId(decodedToken.id);
        if(decodedToken.role==="CUSTOMER")
            setShowModal(true);
        else props.navigate('profile/' + cookies.employeeId); 
    }

    const goToDashboard = () => {
        props.navigate('dashboard/' + cookies.projectId);
    }

    logout = () => {        
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "projectId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "employeeId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        
        props.navigate('/login'); 
    }

    return(    
        <div className="sidenav">
            {
                decodedToken.role!=="ROLE_CUSTOMER"
                ? <div>
                    <a href='/app/ticket_new' id='new-ticket'>
                        <i className="bi bi-plus-square"></i>
                        <span>NEW TICKET</span>
                    </a><hr/>
                 </div>
                : ''
            }
            <a onClick={goToProfile}>
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
            </a>
            <a href='/app/users'>
                <i className="bi bi-people"></i>
                <span>Users</span>
            </a>
            <a onClick={goToDashboard}>
                <i className="bi bi-check2-square"></i>
                <span>Tickets</span>
            </a>
            <a href='/app/projects'>
                <i className="bi bi-list"></i>    
                <span>Projects</span>
            </a>
            {
                decodedToken.role==="ROLE_MANAGER" || decodedToken.role==="ROLE_ADMIN"
                ? <a href='/app/orders'>
                    <i className="bi bi-bookmarks"></i>    
                    <span>Orders</span>
                 </a>  
                : ''
            }            
            <hr/>
            <a onClick={logout}>
                <i className="bi bi-box-arrow-left"></i>
                <span>Logout</span>  
            </a>
            <ClientProfileModal show={showModal} onHide={()=>{setShowModal(false); clearErrorMessage(); noEditMode()}} 
                    id={clientId} setShowModal={()=>setShowModal(true)} />
        </div>               
    );
}

export default Sidebar;
