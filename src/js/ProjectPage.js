import React from 'react';
import axios from "axios";
import { FaRegCircle, FaInfoCircle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useState, useEffect} from 'react';
import { format, parseISO } from "date-fns";
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Form from 'react-bootstrap/Form';

import ProjectEmployeesModal, {clearInput} from './ProjectEmployeesModal.js';
import ChooseEmployeeModal from './dashboard/ChooseEmployeeModal.js'
import '../css/ProjectPage.css';

export default function ProjectPage(props) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const [project, setProject] = useState({}); 
    const [employees, setEmployees] = useState([]);
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
    const[showModal, setShowModal] = useState(false);
    const[showModalAssignee, setShowModalAssignee] = useState(false);

    useEffect(() => {
        getProject(); 
        getTickets();             
      }, [id]);

    const getProject = () => {
      if(id){
          axios
          .get("/project/tickets/" + id)
          .then(response => response.data)
          .then(data =>{
              if(data){
                  setProject(data);                  
                  setEmployees(data.employees);    
              }                 
          })
          .catch((error) => {
              //TODO
          });   
      }
    }

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
            }}>
            <FaInfoCircle/>
            </IconContext.Provider>);
     }
    }

    //TODO submit on backend
    const removeFromProject = (id) => {
      setEmployees(employees.filter(function(employee) { 
        return employee.id !== id 
      }));
    }

    //TODO submit on backend
    const addToProject = (newEmployee) => {
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

    const submitEdit = () => {
      let config = {
        headers: {
            //TODO Authorization: 'Bearer ' + token
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
          employees: employees
      };

      console.log(project_);

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
              //TODO
          });        
      }      
      update();
    }

    const editAssignee = (employee) => {
      setAssignee(employee);
      setShowModalAssignee(false);
    }

    return (
    <div className="single-project">
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
                !editMode 
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
              ? <div className='pretty-select-non-edit' onClick={editMode ? ()=>setShowModalAssignee(true) : {}} >
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
                        <button onClick={()=>{setEditMode(false);}} 
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
          <h4>Related tickets</h4>
          {
              tickets.map((ticket) =>
              ticket.status !== "CLOSE"
              ? <div className='pretty-link' style={{cursor:'pointer'}} onClick={() => props.navigate("ticket/" + ticket.id)}>
                {showNecessaryIcon(ticket.type)}
                <a className='' onClick={() => props.navigate("ticket/" + ticket.id)}>{ticket.name}</a>
              </div>
              : ""           
          )}
          </div>
        </div>
      </div>   
      <ProjectEmployeesModal show={showModal} onHide={()=>{setShowModal(false); clearInput()}} 
          employees={employees} editMode={editMode}
          removeFromProject={(id)=>removeFromProject(id)} addToProject={(employee)=>addToProject(employee)} />
      <ChooseEmployeeModal show={showModalAssignee} onHide={()=>setShowModalAssignee(false)} 
          submitChange={(employee)=>editAssignee(employee)} 
          assignee={project.assignee} reporter={project.reporter} /> 
    </div>);
}