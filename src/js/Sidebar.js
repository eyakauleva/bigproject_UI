import React from "react";
import axios from "axios";
import { useState, useLayoutEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";
import Form from 'react-bootstrap/Form';

import ClientProfileModal, {clearErrorMessage, noEditMode} from './ClientProfileModal.js';
import ChangePasswordModal from './ChangePasswordModal';
import '.././css/Sidebar.css';

var logout;
export {logout}
function Sidebar(props){
    const[cookies] = useCookies(["token", "employeeId", "project"]);
    const[clientId, setClientId] = useState();
    const[showModal, setShowModal] = useState(false);
    const[showChangePasswordModal, setShowChangePasswordModal] = useState(true);
    const[decodedToken, setDecodedToken] = useState({});
    const[projects, setProjects] = useState([]);

    useLayoutEffect(() => {        
        setDecodedToken(jwt_decode(cookies.token));
        getCurrentProjects();
    }, []);

    const goToProfile = () => {
        let decodedToken = jwt_decode(cookies.token);
        setClientId(decodedToken.id);
        if(decodedToken.role==="ROLE_CUSTOMER")
            setShowModal(true);
        else props.navigate('profile/' + cookies.employeeId); 
    }

    const getCurrentProjects = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        let decodedToken = jwt_decode(cookies.token);

        axios
        .get("/employee/user/" + decodedToken.id, config)
        .then(response => response.data)
        .then((data) =>{
            if(data.currentProjects!=null){
                setProjects(data.currentProjects.sort((a, b) => a.id > b.id ? 1 : -1));
            }                  
        })
        .catch((error) => {               
            let code = error.toJSON().status;
            if(code===401){
                alert('Authorization is required');
            }
            else alert('Internal server error');
        });
    }

    const goToDashboard = () => {
        props.navigate('dashboard/' + cookies.project);
    }

    logout = () => {        
        document.cookie = "url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "project=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "employeeId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        
        props.navigate('/login'); 
    }

    return(    
        <div className="sidenav">
            {
                decodedToken.role!=="ROLE_CUSTOMER" && cookies.project!==undefined
                ? <div>
                    <div>
                        <Form.Select>                
                        {
                            projects.map(project => {
                                return <option value={project.id}>{project.name}</option>;
                            })
                        }
                        </Form.Select> 
                    </div>   
                    <div>
                        <a href='/app/ticket_new' id='new-ticket' className='action'>
                            <i className="bi bi-plus-square"></i>
                            <span>NEW TICKET</span>
                        </a><hr/>
                    </div>
                </div>
                : ''
            }
            <a onClick={goToProfile} className='action'>
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
            </a>
            <a href='/app/users' className='action'>
                <i className="bi bi-people"></i>
                <span>Employees</span>
            </a>
            {
                cookies.project!==undefined
                ? <a onClick={goToDashboard} className='action'>
                    <i className="bi bi-check2-square"></i>
                    <span>Tickets</span>
                </a>
                : ''
            }            
            <a href='/app/projects' className='action'>
                <i className="bi bi-list"></i>    
                <span>Projects</span>
            </a>
            {
                decodedToken.role==="ROLE_MANAGER" || decodedToken.role==="ROLE_ADMIN"
                ? <a href='/app/orders' className='action'>
                    <i className="bi bi-bookmarks"></i>    
                    <span>Orders</span>
                 </a>  
                : ''
            }            
            <hr/>
            <a onClick={logout} className='action'>
                <i className="bi bi-box-arrow-left"></i>
                <span>Logout</span>  
            </a>
            <ClientProfileModal show={showModal} onHide={()=>{setShowModal(false); clearErrorMessage(); noEditMode()}} 
                    id={clientId} setShowModal={()=>setShowModal(true)} />
            {
                decodedToken.status === 'DEACTIVATED' && decodedToken.role === 'ROLE_CUSTOMER'
                ? <ChangePasswordModal show={showChangePasswordModal} onHide={()=>setShowChangePasswordModal(false)} backdrop="static" navigate={props.navigate}/>
                : ''
            }
        </div>               
    );
}

export default Sidebar;
