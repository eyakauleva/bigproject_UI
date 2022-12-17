import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format } from "date-fns";

import {logout} from './Sidebar.js';
import '.././css/Users.css';

export default function AddEmployeeModal(props) {
  const[cookies, setCookie, removeCookie] = useCookies(["token"]);
  const[role, setRole] = useState("EMPLOYEE"); 
  const[name, setName] = useState(""); 
  const[surname, setSurname] = useState(""); 
  const[position, setPosition] = useState("");
  const[email, setEmail] = useState("");
  const[startDate, setStartDate] = useState(new Date());
  const[errorMessage, setErrorMessage] = useState("");
  const[error, setError] = useState("");

  const displayError = () => {
    if(error!=="")
    {
      alert(error);
      logout();
    }
  }

  const addEmployee = () => {
    let config = {
        headers: {
            Authorization: 'Bearer ' + cookies.token
        }
    };

    let user = {
        role: role,
        name: name,
        surname: surname,
        email: email
    }

    let employee = {
        user: user,
        position: position,        
        startDate: format(startDate, "yyyy-MM-dd")
    };        

    axios
    .post("/employee/new", 
        employee,
        config)
    .then(() => {
        props.onHide();
        props.getEmployees();
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

  return (
    <Modal className='add-employee-modal'
      {...props}
      centered>
        {displayError()}
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
                    <option value="ROLE_MANAGER">MANAGER</option>
                    <option selected value="ROLE_EMPLOYEE">EMPLOYEE</option>
                    <option value="ROLE_ADMINISTRATOR">ADMINISTRATOR</option>
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
                <label>Email:</label>
            </div>
            <div className="col-md-6">
                <input type="email" onChange={e => setEmail(e.target.value)} style={{width:"100%"}}/>                    
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
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker style={{width:'100%'}} value={startDate} onChange={setStartDate} format="do MMMM Y" />
                </MuiPickersUtilsProvider>                     
            </div>
        </div>
        <div className="row">
           <div className="col-md-10 error">
                {errorMessage}
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