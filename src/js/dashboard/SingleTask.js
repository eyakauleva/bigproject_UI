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
import ChooseEmployeeModal from './ChooseEmployeeModal'
import '../../css/SingleTask.css';

export default function SingleTask(props) {
  const[cookies] = useCookies(["token", "employeeId"]);
  const[ticket, setTicket] = useState({}); 
  const[name, setName] = useState(""); 
  const[description, setDescription] = useState(""); 
  const[dueDate, setDueDate] = useState(new Date());
  const[estimatedTime, setEstimatedTime] = useState("");
  const[status, setStatus] = useState("");
  const[severity, setSeverity] = useState("");
  const[type, setType] = useState("");
  const[assignee, setAssignee] = useState({});
  const[gitLink, setGitLink] = useState("");  
  const[selectedFile, setSelectedFile] = useState();
  const[editMode, setEditMode] = useState(false); 
  const {id} = useParams();  
  const severities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
  const types = ["BUG", "INFO", "TASK"];
  const columnOrder = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
  const[showModal, setShowModal] = useState(false);
  const[errorMessage, setErrorMessage] = useState("");
  const[decodedToken, setDecodedToken] = useState({});
  const[error, setError] = useState("");
  const[projectId, setProjectId] = useState();

  const hiddenFileInput = useRef(null);

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
            Authorization: 'Bearer ' + cookies.token,
            'Content-Type': 'multipart/form-data'
        }
    };

    let ticket = {
        name: name,
        description: description,
        dueDate: format(dueDate, "yyyy-MM-dd HH:mm"),
        estimatedTime: estimatedTime,
        status: status,
        severity: severity,
        type: type,
        gitRef: gitLink,
        assignee: {id: assignee.id},
        attachment: selectedFile
    };
    
    const update = async() => {
        await axios
        .put("/project/tickets/" + id, 
            ticket,
            config)
        .then(() => {
            getTicket();
            setEditMode(false);
            setErrorMessage("");
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
    setEstimatedTime(ticket.estimatedTime);
    setStatus(ticket.status);
    setSeverity(ticket.severity);
    setGitLink(ticket.gitRef);
    setAssignee(ticket.assignee);
    setEditMode(true);
  }

  const editAssignee = (employee) => {
    setAssignee(employee);
    setShowModal(false);
  }

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const resetFileInput = () => {
    hiddenFileInput.current.value = null;
    setSelectedFile();
  }
   
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className="single-task">
      {displayError()}
      <div className="container emp-profile">
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-1"><h3>Ticket: </h3></div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" className='name' defaultValue={ticket.name} onChange={e => setName(e.target.value)}/> 
                : <h3>{ticket.name}</h3>}                 
            </div>
            {
                !editMode && ticket.reporter!=undefined 
                    && (cookies.employeeId==ticket.reporter.id || decodedToken.role==="ROLE_ADMIN" || decodedToken.role==="ROLE_MANAGER")
                ?<div className="col-md-3">
                    <div className="button-group-modification">
                        <button onClick={() => editTicketOnUI()} className="mybtn">
                            <span className="hidden_hover" style={{fontSize:"25px"}}><i className="bi bi-pencil-square" ></i></span>
                            <span className="hidden_span">Edit Ticket</span>
                        </button>
                    </div>
                </div>
                : ""
            } 
        </div>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Description:</label>
            </div>
            <div className="col-md-6">
            {
                editMode 
                ?<textarea className='textarea'
                    defaultValue={ticket.description} onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
                : <textarea className='textarea' disabled value={ticket.description} cols="80" rows="6"/>
            } 
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>            
           <div className="col-md-3">
                <label>Create time:</label>
            </div>
            <div className="col-md-6">
                {ticket.createDate != null ? <p>{format(parseISO(ticket.createDate), "do MMMM Y HH:mm")}</p> : '' }             
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Due time:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker style={{width:'100%'}} value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                  </MuiPickersUtilsProvider> 
                : ticket.dueDate != null 
                ? <p>{format(parseISO(ticket.dueDate), "do MMMM Y HH:mm")}</p> 
                : ''}                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Estimated time:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="number" defaultValue={ticket.estimatedTime} min="0" onChange={e => setEstimatedTime(e.target.value)}
                    onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                        }
                    }} /> 
                : ticket.estimatedTime != 0 ? <p>{ticket.estimatedTime} h</p> : '—'}                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Status:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <Form.Select onChange={e => setStatus(e.target.value)}>
                    <option selected value={ticket.status}>{ticket.status}</option>                    
                    {
                        columnOrder.map(column => {
                            if(column != ticket.status)
                                return <option value={column}>{column}</option>;
                        })
                    }
                </Form.Select>
                : <p>{ticket.status}</p>}                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Type:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <Form.Select onChange={e => setType(e.target.value)}>
                    <option selected value={ticket.type}>{ticket.type}</option>                    
                    {
                        types.map(type_ => {
                            if(type_ != ticket.type)
                                return <option value={type_}>{type_}</option>;
                        })
                    }
                </Form.Select>
                : <p>{ticket.type}</p>}                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Severity:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <Form.Select onChange={e => setSeverity(e.target.value)}>
                    <option selected value={ticket.severity}>{ticket.severity}</option>                    
                    {
                        severities.map(severity => {
                            if(severity != ticket.severity)
                                return <option value={severity}>{severity}</option>;
                        })
                    }
                </Form.Select>
                : <p>{ticket.severity}</p>}                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Assignee:</label>
            </div>
            <div className="col-md-6">
                {
                editMode
                ? (
                    assignee != null
                    ? <div className='pretty-select' onClick={editMode ? ()=>setShowModal(true) : {}} >
                        <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} />
                        &nbsp;&nbsp;{assignee.user.name+' '+ assignee.user.surname}
                    </div>
                    : ''
                )
                : ticket.assignee != null
                ? <div className='pretty-select-non-edit' >
                    <img className="photo" src={`data:image/jpeg;base64,${ticket.assignee.photo}`} />
                    &nbsp;&nbsp;{ticket.assignee.user.name+' '+ticket.assignee.user.surname}
                  </div>
                : "" }           
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Reporter:</label>
            </div>
            <div className="col-md-6">
                {ticket.reporter != null
                ? <div className='pretty-select-non-edit'>
                    <img className="photo" src={`data:image/jpeg;base64,${ticket.reporter.photo}`} />
                    &nbsp;&nbsp;{ticket.reporter.user.name+' '+ticket.reporter.user.surname}
                </div>
                : "" }           
            </div>
        </div><hr/>        
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-3">
                <label>Git link:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" style={{width:'100%'}} defaultValue={ticket.gitRef} onChange={e => setGitLink(e.target.value)}/> 
                : <a target="_blank" href={ticket.gitRef}>{ticket.gitRef}</a>}                    
            </div>
        </div><hr/>  
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-3">
                <label>Attachment:</label>
            </div>
            <div className="col-md-6 file-input">
                {
                    editMode
                    ? <div className='file-input'>
                        {selectedFile != undefined ? <div>{selectedFile.name}</div> : <div>{ticket.fileName}</div>}
                        <input type="file" ref={hiddenFileInput} style={{display: "none"}} onChange={(e) => onFileChange(e)}/>
                        {selectedFile != undefined ? <i class="bi bi-x-square" onClick={() => resetFileInput()}></i> : ''}
                        <button onClick={() => handleClick()}>Change...</button>
                    </div>
                    : (ticket.fileName != null
                    ? <a href={"http://localhost:8080/project/" + id +"/file"}>{ticket.fileName}</a>
                    : '—')
                }
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
            ?<div>
                <br/>
                <div className="row">                                            
                    <div className="col-md-6"></div>
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
      </div>  
      <ChooseEmployeeModal show={showModal} onHide={()=>setShowModal(false)} submitChange={(employee)=>editAssignee(employee)} 
                           assignee={ticket.assignee} reporter={ticket.reporter} projectId={projectId} />  
    </div>
  );  
}