import { useState, useLayoutEffect, useRef} from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { format } from "date-fns";
import Form from 'react-bootstrap/Form';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import {logout} from '../Sidebar.js';
import ChooseEmployeeModal from '../dashboard/ChooseEmployeeModal.js';
import '../../css/CreateTask.css';

export default function CreateTask(props) {
  const[cookies] = useCookies(["token", "employeeId"]);
  const[project, setProject] = useState({});
  const[name, setName] = useState(""); 
  const[description, setDescription] = useState(""); 
  const[dueDate, setDueDate] = useState(new Date());
  const[estimatedTime, setEstimatedTime] = useState(0);
  const[assignee, setAssignee] = useState();
  const[gitLink, setGitLink] = useState(""); 
  const severities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
  const[severity, setSeverity] = useState(severities[0]);
  const types = ['TASK', 'INFO', 'BUG'];
  const[type, setType] = useState(types[0]);
  const columnOrder = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
  const[status, setStatus] = useState(columnOrder[0]);  
  const[showModal, setShowModal] = useState(false);
  const[errorMessage, setErrorMessage] = useState("");
  const[error, setError] = useState("");
  const[isDisabled, setIsDisabled] = useState(false);
  const[deleteInitialFile, setDeleteInitialFile] = useState(false);
  const[isOver, setIsOver] = useState(false);
  const file= useRef(null);
  const[finalFile, setFinalFile] = useState(null);

  useLayoutEffect(() => {
    getProject(); 

    props.listenCookieChange(() => {
      getProject(); 
    }, 1000);
  }, []);

  const displayError = () => {
    if(error!=="")
    {
      alert(error);
      logout();
    }
   }

   function getProject(){
    let currentProjectId = document.cookie
                .split("; ")
                .find((row) => row.startsWith("project="))
                ?.split("=")[1];

    if(currentProjectId != undefined){
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };
    
        axios
        .get("/project/tickets/" + currentProjectId, config)
        .then(response => response.data)
        .then((data) =>{
            if(data){
                setProject(data);
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
   }

  const submitCreate = () => {
    if(assignee != null){
        setIsDisabled(true);

        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };
    
        let ticket = {
            name: name,
            description: description,
            dueDate: format(dueDate, "yyyy-MM-dd HH:mm"),
            estimatedTime: estimatedTime,
            status: status,
            type: type,
            severity: severity,
            gitRef: gitLink,
            assignee: {id: assignee.id},
            reporter: {id: cookies.employeeId}
        };
    
        const create = async() => {
            await axios
            .post("/project/" + project.id + "/tickets/",
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
                    if(!deleteInitialFile && finalFile !== null){
                        file = {
                            attachment: finalFile
                        };
                    }
        
                    await axios
                    .put("/project/tickets/" + data + "/file", 
                        file,
                        fileConfig)
                    .then(() => {
                        setIsDisabled(false);
                        props.navigate("dashboard");
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
        }      
        create();
    } else if(assignee == null){
        setErrorMessage("Assignee cannot be empty");
    }  
  }

  const editAssignee = (employee) => {
    setAssignee(employee);
    setShowModal(false);
  }

  const deleteAttachment = (e) => {
    if (window.confirm("Are you sure you want to remove attachment?")) {
        e.stopPropagation(); 
        setDeleteInitialFile(true); 
        setFinalFile(null)
    }
  }
  const getFileForEditView = () => {
        return (<div
                    className={`drop-zone ${isOver ? 'over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileClick}
                >
                    {finalFile === null || (finalFile === null && deleteInitialFile)  ? (
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
                        <p>Selected file: {finalFile !== null ? finalFile.name : ''} 
                           <i 
                             className="bi bi-file-earmark-x-fill delete-file-icon" 
                             onClick={(e) => {deleteAttachment(e)}}
                             >
                           </i>
                        </p>
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

  return (
    <div className="single-task">
      {displayError()}
      <div className="container emp-profile">
        <div className="row">
            <div className="col-md-4">
                <h3><span className='project-name'>[{project.name}]</span>&nbsp;&nbsp;New ticket:</h3>
            </div>
            <div className="col-md-6">
                <input type="text" className='name' onChange={e => setName(e.target.value)}/>                  
            </div>
        </div>
        <div className="row">
            <div className="col-md-8">
                <div className="row">
                    <div className="col-md-12">
                        <div className="group-name">Details</div>
                        <ul className="property-list">
                            <li className="item">
                                <strong className="name">Type:</strong>
                                <span>
                                    <Form.Select className="type-form" onChange={e => setType(e.target.value)}>       
                                        {
                                            types.map(type => {
                                                return <option value={type}>{type}</option>;
                                            })
                                        }
                                    </Form.Select>
                                </span>
                            </li>
                            <li className="item item-right">
                                <strong className="name">Status:</strong>
                                <span>
                                    <Form.Select className="status-form" onChange={e => setStatus(e.target.value)}>       
                                        {
                                            columnOrder.map(column => {
                                                return <option value={column}>{column}</option>;
                                            })
                                        }
                                    </Form.Select>
                                </span>
                            </li>
                            <li className="item">
                                <strong className="name">Priority:</strong>
                                <span>
                                    <Form.Select className="priority-form" onChange={e => setSeverity(e.target.value)}>       
                                        {
                                            severities.map(severity => {
                                                return <option value={severity}>{severity}</option>;
                                            })
                                        }
                                    </Form.Select>
                                </span>
                            </li>
                            <li className="item item-right">
                                <strong className="name">Git link:</strong>
                                <span >
                                    <input type="text" className="git-form" onChange={e => setGitLink(e.target.value)}/> 
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Dates</div>
                        <ul className="property-list">
                            <li className="item">
                                <strong className="name">Due time:</strong>
                                <span>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <DateTimePicker className="date-form" value={dueDate} onChange={setDueDate} format="do MMMM Y HH:mm" />
                                    </MuiPickersUtilsProvider>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Description</div>
                        <div>
                            <textarea className='textarea' onChange={e => setDescription(e.target.value)} cols="80" rows="6"/>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Attachment</div>
                            {getFileForEditView()} 
                    </div>
                </div>  
            </div>
            <div className="col-md-4">
                <div className="row">
                    <div className="col-md-12">
                        <div className="group-name">People</div>
                        <ul className="property-list col-md-12">
                            <li className="item item-people">
                                <strong className="name">Assignee:</strong>
                                <span className="value" style={{marginLeft:"15%"}}>
                                    {
                                        assignee != null
                                        ? <span className='pretty-select' onClick={()=>setShowModal(true)} >
                                            <img className="photo" src={`data:image/jpeg;base64,${assignee.photo}`} />
                                            &nbsp;{assignee.user.name+' '+ assignee.user.surname}
                                        </span>
                                        : <button onClick={()=>setShowModal(true)}>Choose...</button>
                                    }
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-12">
                        <div className="group-name">Time Tracking</div>
                        <ul className="property-list col-md-12">
                            <li className="item item-people">
                                <strong className="name">Estimated:</strong>
                                <input type="number" min="0" onChange={e => setEstimatedTime(e.target.value)}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }} />     
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>    
        <div className="row">
            <div className="col-md-10"></div>
            <div className="col-md-2 error">
                {errorMessage}
            </div>
        </div>
        {
            <div style={{overflow:"auto"}}>
                <hr/>
                <div className="row" style={{float:"right"}}>                                            
                    <div className="col-md-6">
                        <input type="submit" disabled={isDisabled} style={isDisabled ? {backgroundColor:"grey"} : {}}
                            onClick={()=>{submitCreate()}} className="btn btn-outline-primary" value="Save" />
                    </div>
                    <div className="col-md-6">
                        <button onClick={()=>props.navigate("dashboard/" + project.id)} disabled={isDisabled}
                            style={isDisabled ? {backgroundColor:"grey"} : {}}
                            className="btn btn-outline-danger">Cancel</button>
                    </div>
                </div>
            </div>
        }
      </div>  
      <ChooseEmployeeModal 
         show={showModal} 
         onHide={()=>setShowModal(false)} 
         submitChange={(employee) => editAssignee(employee)}                   
         assignee={assignee} 
         reporter={assignee} 
         projectId={project.id} 
      />
    </div>
  );   
}