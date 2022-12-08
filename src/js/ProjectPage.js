import React from 'react';
import axios from "axios";
import { FaRegCircle, FaRegQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useState, useEffect} from 'react';
import { format, parseISO } from "date-fns";

import '../css/ProjectPage.css';

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
    return (
    <div className="single-project">
    <div className="container emp-profile">
      <div className="row">
          <div className="col-md-4">
          </div>
          <div className="col-md-5 name">
                <p>{project.name}</p>              
          </div>
      </div>
      <div className="row">
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Description:</label>              
          </div>
          <div className="col-md-6">
            <textarea className='textarea' disabled value={project.description} cols="70" rows="6"/>
          </div>
      </div><hr/>
      <div className="row">
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Create time:</label>
          </div>
          <div className="col-md-6">
            {project.createDate != null ? <p>{format(parseISO(project.createDate), "do MMMM Y HH:mm")}</p> : '' }         
          </div>
      </div><hr/>
      <div className="row">
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Due time:</label>
          </div>
          <div className="col-md-6">
            {project.dueDate != null ? <p>{format(parseISO(project.dueDate), "do MMMM Y HH:mm")}</p> : ''}           
          </div>
      </div><hr/>
      <div className="row">
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Estimated time:</label>
          </div>
          <div className="col-md-6">
            {project.estimatedTime != 0 && project.estimatedTime != null ? <p>{project.estimatedTime} h</p> : '—'}              
          </div>
      </div><hr/>
      <div className="row">
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Status:</label>
          </div>
          <div className="col-md-6">
            <p>{project.status}</p>                  
          </div>
      </div><hr/>
      <div className="row">
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Severity:</label>
          </div>
          <div className="col-md-6">
                <p>{project.severity}</p>                  
          </div>
      </div><hr/>
      <div className="row">
        <div className="col-md-1"></div>
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
        <div className="col-md-1"></div>
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
        <div className="col-md-1"></div>
         <div className="col-md-4">
              <label>Git link:</label>
          </div>
          <div className="col-md-6">
            <a target="_blank" href={project.gitRef}>{project.gitRef}</a>
          </div>
      </div><hr/><br/>
      <div className="row">
        <div className="col-md-1"></div>
        <div className="col-md-4">
        <h4>Related tickets</h4>
        {
            tickets.map((ticket) =>
            <div className='pretty-link' style={{cursor:'pointer'}} onClick={() => props.navigate("ticket/" + ticket.id)}>
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
       </div>
    </div>    
  </div>);
}