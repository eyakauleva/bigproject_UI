import { useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { format, parseISO } from "date-fns";

import '../../css/Modal.css';
import '../../css/SingleTask.css';


function TaskModal(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [ticket, setTicket] = useState({}); 
  const[description, setDescription] = useState(""); 
  const[createDate, setCreateDate] = useState(""); 
  const[dueDate, setDueDate] = useState("");
  const[estimatedTime, setEstimatedTime] = useState("");
  const[status, setStatus] = useState("");
  const[severity, setSeverity] = useState("");
  const[assignee, setAssignee] = useState({});
  const[reporter, setReporter] = useState({});
  const[gitLink, setGitLink] = useState("");  
  const[editMode, setEditmode] = useState(false);   

  useEffect(() => {
    if(props.id)
        axios
        .get("/project/tickets/" + props.id)
        .then(response => response.data)
        .then(data =>{
            if(data){
                setTicket(data);
                let assignee_ = {
                    name: data.assignee.user.name + " " + data.assignee.user.surname,
                    photo: data.assignee.photo
                }
                setAssignee(assignee_);
            }                 
        })
        .catch((error) => {
            //TODO
        });         
  }, [props.id]);

  return (
    <Modal
      {...props}
      centered>
      <Modal.Header closeButton>
        <Modal.Title>
            {ticket.name}            
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
           <div className="col-md-4">
                <label>Description:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.description} onChange={e => setDescription(e.target.value)}/> 
                : <p>{ticket.description}</p>}                 
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Create time:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.createDate} onChange={e => setCreateDate(e.target.value)}/> 
                : ticket.createDate != null ? <p>{format(parseISO(ticket.createDate), "do MMMM Y HH:mm:ss")}</p> : ''}                 
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Due time:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.dueDate} onChange={e => setDueDate(e.target.value)}/> 
                : ticket.dueDate != null ? <p>{format(parseISO(ticket.dueDate), "do MMMM Y HH:mm:ss")}</p> : ''}                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Estimated time:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.estimatedTime} onChange={e => setEstimatedTime(e.target.value)}/> 
                : ticket.estimatedTime != null ? <p>{ticket.estimatedTime}</p> : ''}                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Status:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.status} onChange={e => setStatus(e.target.value)}/> 
                : <p>{ticket.status}</p>}                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Severity:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.severity} onChange={e => setSeverity(e.target.value)}/> 
                : <p>{ticket.severity}</p>}                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Assignee:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? "" // TODO
                : ticket.assignee 
                ? <img className="photo" src={`data:image/jpeg;base64,${ticket.assignee.photo}`} title={ticket.assignee.user.name+' '+ticket.assignee.user.surname} />
                : "" }           
            </div>
        </div>   
        <div className="row">
           <div className="col-md-4">
                <label>Reporter:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? "" // TODO
                : ticket.reporter 
                ? <img className="photo" src={`data:image/jpeg;base64,${ticket.reporter.photo}`} title={ticket.reporter.user.name+' '+ticket.assignee.user.surname} />
                : "" }           
            </div>
        </div>        
        <div className="row">
           <div className="col-md-4">
                <label>Git link:</label>
            </div>
            <div className="col-md-6">
                {editMode 
                ? <input type="text" defaultValue={ticket.gitRef} onChange={e => setGitLink(e.target.value)}/> 
                : <a target="_blank" href={ticket.gitRef}>{ticket.gitRef}</a>}                    
            </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <p>Comments</p>
      </Modal.Footer>
    </Modal>
  );  
}

export default TaskModal;