import Modal from 'react-bootstrap/Modal';
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { format } from "date-fns";
import axios from "axios";
import Select from 'react-select';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import jwt_decode from "jwt-decode";
import '../../css/task/CreateTask.css';

const CreateTask = (props) =>{
    const [cookies] = useCookies(["token", "project", "employeeId"]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const ttOptions = [
        {value: 'TASK', label: 'TASK'}, 
        {value: 'INFO', label: 'INFO'}, 
        {value: 'BUG' , label: 'BUG' }
    ];
    const priorityOptions = [
        {value: 'LOW', label: 'LOW'}, 
        {value: 'NORMAL', label: 'NORMAL'}, 
        {value: 'HIGH' , label: 'HIGH' },
        {value: 'CRITICAL' , label: 'CRITICAL' }
    ];
    const [selectedTtOption, setSelectedTtOption] = useState(null);
    const [selectedPriorityOption, setSelectedPriorityOption] = useState(null);
    const [selectedProjectOption, setSelectedProjectOption] = useState(null);
    const [selectedEmployeeOption, setSelectedEmployeeOption] = useState(null);
    const [ticketName, setTicketName] = useState("");
    const [gitLink, setGitLink] = useState("");
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [description, setDescription] = useState(""); 
    const [dueDate, setDueDate] = useState(null);
    const [error, setError] = useState("");
    const [projects, setProjects] = useState([]);
    const file = useRef(null);
    const [isOver, setIsOver] = useState(false);
    const [finalFile, setFinalFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [validated, setValidated] = useState(false);
    const [ticketNameErrMessage, setTicketNameErrMessage] = useState("");
 
    useLayoutEffect(() => {        
        getProjects();
    }, []);

    useEffect(() => {        
        if(selectedProjectOption !== undefined && selectedProjectOption !== null) {
            getEmployees(); 
        } else {
            getAllEmployees();
        }
    }, [selectedProjectOption]);

    useEffect(() => {
        projects.map((project) => {
            if(project.id === parseInt(cookies.project)){
                setSelectedProjectOption({value: project, label: project.name});
            }
            return;
        });
    }, [projects]);

    const handleSelectChange = (selectedOption) => {
        setSelectedProjectOption(selectedOption);
    };

    const getProjects = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        let decodedToken = jwt_decode(cookies.token);

        axios
        .get("/employee/user/" + decodedToken.id, config)
        .then(response => response.data)
        .then((data) =>{
            if(data){
                if(data.currentProjects!=null){
                    setProjects(data.currentProjects);
                    let newStateOptions = [];
                    data.currentProjects.map((project) => {
                        let newOption = {value: project, label: project.name};
                        newStateOptions = [...newStateOptions, newOption];
                        return;
                    });
                    setProjectOptions(newStateOptions);
                }
            }                    
        })
        .catch((error) => {
            let code = error.status;
            if(code===401)
                document.cookie = "expired=true; path=/";
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
        });
    };

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
            if(code===401)
                document.cookie = "expired=true; path=/";
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null){
                alert('Internal server error');
            }
        });  
    }
    
    const getEmployees = () => {
        let config = {
          headers: {
            Authorization: 'Bearer ' + cookies.token
          }
        };
        let projectId = 0;
        if(selectedProjectOption !== null){
            projectId = selectedProjectOption.value.id;
        }
        axios
        .get("/project/tickets/" + projectId , config)
        .then(response => response.data)
        .then((data) =>{           
          if(data.employees){
            let newStateOptions = [];
            data.employees.map((employee) => {
                let newOption = {value: employee, label: employee.user.name + " " + employee.user.surname};
                newStateOptions = [...newStateOptions, newOption];
                return;
            });
            setEmployeeOptions(newStateOptions);
          }                    
        })
        .catch((error) => {
            let code = error.status;
            if(code===401)
                document.cookie = "expired=true; path=/";
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null){
                alert('Internal server error');
            }
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

    const submitCreate = (event) => {
        if(validateTicket(event)){
            return;
        }
        if(selectedEmployeeOption !== null){
    
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
            let ticket = {
                name: ticketName,
                description: description,
                dueDate: dueDate !== null ? format(dueDate, "yyyy-MM-dd HH:mm") : null,
                estimatedTime: estimatedTime,
                status: "OPEN",
                type: selectedTtOption.value,
                severity: selectedPriorityOption.value,
                gitRef: gitLink,
                assignee: {id: (selectedProjectOption !== undefined && selectedProjectOption !== null) ? selectedEmployeeOption.value.id : cookies.employeeId},
                reporter: {id: cookies.employeeId}
            };
        
            const create = async() => {
                await axios
                .post("/project/" + selectedProjectOption.value.id + "/tickets/",
                    ticket,
                    config)
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
                            props.close(false);
                            props.navigate("ticket/" + data);
                            return;
                        }
            
                        await axios
                        .put("/project/tickets/" + data + "/file", 
                            file,
                            fileConfig)
                        .then(() => {
                            props.close(false);
                            props.navigate("ticket/" + data);
                        })
                        .catch((error) => {
                            let code = error.toJSON().status;
                            if(code===400 && error.response.data !== null)
                                setErrorMessage(error.response.data.message);
                            else if(code===401)
                                setError('Authorization is required');
                            else if(code===403)
                                alert("Access is denied");     
                            else if(code!==undefined && code!==null) alert('Internal server error');
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
                        document.cookie = "expired=true; path=/";
                    else if(code===401)
                        setError('Authorization is required');
                    else if(code===403)
                        alert("Access is denied");  
                    else if(code!==undefined && code!==null) 
                        alert('Internal server error');
                });        
            }      
            create();
        }  
    }
          
    const clearView = () => {
        setSelectedEmployeeOption(null);
        setSelectedPriorityOption(null);
        setSelectedTtOption(null);
        setDueDate(null);
        setValidated(false);
        setErrorMessage("");
        setTicketNameErrMessage("");
        setTicketName("");
        setDescription("");
        setGitLink("");
        props.close(false);
    }

    const validateTicket = (event) => {
        let isValidated = false;
        if(selectedTtOption === null || 
            selectedPriorityOption === null ||
            selectedTtOption === null){
            isValidated = true;
        }
        if (ticketName === '') {
            isValidated = true;
            setTicketNameErrMessage("Summary can't be empty");
        } else if (ticketName.length > 100 ){
            isValidated = true;
            setTicketNameErrMessage("Summary max length is 100 symbols");
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

    return (<Modal  
        {...props} 
        size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="create-task">
                    {errorMessage && <div className="col-md-12 alert alert-danger" role="alert">
                        {errorMessage}
                    </div>}
                    <div className="form-group row first-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Project<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-sm-9">
                            <Form>
                                <Form.Group controlId="projectForm.SelectCustom">
                                    <Select
                                        options={projectOptions}
                                        value={selectedProjectOption}
                                        onChange={handleSelectChange}
                                        className="item"
                                        placeholder="Select a project"
                                        isSearchable
                                    />
                                </Form.Group>
                            </Form>
                        </div>
                    </div>
                    <div className="form-group row main-item" style={{marginBottom:"3%"}}>
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Ticket Type<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-sm-9">
                            <Form>
                                <Form.Group controlId="ttForm.SelectCustom">
                                    <Select
                                    options={ttOptions}
                                    value={selectedTtOption}
                                    onChange={(selectedOption) => setSelectedTtOption(selectedOption)}
                                    className={validated && !selectedTtOption ? "is-invalid item" : "item"}
                                    placeholder="Select a ticket type"
                                    isSearchable
                                    />
                                    <Form.Control.Feedback type="invalid">
                                            Please select a ticket type
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form>
                        </div>
                    </div>
                    <hr/>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Summary<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-sm-9">
                            <Form.Group controlId="ttForm.SelectCustom">
                                <Form.Control 
                                   className={validated && ticketNameErrMessage ? "is-invalid item-name" : "item-name"} 
                                   type="text" 
                                   placeholder=""
                                   onChange={(e) => {
                                      setTicketName(e.target.value);
                                      if(e.target.value.length <= 100){
                                        setTicketNameErrMessage("");
                                      }
                                     }
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {ticketNameErrMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Priority<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-sm-9">
                                <Form>
                                    <Form.Group controlId="ttForm.SelectCustom">
                                        <Select
                                        options={priorityOptions}
                                        value={selectedPriorityOption}
                                        onChange={(selectedOption) => setSelectedPriorityOption(selectedOption)}
                                        className={validated && !selectedPriorityOption ? "is-invalid item" : "item"}
                                        placeholder="Select a priority"
                                        isSearchable
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please select a priority
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form>
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Git Link</label>
                        </div>
                        <div className="col-sm-9">
                            <Form.Group controlId="ttForm.SelectCustom">
                                <Form.Control className={validated && gitLink.length > 200 ? "is-invalid item-name" : "item-name"} type="text" placeholder="" onChange={(e) => setGitLink(e.target.value)}/>
                                <Form.Control.Feedback type="invalid">
                                    Git link max length is 200 symbols
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Due time</label>
                        </div>
                        <div className="col-sm-9">
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <DateTimePicker className="date-form" value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                                <i className="bi bi-x-lg reset-date" onClick={()=>setDueDate(null)}></i>
                            </MuiPickersUtilsProvider> 
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Estimate</label>
                        </div>
                        <div className="col-sm-9">
                            <Form.Control className="item-name-numer" type="number" defaultValue="" min="0" onChange={(e) => setEstimatedTime(e.target.value)}/>
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Description</label>
                        </div>
                        <div className="col-sm-9">
                            <Form.Group controlId="ttForm.SelectCustom">
                                <textarea className={validated && description.length > 1000 ? "is-invalid textarea" : "textarea"} defaultValue="" onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
                                <Form.Control.Feedback type="invalid">
                                    Description max length is 1000 symbols
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Assignee<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-sm-9">
                            <Form>
                                <Form.Group controlId="projectForm.SelectCustom">
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
                                </Form.Group>
                            </Form>
                        </div>
                    </div>
                    <div className="form-group row main-item">
                        <div className="col-sm-3 label-create">
                            <label for="project" className="col-form-label">Attachment</label>
                        </div>
                        <div className="col-sm-9">
                            { getFileForEditView() }   
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div>                                       
                    <input type="submit"  className="btn btn-outline-primary" onClick={(e) => submitCreate(e)}value="Create" />
                </div>
                <div>
                    <input 
                      type="button" 
                      onClick={() => clearView()}
                      className="btn btn-outline-danger" 
                      value="Cancel" 
                    />
                </div>
            </Modal.Footer>
        </Modal>);
}
export default CreateTask;