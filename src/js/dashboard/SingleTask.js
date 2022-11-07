import { useState, useEffect} from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { format, parseISO } from "date-fns";
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import '../../css/SingleTask.css';
import '../../css/Profile.css';

function SingleTask(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [ticket, setTicket] = useState({}); 
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

  useEffect(() => {
    getTicket();              
  }, [id]);

  const getTicket = () => {
    if(id){
        axios
        .get("/project/tickets/" + id)
        .then(response => response.data)
        .then(data =>{
            if(data){
                setTicket(data);                
            }                 
        })
        .catch((error) => {
            //TODO
        });   
    }
  }

  const editProfileOnUI = () => {
    setName(ticket.name);
    setDescription(ticket.description);
    setDueDate(ticket.dueDate);
    setEstimatedTime(ticket.estimatedTime);
    setStatus(ticket.status);
    setSeverity(ticket.severity);
    setGitLink(ticket.gitRef);
    setAssignee({id: ticket.assignee.id});
    setEditMode(true);
  }

  const submitEdit = () => {
    let config = {
        headers: {
            //Authorization: 'Bearer ' + token
        }
        };

        //TODO
        // let assignee_ = {
        //     id: 0 
        // };

        let ticket = {
            name: name,
            description: description,
            dueDate: dueDate,
            estimatedTime: estimatedTime,
            status: status,
            severity: severity,
            gitLink: gitLink,
            assignee: assignee //TODO
        };

        const update = async() => {
            await axios
            .put("/project/tickets/" + id, 
                ticket,
                config)
            .then(() => {
                getTicket();
                setEditMode(false);
            })
            .catch((error) => {
            
            });        
        }      
        update();
  }

  return (
    <div className="profile">
      <div className="container emp-profile">
        <div className="row">
            <div className="col-md-4">
                {/** set project ID dynamically to navigate */}
                <svg onClick={()=> props.navigate("dashboard/1")} className="arrow-back bi bi-arrow-left" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
            </div>
            <div className="col-md-5">
                {editMode 
                ? <input type="text" style={{fontSize:'22px', width:'100%'}} defaultValue={ticket.name} onChange={e => setName(e.target.value)}/> 
                : <p style={{fontSize:'30px', fontWeight:'bold'}}>{ticket.name}</p>}                 
            </div>
            {
                !editMode 
                ?<div className="col-md-3">
                    <button onClick={() => editProfileOnUI()} className="mybtn"><span>Edit Ticket</span></button>
                </div>
                : ""
            } 
        </div>
        <div className="row">
           <div className="col-md-4">
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
           <div className="col-md-4">
                <label>Create time:</label>
            </div>
            <div className="col-md-6">
                {ticket.createDate != null ? <p>{format(parseISO(ticket.createDate), "do MMMM Y HH:mm:ss")}</p> : '' }             
            </div>
        </div><hr/>
        <div className="row">
           <div className="col-md-4">
                <label>Due time:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.dueDate} onChange={e => setDueDate(e.target.value)}/> 
                : ticket.dueDate != null ? <p>{format(parseISO(ticket.dueDate), "do MMMM Y HH:mm:ss")}</p> : ''}                    
            </div>
        </div><hr/>
        <div className="row">
           <div className="col-md-4">
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
                : ticket.estimatedTime != null ? <p>{ticket.estimatedTime} h</p> : ''}                    
            </div>
        </div><hr/>
        <div className="row">
           <div className="col-md-4">
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
           <div className="col-md-4">
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
           <div className="col-md-4">
                <label>Assignee:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? "" // TODO
                : ticket.assignee 
                ? <div><img className="photo" src={`data:image/jpeg;base64,${ticket.assignee.photo}`} />&nbsp;&nbsp;{ticket.assignee.user.name+' '+ticket.assignee.user.surname}</div>
                : "" }           
            </div>
        </div><hr/>
        <div className="row">
           <div className="col-md-4">
                <label>Reporter:</label>
            </div>
            <div className="col-md-6">
                {ticket.reporter 
                ? <div><img className="photo" src={`data:image/jpeg;base64,${ticket.reporter.photo}`} />&nbsp;&nbsp;{ticket.reporter.user.name+' '+ticket.assignee.user.surname}</div>
                : "" }           
            </div>
        </div><hr/>        
        <div className="row">
           <div className="col-md-4">
                <label>Git link:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" style={{width:'100%'}} defaultValue={ticket.gitRef} onChange={e => setGitLink(e.target.value)}/> 
                : <a target="_blank" href={ticket.gitRef}>{ticket.gitRef}</a>}                    
            </div>
        </div><hr/>
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
                        <button onClick={()=>{setEditMode(false);}} 
                            style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                    </div>
                </div>
            </div>
            : <h3>Comments</h3>
        }
      </div>    
    </div>
  );  
}

export default SingleTask;