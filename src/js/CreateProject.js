import React from 'react';
import axios from "axios";
import { FaRegCircle, FaRegQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useState, useEffect} from 'react';
import { format, parseISO } from "date-fns";

import EmployessInProjectModal from './EmployessInProjectModal.js'
import '../css/ProjectPage.css';
import '../css/Profile.css';

export default function CreateProject(props) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const[name, setName] = useState(""); 
    const[description, setDescription] = useState(""); 
    const[dueDate, setDueDate] = useState("");
    const[assignee, setAssignee] = useState({});
    const[reporter, setReporter] = useState({});
    const[gitLink, setGitLink] = useState("");
    const[showModal, setShowModal] = useState(false);
    
    return (
        <div className="profile">
            <div className="container emp-profile">
                <div className="row">
                    <div className="col-md-4">
                        <svg onClick={()=> props.navigate("projects")} className="arrow-back bi bi-arrow-left" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                        </svg>
                    </div>
                    <div className="col-md-5">
                            <p style={{fontSize:'30px', fontWeight:'bold'}}>Create new project</p>              
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Name:</label>
                    </div>
                    <div className="col-md-6">
                        <input type="text" onChange={(e)=>setName(e.target.value)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Description:</label>              
                    </div>
                    <div className="col-md-6">
                        <textarea className='textarea' onChange={(e)=>setDescription(e.target.value)} cols="80" rows="6"/>
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Due time:</label>
                    </div>
                    <div className="col-md-6">
                        { dueDate != "" ? <p>{format(parseISO(dueDate), "do MMMM Y HH:mm:ss")}</p> : ''}           
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Assignee:</label>
                    </div>
                    <div className="col-md-6">  
                            <div><img className="photo" src={`data:image/jpeg;base64,${assignee != null ? assignee.photo : ''}`} />
                            &nbsp;&nbsp;{ assignee.user != null ? assignee.user.name+' '+ assignee.user.surname : ''}
                            </div>
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Reporter (GET REPORTER ID FROM COOKIES AND DELETE THIS INPUT):</label>
                    </div>
                    <div className="col-md-6">
                            <div><img className="photo" src={`data:image/jpeg;base64,${reporter != null ? reporter.photo : ''}`} />
                            &nbsp;&nbsp;{ reporter.user != null ? reporter.user.name+' '+ reporter.user.surname : ''}
                            </div>       
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Employees:</label>
                    </div>
                    <div className="col-md-6">
                            <div><img className="photo" src={`data:image/jpeg;base64,${reporter != null ? reporter.photo : ''}`} />
                            &nbsp;&nbsp;{ reporter.user != null ? reporter.user.name+' '+ reporter.user.surname : ''}
                            </div>       
                    </div>
                </div><hr/>          
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Git link:</label>
                    </div>
                    <div className="col-md-6">
                        <input type="text" onChange={(e)=>setGitLink(e.target.value)} />
                    </div>
                </div>
                <div>
                    <br/>
                    <div className="row">                                            
                            <div className="col-md-7"></div>
                            <div className="col-md-2">
                                <input type="submit" className="profile-edit-btn" value="Save" />
                            </div>
                            <div className="col-md-2">
                                <button onClick={()=> props.navigate("projects")}
                                    style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                            </div>
                    </div>
                </div>                                                            
            </div>  
            <EmployessInProjectModal show={showModal} onHide={()=>setShowModal(false)} />  
        </div>
    );
}