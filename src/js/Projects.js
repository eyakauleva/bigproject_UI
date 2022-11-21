import React, { useState, useEffect } from "react";
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "axios";

import '.././css/Projects.css';

export default function Projects(props) {
    const [isList, setIsList] = useState(false);
    const[projects, setProjects] = useState([]);
    const [inputText, setInputText] = useState("");

    useEffect(() => {        
        getProjects();
    }, []);

    const getProjects = () => {
         axios
            .get("/project/all")
            .then(response => response.data)
            .then((data) =>{
                if(data){
                    setProjects(data);
                }                    
            })
            .catch((error) => {
            });
    };

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };

    const filteredProjects =  Object.values(projects).filter((project) =>{
        if(inputText === ''){
            return project;
        } else {
            return project.name.toLowerCase().includes(inputText);
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
                    {/**TODO for managers only: */}
                    <div className="col-md-3">
                        <button onClick={()=>props.navigate('projects/new')} className="add-btn"><span>New Project</span></button>
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
                                    <p className={isList ? 'group inner list-group-item-text-list' : 'group inner list-group-item-text'}>{project.description}</p>
                                    <div className={isList ? 'row container-custom-list' : 'row container-custom'}>
                                        <div className="col-xs-12 col-md-6">
                                            {/* <p className="lead">$21.000</p> */}
                                        </div>
                                        <div className="col-xs-12 col-md-6">
                                            <a className={isList ? 'btn-custom-2' : 'btn-custom-2 btn-grid'} onClick={() => props.navigate("project/" + project.id)}>
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