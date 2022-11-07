import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { useCookies } from 'react-cookie';

import '../css/Modal.css';
import '../css/SingleTask.css';
import '.././css/Users.css';

function AddEmployeeModal(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [role, setRole] = useState("EMPLOYEE"); 
  const[name, setName] = useState(""); 
  const[surname, setSurname] = useState(""); 
  const[position, setPosition] = useState("");
  const[startDate, setStartDate] = useState("");

  const addEmployee = () => {
    let config = {
        headers: {
            //Authorization: 'Bearer ' + token
        }
    };

    let user = {
        role: role,
        name: name,
        surname: surname
    }

    let employee = {
        user: user,
        position: position,
        startDate: startDate
    };        

    axios
    .post("/employee/new", 
        employee,
        config)
    .then(() => {
        props.onHide();
        props.getEmployees();
    })
    .catch((error) => {
        //TODO
    });            
  }

  return (
    <Modal
      {...props}
      centered>
      <Modal.Header closeButton>
        <Modal.Title>
            Add Employee Account           
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
           <div className="col-md-4">
                <label>Role:</label>
            </div>
            <div className="col-md-6">
                <Form.Select onChange={e => setRole(e.target.value)}>
                    <option value="MANAGER">MANAGER</option>
                    <option selected value="EMPLOYEE">EMPLOYEE</option>
                </Form.Select>                
            </div>
        </div>        
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
                <label>Surname:</label>
            </div>
            <div className="col-md-6">
                <input type="text" onChange={e => setSurname(e.target.value)} style={{width:"100%"}}/>                    
            </div>
        </div>     
        <div className="row">
           <div className="col-md-4">
                <label>Position:</label>
            </div>
            <div className="col-md-6">
                <input type="text" onChange={e => setPosition(e.target.value)} style={{width:"100%"}}/>                    
            </div>
        </div> 
        <div className="row">
           <div className="col-md-4">
                <label>Start date:</label>
            </div>
            <div className="col-md-6">
                <input type="text" onChange={e => setStartDate(e.target.value)} style={{width:"100%"}}/>                    
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

export default AddEmployeeModal;