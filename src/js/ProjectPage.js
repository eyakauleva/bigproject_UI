import React from 'react';
import axios from "axios";
import { FaRegCircle, FaRegQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useState, useEffect} from 'react';
import { format, parseISO } from "date-fns";

import '../css/ProjectPage.css';
import '../css/Profile.css';

export default function ProjectPage(props) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const [project, setProject] = useState({}); 
    const[name, setName] = useState(""); 
    const[description, setDescription] = useState(""); 
    const[dueDate, setDueDate] = useState("");
    const[estimatedTime, setEstimatedTime] = useState("");
    const[status, setStatus] = useState("");
    const[severity, setSeverity] = useState("");
    const[assignee, setAssignee] = useState({});
    const[gitLink, setGitLink] = useState("");  
    const[editMode, setEditMode] = useState(false); 
    const {id} = useParams();  
    const severities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
    const columnOrder = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
    const[tickets, setTickets] = useState([]);

    useEffect(() => {
        getProject(); 
        getTickets();             
      }, [id]);
      const getTickets = () => {
        if(id){
            axios
            .get("/project/" + id + "/tickets")
            .then(response => response.data)
            .then(data =>{
                if(data){
                    setTickets(data);                
                }                 
            })
            .catch((error) => {
                //TODO
            });   
        }
      }
    let showNecessaryIcon = (type) => {
     if(type === 'BUG'){
        return (<IconContext.Provider
        value={{ 
            className: "glyphicon glyphicon-th",
            size: '15px',
            color:'red'
        }}
        >
        <FaRegCircle/>
        </IconContext.Provider>);
     } else if(type === 'TASK'){
        return (<IconContext.Provider
            value={{ 
                className: "glyphicon glyphicon-th",
                size: '15px',
                color:'green'
            }}
            >
            <FaRegCircle/>
            </IconContext.Provider>);
     } else {
        return (<IconContext.Provider
            value={{ 
                className: "glyphicon glyphicon-th",
                size: '15px',
                color:'orange'
            }}
            >
            <FaInfoCircle/>
            </IconContext.Provider>);
     }
    }
    const getProject = () => {
        if(id){
            axios
            .get("/project/tickets/" + id)
            .then(response => response.data)
            .then(data =>{
                if(data){
                    setProject(data);                
                }                 
            })
            .catch((error) => {
                //TODO
            });   
        }
      }
    return (<div className="profile">
    <div className="container emp-profile">
      <div className="row">
          <div className="col-md-4">
              {/** set project ID dynamically to navigate */}
              <svg onClick={()=> props.navigate("projects")} className="arrow-back bi bi-arrow-left" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
          </div>
          <div className="col-md-5">
                <p style={{fontSize:'30px', fontWeight:'bold'}}>{project.name}</p>              
          </div>
      </div>
      <div className="row">
         <div className="col-md-4">
              <label>Description:</label>
              <textarea className='textarea' disabled value={project.description} cols="80" rows="6"/>
          </div>
          <div className="col-md-6">
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Create time:</label>
          </div>
          <div className="col-md-6">
            {project.createDate != null ? <p>{format(parseISO(project.createDate), "do MMMM Y HH:mm:ss")}</p> : '' }         
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Due time:</label>
          </div>
          <div className="col-md-6">
            {project.dueDate != null ? <p>{format(parseISO(project.dueDate), "do MMMM Y HH:mm:ss")}</p> : ''}           
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Estimated time:</label>
          </div>
          <div className="col-md-6">
            {project.estimatedTime != null ? <p>{project.estimatedTime} h</p> : ''}              
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Status:</label>
          </div>
          <div className="col-md-6">
            <p>{project.status}</p>                  
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Severity:</label>
          </div>
          <div className="col-md-6">
                <p>{project.severity}</p>                  
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Assignee:</label>
          </div>
          <div className="col-md-6">  
                <div><img className="photo" src={`data:image/jpeg;base64,${project.assignee != null ? project.assignee.photo : ''}`} />
                  &nbsp;&nbsp;{ project.assignee != null ? project.assignee.user.name+' '+ project.assignee.user.surname : ''}
                </div>
          </div>
      </div><hr/>
      <div className="row">
         <div className="col-md-4">
              <label>Reporter:</label>
          </div>
          <div className="col-md-6">
                <div><img className="photo" src={`data:image/jpeg;base64,${project.reporter != null ? project.reporter.photo : ''}`} />
                &nbsp;&nbsp;{ project.reporter != null ?project.reporter.user.name+' '+ project.reporter.user.surname : ''}
                </div>       
          </div>
      </div><hr/>        
      <div className="row">
         <div className="col-md-4">
              <label>Git link:</label>
          </div>
          <div className="col-md-6">
            <a target="_blank" href={project.gitRef}>{project.gitRef}</a>
          </div>
      </div><hr/>
        <h4>Related tickets</h4>
        {
            tickets.map((ticket) =>
            <div className='pretty-link' onClick={() => props.navigate("ticket/" + ticket.id)}>
            {/* <IconContext.Provider
                value={{ 
                    className: "glyphicon glyphicon-th",
                    size: '15px',
                    color:'red'
                }}
            >
            <FaRegCircle/>
            </IconContext.Provider> */}
            {showNecessaryIcon(ticket.type)}
            <a className='' onClick={() => props.navigate("ticket/" + ticket.id)}>{ticket.name}</a>
       </div>
        )}
    </div>    
  </div>);
}