import { useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { format, parseISO } from "date-fns";

import '../css/Modal.css';
import '../css/SingleTask.css';


function AddTaskModal(props) {
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

  return (
    <Modal
      {...props}
      centered>
      <Modal.Header closeButton>
        <Modal.Title>
            Add Ticket        
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
           <div className="col-md-4">
                <label>Description:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.description} onChange={e => setDescription(e.target.value)}/>                
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Create time:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.createDate} onChange={e => setCreateDate(e.target.value)}/>                 
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Due time:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.dueDate} onChange={e => setDueDate(e.target.value)}/>                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Estimated time:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.estimatedTime} onChange={e => setEstimatedTime(e.target.value)}/>                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Status:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.status} onChange={e => setStatus(e.target.value)}/>                  
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Severity:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.severity} onChange={e => setSeverity(e.target.value)}/>                    
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Assignee:</label>
            </div>
            <div className="col-md-6">
                {/***TODO */}
                <img className="photo"  />       
            </div>
        </div>   
        <div className="row">
           <div className="col-md-4">
                <label>Reporter:</label>
            </div>
            <div className="col-md-6">
                {/***TODO */}
                <img className="photo"  />          
            </div>
        </div>        
        <div className="row">
           <div className="col-md-4">
                <label>Git link:</label>
            </div>
            <div className="col-md-6">
                <input type="text" defaultValue={ticket.gitRef} onChange={e => setGitLink(e.target.value)}/>                  
            </div>
        </div>
        <div>
            <button>Save</button>
        </div>
      </Modal.Body>
    </Modal>
  );  
}

export default AddTaskModal;