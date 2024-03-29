import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "axios";
import jwt_decode from "jwt-decode";

import {logout} from '../Sidebar.js';
import '../../css/project/Projects.css';

export default function Projects(props) {
    const[cookies] = useCookies(["token"]);
    const[isList, setIsList] = useState(false);
    const[projects, setProjects] = useState([]);
    const[inputText, setInputText] = useState("");
    const[error, setError] = useState("");
    let decodedToken;
    useLayoutEffect(() => {  
        decodedToken = jwt_decode(cookies.token);
        if(decodedToken.role!=="ROLE_CUSTOMER")      
            getProjects();
        else
            getProjectsForCustomer();
    }, []);

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
    }
    const getProjectsForCustomer = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

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

    const getProjects = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        axios
        .get("/project/all", config)
        .then(response => response.data)
        .then((data) =>{
            if(data){
                setProjects(data);
            }                    
        })
        .catch((error) => {
            let code = error.toJSON().status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);
            if(code===401){
                document.cookie = "expired=true; path=/";
            }
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
        });
    };

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase().replaceAll(' ', '');
        setInputText(lowerCase);
    };

    const filteredProjects =  Object.values(projects).filter((project) =>{
        if(inputText === ''){
            return project;
        } else {
            return project.name.toLowerCase().includes(inputText);
        }
    });
    const getDescription = (description, isList) => {
        if(description.length >= 200 && !isList){
            return description.slice(0, 200) + "...";
        } else {
            return description;
        }
    }

    return(
        <div className="projects">
            {displayError()}
            <div className="container">
                <div className="well well-sm row" style={{fontFamily:"sans-serif"}}>
                    <strong className="col-md-1">Display:</strong>
                    <div className="btn-group col-md-7">
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
                    <div className="search col-md-4">
                    <InputGroup>
                        <Form.Control
                            placeholder="Project name"
                            aria-label="Project name"
                            aria-describedby="basic-addon1"
                            onChange={inputHandler}
                        />
                        <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                    </InputGroup>
                    </div>
                </div>
                <div id="products" className={isList ? '' : 'row'}>
                    {
                        filteredProjects.map((project) => 
                        <div className={isList ? 'item col-md-4 col-lg-4 list-group-item' : 'item col-md-4 col-lg-4 grid-group-item'}> 
                            <div className="thumbnail">
                                <div className="caption">
                                    <h4 className={isList ? 'group inner list-group-item-heading list-group-item-heading-list' : 'group inner list-group-item-heading'}>
                                        {project.name}
                                    </h4>
                                    <hr className={isList ? 'line line-list' : 'line'}/>
                                    <p className={isList ? 'group inner list-group-item-text-list' : 'group inner list-group-item-text'}>{getDescription(project.description, isList)}</p>
                                    <div className={isList ? 'row container-custom-list' : 'row container-custom'}>
                                        <div className="col-xs-12 col-md-6">
                                        </div>
                                        <div className="col-xs-12 col-md-6">
                                            <a className={isList ? 'btn-custom-2' : 'btn-custom-2 btn-grid'} href={"/app/project/" + project.id}>
                                                <span>More</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}