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

    const getEmployees = async() => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        await axios
        .get("/employee/all", config)
        .then(response => response.data)
        .then((data) =>{             
            if(data){
                setEmployees(data);
                setDecodedToken(jwt_decode(cookies.token));
            }                                   
        })
        .catch((error) => {
            let code = error.toJSON().status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);            
            else if(code===401)
                setError('Authorization is required');
            else if(code===403)
                alert("Access is denied");
            else alert('Internal server error');
        });    
    };

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };

    const filteredEmployees =  Object.values(employees).filter((employee) =>{
        if(inputText === ''){
            return employee;
        } else {
            if(employee.user) 
                return employee.user.name.toLowerCase().includes(inputText);
        }
    });

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
                <div id="products" className={isList ? '' : 'row'}>
                    {
                        filteredEmployees.map((employee) => 
                        <div className={isList ? 'item  list-group-item users-list' : 'item col-md-3 col-lg-3 '}> 
                            <div className={isList ? "" : "thumbnail"}>
                                <div className={isList ? 'user-wrapper' : 'user-wrapper user-wrapper-list-grid'}>
                                    <div className={isList ? "col-md-1" : ""}>
                                        <img className="photo" src={`data:image/jpeg;base64,${employee.photo}`} 
                                            style={isList ? {width: "65px", height: "65px"} : {width: "120px", height:"120px"}}/></div>
                                    <div className={isList ? "col-md-2 name" : "name"}>
                                        {employee.user.name + ' ' + employee.user.surname}</div>
                                    <div className={isList ? "col-md-2 position" : "position"}>
                                        <i className="bi bi-briefcase"></i>&nbsp;{employee.position}</div>
                                    <div className={isList ? "col-md-2 email" : "email"}>
                                        <i className="bi bi-envelope-fill"></i>&nbsp;{employee.user.email}</div>   
                                    {isList 
                                    ? <div>
                                        <a className='btn-custom-2' href={"/app/profile/"+employee.id}><span>More</span></a>
                                      </div>
                                    : ""}                                 
                                </div>                                    
                                <div className={isList ? 'row container-custom-list' : 'row container-custom'}>
                                    {isList
                                    ? ""
                                    : <div>
                                        <a className='btn-custom-2 btn-custom-2-grid' href={"/app/profile/"+employee.id}>
                                            <span>More</span>
                                        </a>
                                     </div>}
                                </div>
                            </div>
                        </div>
                        )
                    }
                </div>
            </div>
            <AddEmployeeModal show={showModal} onHide={()=>setShowModal(false)} getEmployees={()=>getEmployees()} />
        </div>
    );
}