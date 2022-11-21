import React, { useState, useEffect } from "react";
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "axios";

import AddEmployeeModal from './AddEmployeeModal.js';
import '.././css/Projects.css';
import '.././css/Users.css';

export default function Users() {
    const[employees, setEmployees] = useState({});
    const [isList, setIsList] = useState(false);
    const [inputText, setInputText] = useState("");
    const[showModal, setShowModal] = useState(false);

    useEffect(() => {        
        getEmployees();
    }, []);

    const getEmployees = () => {
         axios
         .get("/employee/all")
         .then(response => response.data)
         .then((data) =>{             
             if(data){
                 setEmployees(data);
             }                                   
         })
         .catch((error) => {
            //TODO
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
        <div className="projects">
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
                    {/**TODO for admins only: */}
                    <div className="col-md-3">
                        <button onClick={()=>setShowModal(true)} className="add-btn"><span>Add User</span></button>
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
                        <div className={isList ? 'item  list-group-item' : 'item col-md-3 col-lg-3 '} 
                            style={isList ? {background:"white"} : {}}> 
                            <div className={isList ? "" : "thumbnail"}>
                                <div style={isList ? {display:"flex", alignItems:"center", justifyContent:"space-around"} 
                                    : {display:"flex", alignItems:"center", justifyContent:"space-around", flexDirection:"column"}}>
                                    <div className={isList ? "col-md-1" : ""}><img className="photo" src={`data:image/jpeg;base64,${employee.photo}`} 
                                            style={isList ? {width: "65px", height: "65px"} : {width: "120px", height:"120px"}}/></div>
                                    <div className={isList ? "col-md-2" : ""} style={{fontWeight:"bold", marginTop:"10px"}}>
                                        {employee.user.name+' '+employee.user.surname}</div>
                                    <div className={isList ? "col-md-2" : ""} style={{marginTop:"5px"}}>
                                        <i className="bi bi-briefcase"></i>&nbsp;{employee.position}</div>
                                    <div className={isList ? "col-md-2" : ""} style={{marginTop:"5px"}}>
                                        <i className="bi bi-envelope-fill"></i>&nbsp;{employee.user.email}</div>   
                                    {isList 
                                    ? <div>
                                        <a className='btn-custom-2' style={{width:"100%"}}
                                            href={"/app/profile/"+employee.id}><span>More</span></a>
                                      </div>
                                    : ""}                                 
                                </div>                                    
                                <div className={isList ? 'row container-custom-list' : 'row container-custom'}>
                                    {isList
                                    ? ""
                                    :<div>
                                        <a className='btn-custom-2' style={{width:"100%", float:"none", margin:"0", marginTop:"10px"}}
                                            href={"/app/profile/"+employee.id}><span>More</span></a>
                                     </div>}
                                </div>
                            </div>
                        </div>
                        )
                    }
                </div>
            </div>
            <AddEmployeeModal show={showModal} onHide={()=>setShowModal(false)} getEmployees={getEmployees()} />
        </div>
    );
}