import { useState, useEffect} from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { format, parseISO } from "date-fns";
import Form from 'react-bootstrap/Form';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import {logout} from '../Sidebar.js';
import ChooseEmployeeModal from './ChooseEmployeeModal';
import '../../css/CreateTask.css';

export default function CreateTask(props) {
  const [cookies] = useCookies(["token", "employeeId", "projectId"]);
  const[name, setName] = useState(""); 
  const[description, setDescription] = useState(""); 
  const[dueDate, setDueDate] = useState(new Date());
  const[estimatedTime, setEstimatedTime] = useState(0);
  const[assignee, setAssignee] = useState();
  const[gitLink, setGitLink] = useState("");  
  const[editMode, setEditMode] = useState(false); 
  const severities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
  const[severity, setSeverity] = useState(severities[0]);
  const types = ['TASK', 'INFO', 'BUG'];
  const[type, setType] = useState(types[0]);
  const columnOrder = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
  const[status, setStatus] = useState(columnOrder[0]);  
  const[showModal, setShowModal] = useState(false);
  const[errorMessage, setErrorMessage] = useState("");
  const[error, setError] = useState("");
  const[isDisabled, setIsDisabled] = useState(false);

  const displayError = () => {
    if(error!=="")
    {
      alert(error);
      logout();
    }
   }

  const submitCreate = () => {
    if(assignee != null){
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };
    
        let ticket = {
            name: name,
            description: description,
            dueDate: format(dueDate, "yyyy-MM-dd HH:mm"),
            estimatedTime: estimatedTime,
            status: status,
            type: type,
            severity: severity,
            gitRef: gitLink,
            assignee: {id: assignee.id},
            reporter: {id: cookies.employeeId},
        };
    
        const create = async() => {
            await axios
            .post("/project/" + cookies.projectId + "/tickets/",
                ticket,
                config)
            .then(() => {
                props.navigate("dashboard/" + cookies.projectId);
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
        create();
    } else if(assignee == null){
        setErrorMessage("Assignee cannot be empty");
    }  
  }

  const editAssignee = (employee) => {
    setAssignee(employee);
    setShowModal(false);
  }

  return (
    <div className="create-task">
        {displayError()}
      <div className="container emp-profile">        
        <div className="row">
        <div className="col-md-1"></div>
           <div className="col-md-3"></div>
            <div className="col-md-5">
                <h3>Create new ticket:</h3>              
            </div>
        </div>
        <div className="row">
        <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Name:</label>
            </div>
            <div className="col-md-6">
                <input type="text" style={{fontSize:'22px', width:'100%'}} onChange={e => setName(e.target.value)}/>                 
            </div>
        </div>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Description:</label>
            </div>
            <div className="col-md-6">
                <textarea className='textarea' onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Due time:</label>
            </div>
            <div className="col-md-6">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker style={{width:'100%'}} value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                </MuiPickersUtilsProvider>                   
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Estimated time:</label>
            </div>
            <div className="col-md-6">
                <input type="number" min="0" onChange={e => setEstimatedTime(e.target.value)}
                    onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                        }
                    }} />                  
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Status:</label>
            </div>
            <div className="col-md-6">
                <Form.Select onChange={e => setStatus(e.target.value)}>                
                    {
                        columnOrder.map(column => {
                            return <option value={column}>{column}</option>;
                        })
                    }
                </Form.Select>                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Type:</label>
            </div>
            <div className="col-md-6">
                <Form.Select onChange={e => setType(e.target.value)}>                
                    {
                        types.map(type => {
                            return <option value={type}>{type}</option>;
                        })
                    }
                </Form.Select>                    
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Severity:</label>
            </div>
            <div className="col-md-6">
                <Form.Select onChange={e => setSeverity(e.target.value)}>                  
                    {
                        severities.map(severity => {
                            return <option value={severity}>{severity}</option>;
                        })
                    }
                </Form.Select>                  
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Assignee:</label>
            </div>
            <div className="col-md-6">
                {
                    assignee != null
                    ? <div className='pretty-select' onClick={editMode ? ()=>setShowModal(true) : {}} >
                        <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} />
                        &nbsp;&nbsp;{assignee.user.name+' '+ assignee.user.surname}
                    </div>
                    : <button onClick={()=>setShowModal(true)}>Choose...</button>
                }          
            </div>
        </div><hr/>    
        <div className="row">
            <div className="col-md-1"></div>
           <div className="col-md-3">
                <label>Git link:</label>
            </div>
            <div className="col-md-6">
                <input type="text" style={{width:'100%'}} onChange={e => setGitLink(e.target.value)}/>                  
            </div>
        </div><hr/>
        <div>
            <div className="row">
                <div className="col-md-4"></div>
                <div className="col-md-6 error">
                    {errorMessage}
                </div>
            </div>
            <div className="row">                                            
                <div className="col-md-6"></div>
                <div className="col-md-2">
                    <input type="submit" disabled={isDisabled} onClick={()=>{submitCreate(); setIsDisabled(true);}} className="profile-edit-btn" value="Save" />
                </div>
                <div className="col-md-2">
                    <button onClick={()=>props.navigate("dashboard/" + cookies.projectId)} disabled={isDisabled}
                        style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                </div>
            </div>
        </div>
      </div>  
      <ChooseEmployeeModal show={showModal} onHide={()=>setShowModal(false)} submitChange={(employee)=>editAssignee(employee)} 
                           assignee={assignee} reporter={assignee} />  
    </div>
  );  
}