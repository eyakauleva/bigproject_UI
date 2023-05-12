import React from 'react';
import axios from "axios";
import { FaRegCircle, FaInfoCircle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useState, useLayoutEffect, useRef} from 'react';
import { format, parseISO } from "date-fns";
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Form from 'react-bootstrap/Form';
import jwt_decode from "jwt-decode";

import {logout} from '../Sidebar.js';
import ProjectEmployeesModal, {clearInput} from './ProjectEmployeesModal.js';
import ChooseEmployeeModal from '../dashboard/ChooseEmployeeModal.js'
import '../../css/ProjectPage.css';
import Comments from '../comments/Comments.js';

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
    const[deleteInitialFile, setDeleteInitialFile] = useState(false);
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
    const[isOver, setIsOver] = useState(false);
    const file= useRef(null);
    const[finalFile, setFinalFile] = useState(null);

    useLayoutEffect(() => {
      checkCustomer();
      setDecodedToken(jwt_decode(cookies.token)); 
      getProject();  
    }, []);

    const displayError = () => {
      if(error!=="")
      {
        alert(error);
        logout();
      }
    }
    const checkCustomer = () => {
      let decodedToken = jwt_decode(cookies.token);
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
              let project = projects.find(proj => proj.id == id);
              if(project){
                return;
              }
              props.navigate("/");  
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
              if(data.type == 'PROJECT') {
                setProject(data);                  
                setEmployees(data.employees); 
              } else {
                alert('Project does not exist');
                props.navigate("/app/projects");
              }
            }                 
        })
        .then(() => {
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
            else if(code===401){
              document.cookie = "expired=true; path=/";
            }
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null) 
                alert('Internal server error');
          });   
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if(code===400 && error.response.data !== null)
              setErrorMessage(error.response.data.message);
          else if(code===401){
            document.cookie = "expired=true; path=/";
          }
          else if(code===403)
              alert("Access is denied"); 
          else if(code!==undefined && code!==null) 
              alert('Internal server error');
        });   
      }
    }

    const submitEdit = () => {
      let config = {
        headers: {
          Authorization: 'Bearer ' + cookies.token,
        }
      };

      let employeesId = [];
      let isAssigneeAdded = false;
      let isReviewerAdded = false;
      employees.forEach((employee)=>{
        employeesId.push({id: employee.id});
        if(employee.id == assignee.id){
          isAssigneeAdded = true;
        }
        if(employee.id == cookies.employeeId){
          isReviewerAdded = true;
        }
      });

      if(!isAssigneeAdded){
        employeesId.push({id: assignee.id});
      }
      if(!isReviewerAdded && cookies.employeeId != assignee.id){
        employeesId.push({id: cookies.employeeId});
      }   

      let project_ = {
        name: name,
        description: description,
        dueDate: dueDate != null ? format(dueDate, "yyyy-MM-dd HH:mm") : null,
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
          const updateFile = async() => {
            let fileConfig = {
              headers: {
                Authorization: 'Bearer ' + cookies.token,
                'Content-Type': 'multipart/form-data'
              }
            };
            let file;
            if(deleteInitialFile !== null && finalFile === null){
                file = {
                    attachment: project_.attachment
                };
            } else {
                file = {
                    attachment: finalFile
                };
            }
            if((file.attachment !== undefined && file.attachment.name !== null) || deleteInitialFile){
                await axios
                .put("/project/tickets/" + id + "/file?remove=" + deleteInitialFile, 
                  file,
                  fileConfig)
                .then(() => {
                  setErrorMessage("");
                  getProject();
                  setEditMode(false);
                })
                .catch((error) => {
                  setFinalFile(null);
                  let code = error.toJSON().status;
                  if(code===400 && error.response.data !== null)
                      setErrorMessage(error.response.data.message);
                  else if(code===401){
                    document.cookie = "expired=true; path=/";
                  }
                  else if(code===403)
                      alert("Access is denied"); 
                  else if(code!==undefined && code!==null) 
                      alert('Internal server error');
                });        
              }      
            }   
            updateFile();
          })
        .then(() =>{
            setErrorMessage("");
            setEditMode(false);
            getProject();
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if(code===400 && error.response.data !== null)
              setErrorMessage(error.response.data.message);
          else if(code===401){
            document.cookie = "expired=true; path=/";
          }
          else if(code===403)
              alert("Access is denied"); 
          else if(code!==undefined && code!==null) 
              alert('Internal server error');
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

    const editProjectOnUI = () => {
      setName(project.name);
      setDescription(project.description);
      setDueDate(parseISO(project.dueDate));
      setEstimatedTime(project.estimatedTime);
      setStatus(project.status);
      setSeverity(project.severity);
      setGitLink(project.gitRef);
      setAssignee(project.assignee);
      setEmployees(project.employees);
      setFinalFile(null);
      setDeleteInitialFile(false);
      setEditMode(true);
    }

    const editAssignee = (employee) => {
      setAssignee(employee);
      setShowModalAssignee(false);
    }

    const getColorForStatus = (status) =>{
      if(status === "OPEN"){
          return "#42526e"
      } else if(status === "CLOSE"){
          return "#00875a"
      } else {
          return "#0052cc"
      }
    }
    const handleFileClick = () => {
      file = file.current.click();
      setFinalFile(file);
    };
    const handleDragOver = e => {
      e.preventDefault();
      setIsOver(true);
    };
  
    const handleDragLeave = () => {
      setIsOver(false);
    };
  
    const handleDrop = e => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      setFinalFile(droppedFile);
      setIsOver(false);
    };
  
    const handleFileChange = e => {
      const selectedFile = e.target.files[0];
      setFinalFile(selectedFile);
    };
    const getFileForEditView = () => {
      return (<div
                  className={`drop-zone ${isOver ? 'over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
              >
                  {(project.fileName === null && finalFile === null) || (finalFile === null && deleteInitialFile)  ? (
                  <>
                      <span className="drop-zone__prompt">Drag and drop files here or click to select</span>
                      <input 
                          type="file" 
                          name="file" 
                          ref={file}
                          onChange={handleFileChange} 
                          className="drop-zone__input" 
                      />
                  </>
                  ) : (
                  <>
                      <input 
                          type="file" 
                          name="file" 
                          ref={file}
                          onChange={handleFileChange} 
                          className="drop-zone__input" 
                      />
                      <p>Selected file: {finalFile !== null ? finalFile.name : project.fileName} 
                         <i 
                           className="bi bi-file-earmark-x-fill delete-file-icon" 
                           onClick={(e) => {deleteAttachment(e)}}
                           >
                         </i>
                      </p>
                  </>
                  )}
              </div>);
    }
    const getFileForNonEditView = (file) => {
      if(file !== null){
          return <div class="drop-zone" style={{textAlign:"left"}} >
                      <a class="file-link" href={"http://localhost:8080/project/" + id +"/file"}><i className="bi bi-file-earmark-arrow-up-fill"></i> {project.fileName}</a>
                 </div>
      } else {
          return <div class="drop-zone" style={{height:"91px"}}>
                      <div className="drop-zone-prompt-no-value">There are no file yet on this ticket<br/>Update ticket to add</div>
                 </div> 
      }
    }
    const deleteAttachment = (e) => {
      if (window.confirm("Are you sure you want to remove attachment?")) {
          e.stopPropagation(); 
          setDeleteInitialFile(true); 
          setFinalFile(null);
      }
    }
    const getEstimatedTime = () =>{
      if(project.estimatedTime < project.loggedTime){
          return parseFloat(project.estimatedTime + (project.loggedTime - project.estimatedTime)).toFixed(1);
      } else{
          return parseFloat(project.estimatedTime).toFixed(1);
      }
   }
   const getEstimatedTimeView = () =>{
      if(getEstimatedTime() < 10 ){
          return {marginLeft:"21.5%"};
      } else {
          return {marginLeft:"20%"};
      }
   }
    return (
    <div className="single-project">
      {displayError()}
      <div className="container emp-profile">
        <div className="row">
            <div className="col-md-1"><h3>Project: </h3></div>
            <div className="col-md-9">
                {editMode 
                ? <input type="text" className='name' defaultValue={project.name} onChange={e => setName(e.target.value)}/> 
                : <h3>{project.name}</h3>}                 
            </div>
            <div className="row">
              <div className="col-md-12">
                    {
                        !editMode && project.reporter !== undefined 
                            && (cookies.employeeId === project.reporter.id || decodedToken.role === "ROLE_ADMIN")
                        && 
                                <button onClick={() => editProjectOnUI()} className="mybtn">
                                    <span><i className="bi bi-pencil-square ticket-icon" ></i></span>
                                    <span> Edit</span>
                                </button>

                    } 
                </div>
            </div>
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-12">
                  <div className="group-name">Details</div>
                  <ul className="property-list">
                    <li className="item">
                        <li className="item">
                            <strong className="name">Type:</strong>
                            <span className="value" style={{marginLeft:"30%"}}><i class="bi bi-gear-wide-connected green"></i> {project.type}</span>
                        </li>
                    </li>
                      <li className="item item-right">
                          <strong className="name">Status:</strong>
                          <span>
                          {editMode 
                              ? <Form.Select className="status-form" onChange={e => setStatus(e.target.value)}>
                                  <option selected value={project.status}>{project.status}</option>                    
                                  {
                                      columnOrder.map(column => {
                                          if(column !== project.status)
                                              return <option value={column}>{column}</option>;
                                      })
                                  }
                                  </Form.Select>
                              : <span className="value status-value" style={{backgroundColor:getColorForStatus(project.status)}}>{project.status}</span>} 
                          </span>
                      </li>
                      <li className="item">
                          <strong className="name">Priority:</strong>
                          <span>
                          {editMode 
                                  ? <Form.Select className="priority-form" onChange={e => setSeverity(e.target.value)}>
                                      <option selected value={project.severity}>{project.severity}</option>                    
                                      {
                                          severities.map(severity => {
                                              if(severity !== project.severity)
                                                  return <option value={severity}>{severity}</option>;
                                              return;
                                          })
                                      }
                                      </Form.Select>
                                  : <span className="value" style={{marginLeft:"16%"}}>{project.severity}</span>} 
                          </span>
                      </li>
                      <li className="item item-right">
                        <strong className="name">Git link:</strong>
                        <span >
                        {editMode 
                            ? <input type="text" className="git-form" defaultValue={project.gitRef} onChange={e => setGitLink(e.target.value)}/> 
                            : <a className="value git-value"  target="_blank" rel="noreferrer" href={project.gitRef}>{project.gitRef}</a>
                        }   
                        </span>
                      </li>
                  </ul>
                </div>
                <div className="col-md-12">
                  <div className="group-name">Dates</div>
                  <ul className="property-list">
                    <li className="item">
                      <strong className="name">Created:</strong>
                      <span className="value">{project.createDate != null ? <span>{format(parseISO(project.createDate), "do MMMM Y HH:mm")}</span> : '' }</span>
                    </li>
                    <li className="item">
                      <strong className="name">Due time:</strong>
                      <span>
                      {editMode 
                          ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DateTimePicker className="date-form" value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                              <i className="bi bi-x-lg reset-date" onClick={()=>setDueDate(null)}></i>
                          </MuiPickersUtilsProvider>
                          : project.dueDate != null 
                          ? <span className="value" style={{marginLeft:"18%"}}>{format(parseISO(project.dueDate), "do MMMM Y HH:mm")}</span> 
                          : ''} 
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-12">
                  <div className="group-name">Description</div>
                  <div className="col-md-12">
                      {
                          editMode 
                          ?<textarea className='textarea'
                              defaultValue={project.description} onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
                          : <textarea className='textarea' disabled value={project.description} cols="80" rows="6"/>
                      } 
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="group-name">Attachment</div>
                      {
                        editMode ? getFileForEditView()
                                  : getFileForNonEditView(project.fileName)
                      }   
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="row">
                <div className="col-md-12">
                  <div className="group-name">People</div>
                    <ul className="property-list col-md-12">
                      <li className="item item-people">
                        <strong className="name">Assignee:</strong>
                        <span className="value" style={{marginLeft:"15%"}}>
                          {
                              editMode
                              ? (
                                  assignee != null
                                  && <span className='pretty-select' onClick={editMode ? ()=> setShowModalAssignee(true) : {}} >
                                      <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} alt=""/>
                                      &nbsp;{assignee.user.name+' '+ assignee.user.surname}
                                  </span>
                              )
                              : project.assignee != null
                              && <span className='pretty-select-non-edit' >
                                  <img className="photo" src={`data:image/jpeg;base64,${project.assignee.photo}`} alt=""/>
                                  &nbsp;{project.assignee.user.name + ' ' + project.assignee.user.surname}
                              </span>
                          } 
                          </span>
                      </li>
                      <li className="item item-people" style={{marginTop:"4%"}}>
                        <strong className="name">Employees:</strong>
                        <div className='value project-employees' style={{marginLeft:"15%"}} onClick={()=>setShowModal(true)}>
                          {
                            project != null && project.employees != undefined
                            ? project.employees
                              .sort((a, b) => a.id > b.id ? 1 : -1)
                              .map((employee, idx) => {
                                if(idx<3) return  <div className="profile-img" style={{marginLeft:1.5*idx + "%"}}>
                                                    <img style={{border:"2px solid #66b3ff"}} src={`data:image/jpeg;base64,${employee.photo}`} />
                                                  </div>
                              })
                            : ''
                          }
                          {
                            project.employees != null && project.employees.length > 3
                            ? <div className="profile-img" style={{marginLeft:"4.2%"}}>
                                <span className='centered'>+{project.employees.length-3}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="34px" height="34px" fill="#D4DADE" class="bi bi-circle-fill" viewBox="0 0 16 16">
                                  <circle cx="8" cy="8" r="8"/>
                                </svg>
                              </div>
                            : ''
                          }
                        </div>
                      </li>
                      <li className="item item-people" style={{marginTop:"4%"}}>
                        <strong className="name">Reporter:</strong>
                        <span className="value" style={{marginLeft:"16%"}}>
                            {project.reporter != null
                            && <span className='pretty-select-non-edit'>
                                <img className="photo" src={`data:image/jpeg;base64,${project.reporter.photo}`} alt=""/>
                                &nbsp;{project.reporter.user.name + ' ' + project.reporter.user.surname}
                            </span>
                            }  
                        </span>
                      </li>
                    </ul>
                </div>
                <div className="col-md-12">
                  <div className="group-name">Time Tracking</div>
                  <ul className="property-list col-md-12">
                    <li className="item item-people">
                      <strong className="name">Estimated:</strong>
                      {editMode ? 
                        <input type="number" className="log-form" defaultValue={project.estimatedTime} min="0" onChange={e => setEstimatedTime(e.target.value) }
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        : <span className="value" style={getEstimatedTimeView()}>{getEstimatedTime()} h</span>
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        </div>      
        <div className="row">
          <div className='col-md-10 error'>{errorMessage}</div>
        </div>
        {
            editMode
            &&<div style={{overflow:"auto"}}>
                <hr/>
                <div className="row" style={{float:"right"}}>                                            
                    <div className="col-md-6">
                        <input type="submit" onClick={()=>{submitEdit()}} className="btn btn-outline-primary" value="Update" />
                    </div>
                    <div className="col-md-6">
                        <button 
                          onClick={
                            ()=>{
                              setEditMode(false); 
                              setErrorMessage(""); 
                              project.fileName !== null ? setFinalFile({name: project.fileName}) : setFinalFile(null);
                            }
                          }  
                          className="btn btn-outline-danger">Cancel</button>
                    </div>
                </div>
              </div>
        }
        <div className="row">
          <div className="col-md-8">
            <div className="col-md-12">
              <div className="group-name">Related tickets</div>
              <div className="rel-ticket-group">
                {
                  tickets.length > 0
                  ? tickets.map((ticket) =>
                  ticket.status !== "CLOSE"
                  ? <div className='pretty-link' style={{cursor:'pointer'}} onClick={() => props.navigate("ticket/" + ticket.id)}>
                    {showNecessaryIcon(ticket.type)}
                    <a style={{fontWeight:"normal"}} onClick={() => props.navigate("ticket/" + ticket.id)}>{ticket.name}</a>
                  </div>
                  : "")
                  : <div style={{marginLeft:'2%'}}>There are no related tickets yet on this project</div>
                }
              </div>
            </div>
          </div>
        </div><br/>
        <div className="row">
            <h5 className="comments-title">Comments</h5>
            <hr/>
            <Comments currentTicketId={id} /> 
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