import React from 'react';
import axios from "axios";
import { FaRegCircle, FaInfoCircle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useState, useLayoutEffect} from 'react';
import { format, parseISO } from "date-fns";
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Form from 'react-bootstrap/Form';
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import ProjectEmployeesModal, {clearInput} from './ProjectEmployeesModal.js';
import ChooseEmployeeModal from './dashboard/ChooseEmployeeModal.js'
import '../css/ProjectPage.css';

export default function ProjectPage(props) {
    const[cookies] = useCookies(["token", "employeeId", "project"]);
    const[project, setProject] = useState({}); 
    const[employees, setEmployees] = useState([]);
    const[name, setName] = useState(""); 
    const[description, setDescription] = useState(""); 
    const[dueDate, setDueDate] = useState("");
    const[estimatedTime, setEstimatedTime] = useState(0);
    const[status, setStatus] = useState("");
    const[severity, setSeverity] = useState("");
    const[assignee, setAssignee] = useState({});
    const[gitLink, setGitLink] = useState("");  
    const[editMode, setEditMode] = useState(false); 
    const{id} = useParams();  
    const severities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
    const columnOrder = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
    const[tickets, setTickets] = useState([]);
    const[showModal, setShowModal] = useState(false);
    const[showModalAssignee, setShowModalAssignee] = useState(false);
    const[errorMessage, setErrorMessage] = useState("");
    const[decodedToken, setDecodedToken] = useState({});
    const[error, setError] = useState("");

    useLayoutEffect(() => {
      setDecodedToken(jwt_decode(cookies.token)); 
      getProject(); 
      getTickets();   
    }, []);

    const displayError = () => {
      if(error!=="")
      {
        alert(error);
        logout();
      }
    }

    const getProject = () => {
      if(id){
        let config = {
          headers: {
              Authorization: 'Bearer ' + cookies.token
          }
        };

        axios
        .get("/project/tickets/" + id, config)
        .then(response => response.data)
        .then(data =>{
            if(data){
              setProject(data);                  
              setEmployees(data.employees); 
            }                 
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if(code===400 && error.response.data !== null)
              setErrorMessage(error.response.data.message);
          else if(code===401)
            setError('Authorization is required');
          else if(code===403)
            alert("Access is denied");            
          else alert('Internal server error');
        });   
      }
    }

    const getTickets = () => {
      if(id){
        let config = {
          headers: {
              Authorization: 'Bearer ' + cookies.token
          }
        };

        axios
        .get("/project/" + id + "/tickets", config)
        .then(response => response.data)
        .then(data =>{
            if(data){
                setTickets(data);                
            }                 
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if(code===400 && error.response.data !== null)
              setErrorMessage(error.response.data.message);
          else if(code===401)
            setError('Authorization is required');
          else if(code===403)
            alert("Access is denied");            
          else alert('Internal server error');
        });   
      }
    }

    const submitEdit = () => {
      let config = {
        headers: {
          Authorization: 'Bearer ' + cookies.token
        }
      };

      let employeesId = [];
      employees.forEach((employee)=>{
          employeesId.push({id: employee.id});
      });     

      let project_ = {
        name: name,
        description: description,
        dueDate: format(dueDate, "yyyy-MM-dd HH:mm"),
        estimatedTime: estimatedTime,
        status: status,
        severity: severity,
        gitRef: gitLink,
        assignee: {id: assignee.id},
        employees: employeesId
      };

      const update = async() => {
        await axios
        .put("/project/tickets/" + id, 
          project_,
          config)
        .then(() => {
          getProject();
          setEditMode(false);
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if(code===400 && error.response.data !== null && error.response.data.message === "validation error"){
              if(Array.of(error.response.data.fieldErrors).length > 0)
                  setErrorMessage(error.response.data.fieldErrors[0].defaultMessage);
          }
          else if(code===400 && error.response.data !== null)
              setErrorMessage(error.response.data.message);
          else if(code===401)
            setError('Authorization is required');
          else if(code===403)
            alert("Access is denied");     
          else alert('Internal server error');
        });        
      }      
      update();
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
            }}>
            <FaRegCircle/>
            </IconContext.Provider>);
        } else {
          return (<IconContext.Provider
            value={{ 
                className: "glyphicon glyphicon-th",
                size: '15px',
                color:'orange'
            }}>
            <FaInfoCircle/>
            </IconContext.Provider>);
      }
    }

    const removeFromProject = (id) => {
      clearInput();
      setEmployees(employees.filter(function(employee) { 
        return employee.id !== id 
      }));
    }

    const addToProject = (newEmployee) => {
      clearInput();
      setEmployees([...employees, newEmployee])
    }

    const editProfileOnUI = () => {
      setName(project.name);
      setDescription(project.description);
      setDueDate(parseISO(project.dueDate));
      setEstimatedTime(project.estimatedTime);
      setStatus(project.status);
      setSeverity(project.severity);
      setGitLink(project.gitRef);
      setAssignee(project.assignee);
      setEmployees(project.employees);
      setEditMode(true);
    }

    const editAssignee = (employee) => {
      setAssignee(employee);
      setShowModalAssignee(false);
    }

    const isUsersCurrentProject = (_id) => {
      let config = {
        headers: {
            Authorization: 'Bearer ' + cookies.token
        }
      };

      if(decodedToken.role==="ROLE_CLIENT"){
        axios
        .get("/orders/" + decodedToken.id + "/project", config)
        .then(response => response.data)
        .then((data) =>{
          if(data.orders!=null){
            data.orders.map(order => {
              if(order.project.id==_id)
                return true;
            });
            return false;
          }                  
        })
        .catch((error) => {               
          let code = error.toJSON().status;
          if(code===401){
              alert('Authorization is required');
          }
          else alert('Internal server error');
        });
      } else if(decodedToken.id != undefined) {
        axios
        .get("/employee/" + decodedToken.id, config)
        .then(response => response.data)
        .then((data) =>{
          if(data.currentProjects!=null){
            data.currentProjects.map(project => {
              if(project.id==_id)
                return true;
            });
            return false;
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
    }

    return (
    <div className="single-project">
      {displayError()}
      <div className="container emp-profile">
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-1"><h3>Project: </h3></div>
            <div className="col-md-7">
                {editMode 
                ? <input type="text" className='name' defaultValue={project.name} onChange={e => setName(e.target.value)}/> 
                : <h3>{project.name}</h3>}                 
            </div>
            {
                !editMode && project.reporter != null && (cookies.employeeId == project.reporter.id || decodedToken.role === "ROLE_ADMIN")
                ?<div className="col-md-3">
                    <button onClick={() => editProfileOnUI()} className="mybtn"><span>Edit Project</span></button>
                </div>
                : ""
            }
        </div><br/>        
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
                <label>Description:</label>              
            </div>
            <div className="col-md-6">
            {
                editMode 
                ?<textarea className='textarea'
                    defaultValue={project.description} onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
                : <textarea className='textarea' disabled value={project.description} cols="80" rows="6"/>
            } 
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
                {editMode 
                ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker style={{width:'100%'}} value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                  </MuiPickersUtilsProvider> 
                : project.dueDate != null 
                ? <p>{format(parseISO(project.dueDate), "do MMMM Y HH:mm")}</p> 
                : ''}                    
            </div>
        </div><hr/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
                <label>Estimated time:</label>
            </div>
            <div className="col-md-6">
              {editMode 
              ? <input type="number" defaultValue={project.estimatedTime} min="0" onChange={e => setEstimatedTime(e.target.value)}
                  onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                      }
                  }} /> 
              : project.estimatedTime != 0 ? <p>{project.estimatedTime} h</p> : '—'}                    
            </div>
        </div><hr/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
                <label>Status:</label>
          </div>
          <div className="col-md-6">
            {editMode 
            ? <Form.Select onChange={e => setStatus(e.target.value)}>
                <option selected value={project.status}>{project.status}</option>                    
                {
                    columnOrder.map(column => {
                        if(column != project.status)
                            return <option value={column}>{column}</option>;
                    })
                }
            </Form.Select>
            : <p>{project.status}</p>}                    
          </div>
        </div><hr/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
                <label>Severity:</label>
            </div>
            <div className="col-md-6">
              {editMode 
              ? <Form.Select onChange={e => setSeverity(e.target.value)}>
                  <option selected value={project.severity}>{project.severity}</option>                    
                  {
                      severities.map(severity => {
                          if(severity != project.severity)
                              return <option value={severity}>{severity}</option>;
                      })
                  }
              </Form.Select>
              : <p>{project.severity}</p>}                    
            </div>
        </div><hr/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
                <label>Assignee:</label>
            </div>
            <div className="col-md-6">
              {editMode
              ? (
                  assignee != null
                  ? <div className='pretty-select' onClick={editMode ? ()=>setShowModalAssignee(true) : {}} >
                      <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} />
                      &nbsp;&nbsp;{assignee.user.name+' '+ assignee.user.surname}
                  </div>
                  : ''
              )
              : project.assignee != null
              ? <div className='pretty-select-non-edit'>
                  <img className="photo" src={`data:image/jpeg;base64,${project.assignee.photo}`} />
                  &nbsp;&nbsp;{project.assignee.user.name + ' ' + project.assignee.user.surname}
                </div>
              : "" }           
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
                <label>Employees:</label>
            </div>
            <div className="col-md-6">
                <button onClick={()=>setShowModal(true)} className="employees">Show...</button>      
            </div>
        </div><hr/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
                <label>Git link:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" style={{width:'100%'}} defaultValue={project.gitRef} onChange={e => setGitLink(e.target.value)}/> 
                : <a target="_blank" href={project.gitRef}>{project.gitRef}</a>}                    
            </div>
        </div><hr/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className='col-md-10 error'>{errorMessage}</div>
        </div>
        {
            editMode
            ?<div>
                <br/>
                <div className="row">                                            
                    <div className="col-md-7"></div>
                    <div className="col-md-2">
                        <input type="submit" onClick={()=>{submitEdit()}} className="profile-edit-btn" value="Save" />
                    </div>
                    <div className="col-md-2">
                        <button onClick={()=>{setEditMode(false); setErrorMessage("");}} 
                            style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                    </div>
                </div>
            </div>
            : ''
        }
        <br/>
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-4">
            <h4 className=
              {decodedToken.role==="ROLE_ADMIN" || (cookies.project != undefined && isUsersCurrentProject(id)) ? "to-dashboard" : ""}
                onClick={decodedToken.role==="ROLE_ADMIN" 
                      || (cookies.project != undefined && isUsersCurrentProject(id)) ? () => props.navigate("dashboard/" + id) :{}}>
                Related tickets
            </h4>
            {
              tickets.length > 0
              ? tickets.map((ticket) =>
              ticket.status !== "CLOSE"
              ? <div className='pretty-link' style={{cursor:'pointer'}} onClick={() => props.navigate("ticket/" + ticket.id)}>
                {showNecessaryIcon(ticket.type)}
                <a style={{fontWeight:"normal"}} onClick={() => props.navigate("ticket/" + ticket.id)}>{ticket.name}</a>
              </div>
              : "")
              : "No tickets"
            }
          </div>
        </div>
      </div>   
      <ProjectEmployeesModal show={showModal} onHide={()=>{setShowModal(false); clearInput()}} 
          employees={employees} editMode={editMode}
          removeFromProject={(id)=>removeFromProject(id)} addToProject={(employee)=>addToProject(employee)} />
      <ChooseEmployeeModal show={showModalAssignee} onHide={()=>setShowModalAssignee(false)} 
          submitChange={(employee)=>editAssignee(employee)} 
          assignee={project.assignee} reporter={project.reporter} projectId={id} /> 
    </div>);
}