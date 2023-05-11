import React from "react";
import axios from "axios";
import { useState, useLayoutEffect } from 'react';
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";
import Form from 'react-bootstrap/Form';

import ClientProfileModal, {clearErrorMessage, noEditMode} from './ClientProfileModal.js';
import ChangePasswordModal from './ChangePasswordModal.js';
import '.././css/Sidebar.css';
import CreateTask from './single_task/CreateTask.js';

var logout;
export {logout}
export default function Sidebar(props){
    const[cookies] = useCookies(["token", "employeeId", "project"]);
    const[clientId, setClientId] = useState();
    const[showModal, setShowModal] = useState(false);
    const[showChangePasswordModal, setShowChangePasswordModal] = useState(true);
    const[decodedToken, setDecodedToken] = useState({});
    const[projects, setProjects] = useState([]);
    const[showCTModal, setShowCTModal] = useState(false);

    useLayoutEffect(() => {        
        setDecodedToken(jwt_decode(cookies.token));
        getCurrentProjects();
    }, []);

    const goToProfile = () => {
        let decodedToken = jwt_decode(cookies.token);
        setClientId(decodedToken.id);
        if(decodedToken.role==="ROLE_CUSTOMER"){
            setShowModal(true);
        }
        else {
            props.navigate('profile/' + cookies.employeeId); 
        }
    }

    const getCurrentProjects = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        let decodedToken = jwt_decode(cookies.token);

        if(decodedToken.role!=="ROLE_CUSTOMER"){
            axios
            .get("/employee/user/" + decodedToken.id, config)
            .then(response => response.data)
            .then((data) =>{
                if(data.currentProjects!=null){
                    setProjects(data.currentProjects.sort((a, b) => a.id > b.id ? 1 : -1));
                }                  
            })
            .catch((error) => {               
                let code = error.status;
                if(code===401){
                    document.cookie = "expired=true; path=/";
                }
                else if(code!==undefined && code!==null) {
                    alert('Internal server error');
            }
            });

        } else {
            axios
            .get("/orders/" + decodedToken.id + "/project", config)
            .then(response => response.data)
            .then((data) =>{
              if(data){
                let projects = [];
                data.map(order => projects.push(order.project));
                setProjects(projects.sort((a, b) => a.id > b.id ? 1 : -1));
              } 
                            
            })
            .catch((error) => {               
                let code = error.status;
                if(code===401){
                    document.cookie = "expired=true; path=/";
                }
                else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
            });
        }
    }

    logout = () => {        
        document.cookie = "expired=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "project=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "employeeId=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        
        props.navigate('/login'); 
    }

    return(    
        <div className="sidenav">
            <div className="up-wrapper">
                <b>Current project:</b>
                <div style={{width:"85%"}}> 
                    <Form.Select onChange={e => document.cookie = "project=" + e.target.value + "; path=/"}>                
                    {
                        projects.map(project => {
                            let currentProjectId = document.cookie
                                    .split("; ")
                                    .find((row) => row.startsWith("project="))
                                    ?.split("=")[1];
                            if(currentProjectId != project.id)
                                return <option value={project.id}>{project.name}</option>;
                            else return <option selected value={project.id}>{project.name}</option>;
                        })
                    }
                    </Form.Select> 
                </div>
            </div><hr/>
            {
                decodedToken.role!=="ROLE_CUSTOMER" && cookies.project!==undefined
                ? <div>
                    <button onClick={() => setShowCTModal(true)} className='action'>
                        <i className="bi bi-plus-square"></i>
                        <b> NEW TICKET</b>
                    </button><hr/>
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
                ? <a href='/app/dashboard' className='action'>
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
            <a href='/app/statistics' className='action'>
                <i className="bi bi-graph-up-arrow"></i>    
                <span>Statistics</span>
            </a>            
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
            <CreateTask
                show={showCTModal} 
                onHide={()=>setShowCTModal(false)}
                close={setShowCTModal}
                navigate={props.navigate}
            />
        </div>               
    );
}
