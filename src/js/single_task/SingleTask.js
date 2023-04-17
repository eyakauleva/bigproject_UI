import { useState, useEffect, useRef} from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { format, parseISO } from "date-fns";
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import jwt_decode from "jwt-decode";
import {logout} from '../Sidebar.js';

import ChooseEmployeeModal from '../dashboard/ChooseEmployeeModal.js'
import '../../css/SingleTask.css';
import Comments from '../comments/Comments.js';
import TimeTrackingModal from './TimeTrackingModal.js'

export default function SingleTask(props) {
  const[cookies] = useCookies(["token", "employeeId"]);
  const[ticket, setTicket] = useState({}); 
  const[name, setName] = useState(""); 
  const[description, setDescription] = useState(""); 
  const[dueDate, setDueDate] = useState(new Date());
  const[status, setStatus] = useState("");
  const[severity, setSeverity] = useState("");
  const[assignee, setAssignee] = useState({});
  const[gitLink, setGitLink] = useState(""); 
  const[editMode, setEditMode] = useState(false); 
  const {id} = useParams();  
  const severities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
  const columnOrder = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
  const[showModal, setShowModal] = useState(false);
  const[showTimeModal, setShowTimeModal] = useState(false);
  const[errorMessage, setErrorMessage] = useState("");
  const[decodedToken, setDecodedToken] = useState({});
  const[error, setError] = useState("");
  const[projectId, setProjectId] = useState();
  const[deleteInitialFile, setDeleteInitialFile] = useState(false);
  const[isOver, setIsOver] = useState(false);
  const file= useRef(null);
  const[finalFile, setFinalFile] = useState(null);
  const[estimatedTime, setEstimatedTime] = useState(0);
  const[loggedTime, setLoggedTime] = useState(0.0);  

  useEffect(() => {
    getTicket();              
  }, [id]);

  const displayError = () => {
    if(error!=="")
    {
      alert(error);
      logout();
    }
  }

  const getTicket = () => {
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
                setTicket(data); 
                setProjectId(data.ticket.id);
                setDecodedToken(jwt_decode(cookies.token));
                setEstimatedTime(data.estimatedTime);                  
            }             
        })
        .then(() => {
            axios
            .get("/time/ticket/" + id, config)
            .then(response => response.data)
            .then(data =>{
                if(data){
                    setLoggedTime(data);                 
                }
            })  
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

    let ticket = {
        name: name,
        description: description,
        dueDate: format(dueDate, "yyyy-MM-dd HH:mm"),
        status: status,
        severity: severity,
        gitRef: gitLink,
        assignee: {id: assignee.id}
    };
    
    const update = async() => {
        await axios
        .put("/project/tickets/" + id, 
            ticket,
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
                        attachment: ticket.attachment
                    };
                } else {
                    file = {
                        attachment: finalFile
                    };
                }
                if(file.attachment !== undefined && file.attachment.name !== null || deleteInitialFile){
                    await axios
                    .put("/project/tickets/" + id + "/file?remove=" + deleteInitialFile, 
                        file,
                        fileConfig)
                    .then(() => {
                        getTicket();
                        setEditMode(false);
                        setErrorMessage("");
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
            updateFile();
        }).then(() =>{
            setEditMode(false);
            getTicket();
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

  const editTicketOnUI = () => {
    setName(ticket.name);
    setDescription(ticket.description);
    setDueDate(parseISO(ticket.dueDate));
    setStatus(ticket.status);
    setSeverity(ticket.severity);
    setGitLink(ticket.gitRef);
    setAssignee(ticket.assignee);
    setDeleteInitialFile(false);
    setEditMode(true);
  }

  const editAssignee = (employee) => {
    setAssignee(employee);
    setShowModal(false);
  }

 const getIconForType = (type) =>{
    if(type === "BUG"){
        return <i class="bi bi-circle-fill red"></i>
    } else if( type === "TASK"){
        return <i class="bi bi-gear-wide-connected green"></i>
    } else{
        return <i class="bi bi-info-circle green"></i>
    }
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
  const getFileForNonEditView = (file) => {
    if(file !== null){
        return <div class="drop-zone" style={{textAlign:"left"}} >
                    <a class="file-link" href={"http://localhost:8080/project/" + id +"/file"}><i className="bi bi-file-earmark-arrow-up-fill"></i> {ticket.fileName}</a>
               </div>
    } else {
        return <div class="drop-zone" style={{height:"91px"}}>
                    <div className="drop-zone-prompt-no-value">There are no file yet on this ticket<br/>Update ticket for add</div>
               </div> 
    }
  }
  const deleteAttachment = (e) => {
    if (window.confirm("Are you sure you want to remove attachment?")) {
        e.stopPropagation(); 
        setDeleteInitialFile(true); 
        setFinalFile(null)
    }
  }
  const getFileForEditView = () => {
        return (<div
                    className={`drop-zone ${isOver ? 'over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileClick}
                >
                    {(ticket.fileName === null && finalFile === null) || (finalFile === null && deleteInitialFile)  ? (
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
                        <p>Selected file: {finalFile !== null ? finalFile.name : ticket.fileName} 
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
 const getEstimatedTime = () =>{
    if(estimatedTime < loggedTime){
        return parseInt(estimatedTime) + (loggedTime - estimatedTime);
    } else{
        return estimatedTime;
    }
 }
 const getEstimatedTimeView = () =>{
    if(getEstimatedTime() < 10 ){
        return {marginLeft:"21.5%"};
    } else {
        return {marginLeft:"20%"};
    }
 }

 const getRemainingTime = () =>{
    if(estimatedTime - loggedTime > 0){
        return (estimatedTime - loggedTime).toFixed(1);
    } else{
        return 0;
    }
 }
 const getRemainingTimeView = () =>{
    if(getRemainingTime() < 10 ){
        return {marginLeft:"20%"};
    } else {
        return {marginLeft:"18.2%"};
    }
 }
 const getLoggedTime = () =>{
    if(loggedTime !== null){
        return loggedTime;
    } else{
        return 0;
    }
 }
 const getLoggedTimeView = () =>{
    if(getLoggedTime() < 10 ){
        return {marginLeft:"27%"};
    } else {
        return {marginLeft:"25%"};
    }
 }
  return (
    <div className="single-task">
      {displayError()}
      <div className="container emp-profile">
        <div className="row">
            <div className="col-md-1"><h3>Ticket: </h3></div>
            <div className="col-md-9">
                {editMode 
                ? <input type="text" className='name' defaultValue={ticket.name} onChange={e => setName(e.target.value)}/> 
                : <h3>{ticket.name}</h3>}                 
            </div>
        </div>
        <div className="row">
                <div className="ticket-btn-group col-md-12">
                    {
                        !editMode && ticket.reporter!=undefined 
                            && (cookies.employeeId==ticket.reporter.id || decodedToken.role==="ROLE_ADMIN" || decodedToken.role==="ROLE_MANAGER")
                        && 
                                <button onClick={() => editTicketOnUI()} className="mybtn">
                                    <span><i className="bi bi-pencil-square ticket-icon" ></i></span>
                                    <span> Edit</span>
                                </button>

                    } 
                    <button className="mybtn" onClick={() => setShowTimeModal(true)}>
                        <span>Log work</span>
                    </button>
                </div>
            <div className="col-md-8">
                <div className="row">
                    <div className="col-md-12">
                        <div className="group-name">Details</div>
                        <ul className="property-list">
                            <li className="item">
                                <strong className="name">Type:</strong>
                                <span className="value">{getIconForType(ticket.type)} {ticket.type}</span>
                            </li>
                            <li className="item item-right">
                                <strong className="name">Status:</strong>
                                <span>
                                {editMode 
                                    ? <Form.Select className="status-form" onChange={e => setStatus(e.target.value)}>
                                        <option selected value={ticket.status}>{ticket.status}</option>                    
                                        {
                                            columnOrder.map(column => {
                                                if(column != ticket.status)
                                                    return <option value={column}>{column}</option>;
                                            })
                                        }
                                        </Form.Select>
                                    : <span className="value status-value" style={{backgroundColor:getColorForStatus(ticket.status)}}>{ticket.status}</span>} 
                                </span>
                            </li>
                            <li className="item">
                                <strong className="name">Priority:</strong>
                                <span>
                                {editMode 
                                        ? <Form.Select className="priority-form" onChange={e => setSeverity(e.target.value)}>
                                            <option selected value={ticket.severity}>{ticket.severity}</option>                    
                                            {
                                                severities.map(severity => {
                                                    if(severity != ticket.severity)
                                                        return <option value={severity}>{severity}</option>;
                                                })
                                            }
                                            </Form.Select>
                                        : <span className="value" style={{marginLeft:"21%"}}>{ticket.severity}</span>} 
                                </span>
                            </li>
                            <li className="item item-right">
                                <strong className="name">Git link:</strong>
                                <span >
                                {editMode 
                                    ? <input type="text" className="git-form" defaultValue={ticket.gitRef} onChange={e => setGitLink(e.target.value)}/> 
                                    : <a className="value" style={{marginLeft:"18%"}} target="_blank" href={ticket.gitRef}>{ticket.gitRef}</a>}   
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Dates</div>
                        <ul className="property-list">
                            <li className="item">
                                <strong className="name">Created:</strong>
                                <span className="value">{ticket.createDate != null ? <span>{format(parseISO(ticket.createDate), "do MMMM Y HH:mm")}</span> : '' }</span>
                            </li>
                            <li className="item">
                                <strong className="name">Due time:</strong>
                                <span>
                                {editMode 
                                    ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <DateTimePicker className="date-form" value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                                    </MuiPickersUtilsProvider> 
                                    : ticket.dueDate != null 
                                    ? <span className="value" style={{marginLeft:"18%"}}>{format(parseISO(ticket.dueDate), "do MMMM Y HH:mm")}</span> 
                                    : ''} 
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Description</div>
                        <div>
                            {
                                editMode 
                                ?<textarea className='textarea'
                                    defaultValue={ticket.description} onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
                                : <textarea className='textarea' disabled value={ticket.description} cols="80" rows="6"/>
                            } 
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Attachment</div>
                            {
                                editMode ? getFileForEditView()
                                         : getFileForNonEditView(ticket.fileName)
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
                                            ? <span className='pretty-select' onClick={editMode ? ()=>setShowModal(true) : {}} >
                                                <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} />
                                                &nbsp;{assignee.user.name+' '+ assignee.user.surname}
                                            </span>
                                            : ''
                                        )
                                        : ticket.assignee != null
                                        ? <span className='pretty-select-non-edit' >
                                            <img className="photo" src={`data:image/jpeg;base64,${ticket.assignee.photo}`} />
                                            &nbsp;{ticket.assignee.user.name+' '+ticket.assignee.user.surname}
                                        </span>
                                        : "" } 
                                </span>
                            </li>
                            <li className="item item-people" style={{marginTop:"4%"}}>
                                <strong className="name">Reporter:</strong>
                                <span className="value" style={{marginLeft:"16%"}}>
                                    {ticket.reporter != null
                                    ? <span className='pretty-select-non-edit'>
                                        <img className="photo" src={`data:image/jpeg;base64,${ticket.reporter.photo}`} />
                                        &nbsp;{ticket.reporter.user.name + ' ' + ticket.reporter.user.surname}
                                    </span>
                                    : "" }  
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Time Tracking</div>
                        <ul className="property-list col-md-12">
                            <li className="item item-people">
                                <strong className="name">Estimated:</strong>
                                <span className="value" style={getEstimatedTimeView()}>{getEstimatedTime()} h</span>
                            </li>
                            <li className="item item-people">
                                <strong className="name">Remaining:</strong>
                                <span className="value" style={getRemainingTimeView()} >
                                    {getRemainingTime()} h
                                </span>
                            </li>
                            <li className="item item-people">
                                <strong className="name">Logged:</strong>
                                <span className="value" style={getLoggedTimeView()}>
                                    {getLoggedTime()} h
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>    
        <div className="row">
            <div className="col-md-4"></div>
            <div className="col-md-6 error">
                {errorMessage}
            </div>
        </div>
        {
            editMode
            ?<div style={{overflow:"auto"}}>
                <hr/>
                <div className="row" style={{float:"right"}}>                                            
                    <div className="col-md-6">
                        <input type="submit" onClick={()=>{submitEdit()}} className="btn btn-outline-primary" value="Update" />
                    </div>
                    <div className="col-md-6">
                        <button onClick={()=>{setEditMode(false); setErrorMessage(""); setFinalFile({name: ticket.fileName});}}  
                            className="btn btn-outline-danger">Cancel</button>
                    </div>
                </div>
              </div>
            : ''
        }        
        <div className="row">
            <h5 className="comments-title">Comments</h5>
            <hr/>
            <Comments currentTicketId={id} /> 
        </div>
      </div>  
      <ChooseEmployeeModal 
         show={showModal} 
         onHide={()=>setShowModal(false)} 
         submitChange={(employee) => editAssignee(employee)}                   
         assignee={ticket.assignee} 
         reporter={ticket.reporter} 
         projectId={projectId} 
      />  
      <TimeTrackingModal
        show={showTimeModal} 
        onHide={()=>setShowTimeModal(false)}
        close={setShowTimeModal}
        ticket={ticket}
        loggedTime={loggedTime}
        submitChange={(estTime,logTime) => {setEstimatedTime(estTime); setLoggedTime((parseFloat(loggedTime) + parseFloat(logTime)).toFixed(1));}}
      />
    </div>
  );  
}