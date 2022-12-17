import { useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { useCookies } from 'react-cookie';
import InputGroup from 'react-bootstrap/InputGroup';

import {logout} from './Sidebar.js';
import '.././css/ProjectEmployeesModal.css';

var clearInput;
export {clearInput}
export default function ProjectEmployeesModal(props) {
  const[cookies, setCookie, removeCookie] = useCookies(["token"]);
  const[allEmployees, setAllEmployees] = useState([]);
  const[inputText, setInputText] = useState("");
  const[error, setError] = useState("");

    clearInput = () => {
        setInputText('');
    }

    const displayError = () => {
        if(error!=="")
        {
          logout();
        }
    }

    useEffect(() => {
        if(props.editMode==true)
            getAllEmployes();           
    }, [props.editMode]);

    const getAllEmployes = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        axios
        .get("/employee/all", config)
        .then(response => response.data)
        .then(data =>{
            if(data){
                setAllEmployees(data);       
            }                 
        })
        .catch((error) => {
            let code = error.toJSON().status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);
            else if(code===401)
                setError('Authorization is required');
            else if(code===403)
                alert("Access is denied");
            else alert('Internal server error');
        });   
    }

    const inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
      }

    const filteredAllEmployees =  Object.values(allEmployees).filter((employee) =>{
        let fullName = (employee.user.name + ' ' + employee.user.surname).toLowerCase();
        return fullName.startsWith(inputText);
    });

    const filteredProjectEmployees =  Object.values(props.employees).filter((employee) =>{
        let fullName = (employee.user.name + ' ' + employee.user.surname).toLowerCase();
        return fullName.startsWith(inputText);
    });

    const isEmployeeInProject = (employee_) => {
        let doContain = false;
        Object.values(props.employees).filter((employee) =>{
            if(employee_.id==employee.id)
                doContain = true;
        });
        return doContain;       
    }

    return (
        <Modal className='project-employees-modal'
        {...props}
        centered size="lg">
        {displayError()}
        <Modal.Header closeButton>
            <div style={{width:'80%'}}>
                <InputGroup>
                    <Form.Control placeholder="Name Surname" aria-label="Name Surname" aria-describedby="basic-addon1" onChange={inputHandler} value={inputText} />
                    <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                </InputGroup>
            </div>     
        </Modal.Header>
        <Modal.Body>
            <div>
            { inputText === '' || props.editMode==false
            ? filteredProjectEmployees.map((employee) => 
                <div className='item list-group-item'> 
                    <div className='item-wrapper'>
                        <div>
                            <img className="photo" src={`data:image/jpeg;base64,${employee.photo}`}/>
                        </div>
                        <div className='wrapper'>
                            <div className="name">
                                {employee.user.name+' '+employee.user.surname}
                            </div>
                            <div className="position">
                                <i className="bi bi-briefcase"></i>&nbsp;{employee.position}
                            </div>
                        </div>  
                        {
                            props.editMode===true
                            ? <div className='remove' title='Remove from project' onClick={()=>props.removeFromProject(employee.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#CE3D1D" class="bi bi-x-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </div>
                            : ''
                        }                     
                    </div><hr/>               
                </div> )
            : filteredAllEmployees.map((employee) => 
                <div className='item list-group-item'> 
                    <div className='item-wrapper'>
                        <div>
                            <img className="photo" src={`data:image/jpeg;base64,${employee.photo}`}/>
                        </div>
                        <div className='wrapper'>
                            <div className="name">
                                {employee.user.name + ' ' + employee.user.surname}
                            </div>
                            <div className="position">
                                <i className="bi bi-briefcase"></i>&nbsp;{employee.position}
                            </div>
                        </div>
                        {
                            isEmployeeInProject(employee)
                            ? <div className='remove' title='Remove from project' onClick={()=>props.removeFromProject(employee.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#CE3D1D" class="bi bi-x-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </div>
                            : <div className='remove' title='Add to project' onClick={()=>props.addToProject(employee)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#4A69FF" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                                </svg>
                            </div>
                        }                        
                    </div><hr/>               
                </div> )
                }
            </div>    
        </Modal.Body>
        </Modal>
    );  
}