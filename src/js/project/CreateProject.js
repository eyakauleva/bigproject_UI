import React from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useState, useLayoutEffect, useRef} from 'react';
import { format } from "date-fns";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Select from 'react-select';

import {logout} from '../Sidebar.js';
import ChooseEmployeeModal from '../dashboard/ChooseEmployeeModal.js'
import '../../css/CreateProject.css';

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
    const priorityOptions = [
        {value: 'LOW', label: 'LOW'}, 
        {value: 'NORMAL', label: 'NORMAL'}, 
        {value: 'HIGH' , label: 'HIGH' },
        {value: 'CRITICAL' , label: 'CRITICAL' }
    ];
    const [selectedPriorityOption, setSelectedPriorityOption] = useState(null);
    const [validated, setValidated] = useState(false);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedEmployeeOption, setSelectedEmployeeOption] = useState(null);
    const file = useRef(null);
    const [isOver, setIsOver] = useState(false);
    const [finalFile, setFinalFile] = useState(null);
    const [nameErrMessage, setNameErrMessage] = useState("");

    useLayoutEffect(() => {
        getAllEmployees();  
    }, []);

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

    const submitCreateProject = (event) => {
        if(validateTicket(event)){
            return;
        }
        if(selectedEmployeeOption != null){ 
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
                if(employee.id == selectedEmployeeOption.value.id){
                    isAssigneeAdded = true;
                }
                if(employee.id == cookies.employeeId){
                    isReviewerAdded = true;
                }
            });

            if(!isAssigneeAdded){
                employeesId.push({id: selectedEmployeeOption.value.id});
            }
            if(!isReviewerAdded && cookies.employeeId != selectedEmployeeOption.value.id){
                employeesId.push({id: cookies.employeeId});
            }
        
            let project = {
                assignee: {id: selectedEmployeeOption.value.id},
                reporter: {id: cookies.employeeId},
                name: name,
                description: description,
                dueDate: format(dueDate, "yyyy-MM-dd 00:00"),
                severity: selectedPriorityOption.value,
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
        
                    let file;
                    if(finalFile !== null){
                        file = {
                            attachment: finalFile
                        };
                    } else{
                        setIsDisabled(false);
                        props.navigate("projects");
                        return;
                    }
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
                        else if(code===401){
                            document.cookie = "expired=true; path=/";
                        }
                        else if(code===403)
                            alert("Access is denied"); 
                        else if(code!==undefined && code!==null) 
                            alert('Internal server error');
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
                else if(code===401){
                    document.cookie = "expired=true; path=/";
                }
                else if(code===403)
                    alert("Access is denied"); 
                else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
                setIsDisabled(false);
            });   
        }    
    }
    const getAllEmployees = () => {
        let config = {
          headers: {
            Authorization: 'Bearer ' + cookies.token
          }
        };
    
        axios
        .get("/employee/all", config)
        .then(response => response.data)
        .then((data) =>{            
          if(data){
            let newStateOptions = [];
            data.map((employee) => {
                let newOption = {value: employee, label: employee.user.name + " " + employee.user.surname};
                newStateOptions = [...newStateOptions, newOption];
                return;
            });
            setEmployeeOptions(newStateOptions);
          }                    
        })
        .catch((error) => {
            let code = error.status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);
            else if(code===401){
                document.cookie = "expired=true; path=/";
            }
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null) 
                alert('Internal server error');
        });  
    }
    const getFileForEditView = () => {
        return (<div
                    className={`drop-zone ${isOver ? 'over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileClick}
                >
                    {finalFile === null  ? (
                    <>
                        <span className="drop-zone__prompt">Drag and drop files here or click to select</span>
                        <input 
                            type="file" 
                            name="file" 
                            ref={file}
                            onChange={handleFileChange} 
                            className="drop-zone__input" 
                        />
                    </>
                    ) : (
                    <>
                        <input 
                            type="file" 
                            name="file" 
                            ref={file}
                            onChange={handleFileChange} 
                            className="drop-zone__input" 
                        />
                        <span>Selected file: {finalFile.name} 
                           <i 
                             className="bi bi-file-earmark-x-fill delete-file-icon" 
                             onClick={(e) => {deleteAttachment(e)}}
                             >
                           </i>
                        </span>
                    </>
                    )}
                </div>);
    }

    const handleFileClick = () => {
        file = file.current.click();
        setFinalFile(file);
    };

    const handleDragOver = e => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = e => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        setFinalFile(droppedFile);
        setIsOver(false);
    };

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        setFinalFile(selectedFile);
    };

    const deleteAttachment = (e) => {
        e.stopPropagation(); 
        setFinalFile(null)
    }
    const validateTicket = (event) => {
        let isValidated = false;
        if(selectedPriorityOption === null){
            isValidated = true;
        }
        if (name === '') {
            isValidated = true;
            setNameErrMessage("Summary can't be empty");
        } else if (name.length > 100 ){
            isValidated = true;
            setNameErrMessage("Summary max length is 100 symbols");
        }
        if((!gitLink && gitLink.length > 200) ||
            !description && description.length > 1000){
            isValidated = true;
        }
        if(isValidated){
            event.stopPropagation();
            setValidated(true);
        }
        return isValidated;
        
    }
    return (
        <div className="create-project">
            {displayError()}
            <div className="container emp-profile">
                <div className="row">
                    <div className="col-md-12">
                            <h3 className="title-create-project">Create Project</h3>              
                    </div>
                    {errorMessage && <div className="col-md-12 alert alert-danger" role="alert">
                                        {errorMessage}
                                     </div>}
                    <div className="col-md-12 row items">
                        <div className="col-md-3 item-name">
                            <label>Summary<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-md-8 item-value">
                            <input 
                              type="text" 
                              className={validated && nameErrMessage ? "is-invalid item-input" : "item-input"} 
                              onChange={(e)=>{
                                setName(e.target.value);
                                if(e.target.value.length <= 100){
                                    setNameErrMessage("");
                                  }
                              }} 
                            />
                            <Form.Control.Feedback type="invalid" style={{marginLeft:"1%"}}>
                                {nameErrMessage}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-sm-3 item-name">
                            <label for="project" className="col-form-label">Priority<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-sm-8 item-value">
                            <Select
                            options={priorityOptions}
                            value={selectedPriorityOption}
                            onChange={(selectedOption) => setSelectedPriorityOption(selectedOption)}
                            className={validated && !selectedPriorityOption ? "is-invalid item-select-input" : "item-select-input"}
                            placeholder="Select a priority"
                            isSearchable
                            />
                            <Form.Control.Feedback type="invalid" style={{marginLeft:"1%"}}>
                                Please select a priority
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-md-3 item-name">
                            <label>Description</label>              
                        </div>
                        <div className="col-md-8 item-value">
                            <textarea className="textarea" onChange={(e)=>setDescription(e.target.value)} cols="80" rows="6"/>
                        </div>
                    </div>
                    <div className="col-md-3 item-name">
                        <label>Due date</label>
                    </div>
                    <div className="col-md-8 item-value">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker value={dueDate} className="item-dd-input" style={{padding:"0"}}onChange={setDueDate} format="do MMMM Y" />
                            <i className="bi bi-x-lg reset-date" onClick={()=>setDueDate(null)}></i>
                        </MuiPickersUtilsProvider>          
                    </div>
                    <div className="col-md-3 item-name">
                        <label>Assignee<span className="text-danger">*</span></label>
                    </div>
                    <div className="col-md-8 item-value">  
                        <Select
                            options={employeeOptions}
                            value={selectedEmployeeOption}
                            onChange={(selectedOption) => setSelectedEmployeeOption(selectedOption)}
                            className={validated && !selectedEmployeeOption ? "is-invalid item" : "item"}
                            placeholder="Select an assignee"
                            menuPlacement="auto"
                            isSearchable
                        />
                        <Form.Control.Feedback type="invalid">
                                Please select an assignee
                        </Form.Control.Feedback>
                    </div>
                    <div className="col-md-3 item-name">
                        <label>Employees:</label>
                    </div>
                    <div className="col-md-8 item-value">
                        <button className="btn btn-outline-secondary emp-btn" onClick={()=>{setShowModal(true); setFlag(true);}}>Choose...</button>
                        {employees.length > 0 && <hr/>} 
                        <div className="pretty-select">
                            {
                                employees.length > 0
                                && employees.map((employee)=>
                                <div>
                                    <img className="photo" src={`data:image/jpeg;base64,${employee != null ? employee.photo : ''}`} />
                                    <span className="emp-name">&nbsp;{ employee.user != null ? employee.user.name+' '+ employee.user.surname : ''}</span>
                                    <i onClick={()=>removeEmployeeFromList(employee.id)} className="bi bi-x-lg remove-employee"></i>
                                </div>)
                            }  
                        </div>     
                    </div>
                    <div className="col-md-3 item-name">
                        <label>Git link</label>
                    </div>
                    <div className="col-md-8 item-value">
                        <input type="text" className={validated && gitLink.length > 200 ? "is-invalid item-input" : "item-input"} style={{marginLeft:"0"}} onChange={(e)=>setGitLink(e.target.value)} />
                        <Form.Control.Feedback type="invalid">
                            Git link max length is 200 symbols
                        </Form.Control.Feedback>
                    </div>
                    <div className="col-md-3 item-name">
                        <label>Attachment</label>
                    </div>
                    <div className="col-md-8 item-value">
                        { getFileForEditView() } 
                    </div>
                    <div style={{overflow:"auto"}}>
                        <hr/>
                        <div className="row" style={{float:"right"}}>          
                            <div className="col-md-6">                                     
                                <input type="submit" className="btn btn-outline-primary" disabled={isDisabled}
                                        onClick={(e)=>{submitCreateProject(e)}} value="Create" />
                            </div>
                            <div className="col-md-6">   
                                <button onClick={()=> props.navigate("orders")} className="btn btn-outline-danger" disabled={isDisabled}>Cancel</button>
                            </div>
                        </div> 
                    </div> 
                 </div>                                                          
            </div>  
            <ChooseEmployeeModal show={showModal} onHide={()=>setShowModal(false)} submitChange={(employee)=>editAssignee(employee)} 
                           assignee={assignee} reporter={assignee} />  
        </div>
    );
}