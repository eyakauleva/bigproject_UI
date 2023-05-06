import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "axios";
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import AddEmployeeModal from './AddEmployeeModal.js';
import '.././css/Users.css';

export default function Users(props) {
    const[cookies] = useCookies(["token"]);
    const[employees, setEmployees] = useState({});
    const[isList, setIsList] = useState(false);
    const[inputText, setInputText] = useState("");
    const[showModal, setShowModal] = useState(false);
    const[decodedToken, setDecodedToken] = useState({});
    const[error, setError] = useState("");

    useLayoutEffect(() => { 
        getEmployees();        
    }, []);
    
    const displayError = () => {
      if(error!=="")
      {
        alert(error);
        logout();
      }
    }
    const updateView = (employee) =>{
        var newState =  employees.map(emp => {
            if(emp.id == employee.id){
                emp.isFullList = !emp.isFullList;
                return emp;
            }
            return emp;
            
        });
        setEmployees(newState);
    }

    const getEmployees = async() => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };
        
        let url = "/employee/all";
        if(jwt_decode(cookies.token).role==="ROLE_ADMIN")
            url += "?showBlocked=true";

        await axios
        .get(url, config)
        .then(response => response.data)
        .then((data) =>{             
            if(data){
                data = data.sort((a,b) => a.user.surname > b.user.surname ? 1 : -1);
                setEmployees(data); 
                setDecodedToken(jwt_decode(cookies.token));                
            }                                   
        })
        .catch((error) => {
            let code = error.toJSON().status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);            
            else if(code===401){
                document.cookie = "expired=true; path=/";
            }
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null) 
                alert('Internal server error');
        });    
    };

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase().replaceAll(' ', '');
        setInputText(lowerCase);
    };

    const filteredEmployees =  Object.values(employees).filter((employee) =>{
        if(inputText === ''){
            return employee;
        } else {
            if(employee.user) 
                return employee.user.name.toLowerCase().startsWith(inputText)
                    || employee.user.surname.toLowerCase().startsWith(inputText)
                    || (employee.user.name + employee.user.surname).toLowerCase().startsWith(inputText)
                    || (employee.user.surname + employee.user.name).toLowerCase().startsWith(inputText); 
        }
        
    });

    const getIconClass = (employee) => {
        if(employee.user.status == 'BLOCKED') return "bi bi-slash-circle-fill star";
        else if(employee.currentProjects != null && employee.currentProjects.length > 0){
            
            return "bi bi-circle-fill circle";
        }
        else return "bi bi-circle circle";
    }

    return(
        <div className="users">
            {displayError()}
            <div className="container">
                <div className="well well-sm row" style={{fontFamily:"sans-serif"}}>
                    <strong className="col-md-1">Display:</strong>
                    <div className="btn-group col-md-4">
                       <a href="#" id="list" className="btn-custom btn-custom-default btn-sm" onClick={() => setIsList(true)}>
                           <IconContext.Provider
                                value={{ 
                                    className: "glyphicon glyphicon-th-list",
                                    size: '15px'
                                }}
                            >
                           <FaList/>
                           </IconContext.Provider>
                           List
                        </a> 
                        <a href="#" id="grid" className="btn-custom btn-custom-default btn-sm" onClick={() => setIsList(false)}>
                            <IconContext.Provider
                                value={{ 
                                    className: "glyphicon glyphicon-th",
                                    size: '15px'
                                }}
                            >
                           <FaTh/>
                           </IconContext.Provider>
                            Grid
                        </a>
                    </div>
                    <div className="col-md-3">
                    {
                        decodedToken.role === "ROLE_ADMIN"
                        ? <button onClick={()=>setShowModal(true)} className="add-btn"><span>Add User</span></button>
                        : ''
                    }  
                    </div>                  
                    <div className="search col-md-4">
                        <InputGroup>
                            <Form.Control
                                placeholder="Username"
                                aria-label="Username"
                                aria-describedby="basic-addon1"
                                onChange={inputHandler}
                            />
                            <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                        </InputGroup>
                    </div>
                </div>
                <div id="users" className={isList ? "" : "row"}>
                {
                  filteredEmployees.map((employee) =>
                    <div onClick={() => updateView(employee) } style={isList ? {background: "#DCE5E7"} : {}} className={isList ? 'item  list-group-item users-list' : 'item col-md-3 col-lg-3 '}>  
                        { isList ?  
                            <div style={employee.user.status == 'BLOCKED' ? {opacity: 0.33} : {}} className="row">
                                <div className="user-wrapper">
                                    <div className={employee.isFullList ? "col-md-10 item-margin-left-3" : "col-md-3"}>
                                        <img style={employee.isFullList ? {display:"inline-block"} : {display:"none"}} className="photo-list" src={`data:image/jpeg;base64,${employee.photo}`} />
                                        <i style={employee.isFullList ? {display:"none"} : {display:"inline-block"}} className={getIconClass(employee)}></i>
                                        {employee.isFullList ?
                                            <span>
                                                <span className="name-list">{employee.user.name + ' ' + employee.user.surname}
                                                    <sup>&nbsp;&nbsp;{employee.position}</sup>
                                                </span>
                                                <hr/>
                                                <span className="email-list"><i className="bi bi-envelope-fill"></i>&nbsp;{employee.user.email}</span>
                                            </span>
                                            :
                                            <span className="name-list-not-full">{employee.user.name + ' ' + employee.user.surname}</span>
                                        }
                                    </div>
                                    {employee.isFullList ?
                                        <div className="container item-margin-left-10 col-md-1">
                                            <div className="row" style={{float:"right"}}>
                                                <div className="col-md-12 margin-arrow"><i class="bi bi-caret-up-fill arrow"></i></div>
                                                <div className="col-md-12">
                                                    <a className='btn-custom-2' href={"/app/profile/"+employee.id}><span>More</span></a>
                                                </div>
                                        </div> 
                                        </div> 
                                        :
                                        <span className="container row">
                                            <div className="col-md-11">
                                                <i className="bi bi-briefcase suitcase"></i>
                                                <span className="position-list-not-full">{employee.position}</span>
                                            </div>
                                            <div className="col-md-1"><i class="bi bi-caret-down-fill arrow"></i></div>
                                        </span>
                                    }
                                </div>
                            </div>
                            :
                                <div style={employee.user.status == 'BLOCKED' ? {opacity: 0.33} : {}} className= "thumbnail">
                                    <div className="user-wrapper user-wrapper-list-grid">
                                        <div>
                                            <img className="photo-row" src={`data:image/jpeg;base64,${employee.photo}`} />
                                        </div>
                                        <div className="name">{employee.user.name + ' ' + employee.user.surname}</div>
                                        <div className="position"><i className="bi bi-briefcase"></i>&nbsp;{employee.position}</div>
                                        <div className="email"><i className="bi bi-briefcase"></i>&nbsp;{employee.user.email}</div>
                                    </div>
                                    <div className="row container-custom">
                                        <div>
                                            <a className='btn-custom-2 btn-custom-2-grid' href={"/app/profile/"+employee.id}>
                                                <span>More</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>)
                } 
                </div>
            </div>
            <AddEmployeeModal show={showModal} onHide={()=>setShowModal(false)} getEmployees={()=>getEmployees()} />
        </div>
    );
}