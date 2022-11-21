import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { useCookies } from 'react-cookie';

import '../css/Modal.css';
import '../css/SingleTask.css';
import '.././css/Users.css';

export default function EmployessInProjectModal(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const[name, setName] = useState(""); 
  const[description, setDescription] = useState(""); 
  const[git, setGit] = useState("");
  const[employees, setEmployees] = useState([]);
  // other fields ???

  const addEmployee = () => {
    let config = {
        headers: {
            //Authorization: 'Bearer ' + token
        }
    };

    let project = {
        name: name,
        description: description,
        git: git,
        employees: employees
    };        

    // axios
    // .post("/employee/new", 
    //     employee,
    //     config)
    // .then(() => {
    //     props.onHide();
    //     //props.getEmployees();
    // })
    // .catch((error) => {
    //     //TODO
    // });            
  }

  return (
    <Modal
      {...props}
      centered>
      <Modal.Header closeButton>
        <Modal.Title>
            Create New Project          
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>    
        <div className="row">
           <div className="col-md-4">
                <label>Name:</label>
            </div>
            <div className="col-md-6">
                <input type="text" onChange={e => setName(e.target.value)} style={{width:"100%"}}/>                 
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Description:</label>
            </div>
            <div className="col-md-6">
                <input type="text" onChange={e => setDescription(e.target.value)} style={{width:"100%"}}/>                    
            </div>
        </div>     
        <div className="row">
           <div className="col-md-4">
                <label>Git:</label>
            </div>
            <div className="col-md-6">
                <input type="text" onChange={e => setGit(e.target.value)} style={{width:"100%"}}/>                    
            </div>
        </div>  
      </Modal.Body>
      <Modal.Footer>
        <div>
            <button className="add-btn" onClick={()=>addEmployee()} style={{marginLeft:"0"}}>Add employee account</button>
        </div>
      </Modal.Footer>
    </Modal>
  );  
}