import React from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useState, useEffect, useRef} from 'react';
import { format} from "date-fns";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useParams } from 'react-router-dom';

import {logout} from './Sidebar.js';
import ChooseEmployeeModal from './dashboard/ChooseEmployeeModal'
import '../css/CreateProject.css';

export default function CreateProject(props) {
    const[cookies, setCookie, removeCookie] = useCookies(["token", "employeeId"]);
    const[name, setName] = useState(""); 
    const[description, setDescription] = useState(""); 
    const[dueDate, setDueDate] = useState(new Date());
    const[assignee, setAssignee] = useState();
    const[employees, setEmployees] = useState([]);
    const[gitLink, setGitLink] = useState("");
    const[showModal, setShowModal] = useState(false);
    const[flag, setFlag] = useState(false);
    const {id} = useParams(); 
    const[errorMessage, setErrorMessage] = useState("");
    const[error, setError] = useState("");
    const[isDisabled, setIsDisabled] = useState(false);
    const[selectedFile, setSelectedFile] = useState();
    const hiddenFileInput = useRef(null);

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
    }

    const editAssignee = (employee) => {
        if(flag){
            if(employees.length > 0)
                removeEmployeeFromList(employee.id);
            employees.push(employee);
        }            
        else setAssignee(employee);
        setShowModal(false);
    }

    const removeEmployeeFromList = (id) => {
        employees.forEach((employee, index) => {
            if(employee.id === id){
                employees.splice(index, 1);
                setFlag(!flag); //to make component rerender
                return;
            }
        });
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

    const submitCreateProject = () => {
        if(assignee != null){ 
            setIsDisabled(true);

            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            let employeesId = [];
            let isAssigneeAdded = false;
            let isReviewerAdded = false;
            employees.forEach((employee)=>{
                employeesId.push({id: employee.id});
                if(employee.id == assignee.id){
                    isAssigneeAdded = true;
                }
                if(employee.id == cookies.employeeId){
                    isReviewerAdded = true;
                }
            });

            if(!isAssigneeAdded){
                employeesId.push({id: assignee.id});
            }
            if(!isReviewerAdded && cookies.employeeId != assignee.id){
                employeesId.push({id: cookies.employeeId});
            }
        
            let project = {
                assignee: {id: assignee.id},
                reporter: {id: cookies.employeeId},
                name: name,
                description: description,
                dueDate: format(dueDate, "yyyy-MM-dd 00:00"),
                employees: employeesId,
                gitRef: gitLink
            };        
        
            axios
            .post("/project/create/" + id, project, config)
            .then(response => response.data)
            .then(data => {
                const updateFile = async() => {
                    let fileConfig = {
                        headers: {
                            Authorization: 'Bearer ' + cookies.token,
                            'Content-Type': 'multipart/form-data'
                        }
                    };
        
                    let file = {
                        attachment: selectedFile
                    };
        
                    await axios
                    .put("/project/tickets/" + data + "/file", 
                        file,
                        fileConfig)
                    .then(() => {
                        setIsDisabled(false);
                        props.navigate("projects");
                    })
                    .catch((error) => {
                        setIsDisabled(false);
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
                updateFile();
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
                setIsDisabled(false);
            });   
        } else if(assignee == null){
            setErrorMessage("Assignee cannot be empty");
        }     
    }
    
    return (
        <div className="create-project">
            {displayError()}
            <div className="container emp-profile">
                <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-5">
                            <p style={{fontSize:'30px', fontWeight:'bold'}}>Create new project</p>              
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Name:</label>
                    </div>
                    <div className="col-md-6">
                        <input type="text" onChange={(e)=>setName(e.target.value)} />
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Description:</label>              
                    </div>
                    <div className="col-md-6">
                        <textarea className='textarea' onChange={(e)=>setDescription(e.target.value)} cols="80" rows="6"/>
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Due date:</label>
                    </div>
                    <div className="col-md-6">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker style={{width:'100%'}} value={dueDate} onChange={setDueDate} format="do MMMM Y" />
                        </MuiPickersUtilsProvider>          
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
                            ? <div className='pretty-select' onClick={()=>{setShowModal(true); setFlag(false);}} >
                                <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} />
                                &nbsp;&nbsp;{assignee.user.name+' '+ assignee.user.surname}
                              </div>
                            : <button onClick={()=>{setShowModal(true); setFlag(false);}}>Choose...</button>
                        }
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Employees:</label>
                    </div>
                    <div className="col-md-6">
                        <button onClick={()=>{setShowModal(true); setFlag(true);}}>Choose...</button>
                        {
                            employees.length > 0
                            ? employees.map((employee)=>
                            <div className='pretty-select' style={{paddingLeft:'5%'}}>
                                <img className="photo" src={`data:image/jpeg;base64,${employee != null ? employee.photo : ''}`} />
                                <span>&nbsp;&nbsp;{ employee.user != null ? employee.user.name+' '+ employee.user.surname : ''}&nbsp;&nbsp;</span>
                                <i onClick={()=>removeEmployeeFromList(employee.id)} className="bi bi-x-lg remove-employee"></i>
                            </div>)
                            :''
                        }       
                    </div>
                </div><hr/>          
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Git link:</label>
                    </div>
                    <div className="col-md-6">
                        <input type="text" onChange={(e)=>setGitLink(e.target.value)} />
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Attach file:</label>
                    </div>
                    <div className="col-md-6 file-input">
                        {selectedFile != undefined ? <div>{selectedFile.name}</div> : ''}
                        <input type="file" ref={hiddenFileInput} style={{display: "none"}} onChange={(e) => onFileChange(e)}/>
                        {selectedFile != undefined ? <i class="bi bi-x-square" onClick={() => resetFileInput()}></i> : ''}
                        <button onClick={() => handleClick()}>Choose...</button>  
                    </div>
                </div><br/>
                <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-6 error">
                        {errorMessage}
                    </div>
                </div>
                <div>
                    <br/>
                    <div className="row">                                            
                            <div className="col-md-8"></div>
                            <div className="col-md-1">
                                <input type="submit" className="profile-edit-btn" disabled={isDisabled} style={isDisabled ? {backgroundColor:"grey"} : {}}
                                        onClick={()=>{submitCreateProject()}} value="Save" />
                            </div>
                            <div className="col-md-1">
                                <button onClick={()=> props.navigate("orders")}
                                    style={isDisabled ? {backgroundColor:"grey"} : {background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                            </div>
                    </div>
                </div>                                                            
            </div>  
            <ChooseEmployeeModal show={showModal} onHide={()=>setShowModal(false)} submitChange={(employee)=>editAssignee(employee)} 
                           assignee={assignee} reporter={assignee} />  
        </div>
    );
}