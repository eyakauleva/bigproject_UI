import React from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useState, useEffect} from 'react';
import { format, parseISO, formatISO } from "date-fns";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import ChooseEmployeeModal from './dashboard/ChooseEmployeeModal'
import '../css/ProjectPage.css';
import '../css/Profile.css';

export default function CreateProject(props) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const[name, setName] = useState(""); 
    const[description, setDescription] = useState(""); 
    const[dueDate, setDueDate] = useState(new Date());
    const[assignee, setAssignee] = useState();
    const[reporter, setReporter] = useState();
    const[employees, setEmployees] = useState([]);
    const[gitLink, setGitLink] = useState("");
    const[showModal, setShowModal] = useState(false);
    const[flag, setFlag] = useState(false);

    useEffect(() => {    
        //TODO set reporter automatically    
        setReporter({id: 2, user:{name:'name2', surname:'surname2'}, photo:''});
    }, []);

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

    const submitCreateProject = () => {
        let config = {
            headers: {
                //TODO Authorization: 'Bearer ' + token
            }
        };

        let employeesId = [];
        employees.forEach((employee)=>{
            employeesId.push({id: employee.id});
        });

        // console.log(dueDate);
        // console.log('---' + format(dueDate, "yyyy-MM-dd 00:00"));
    
        let project = {
            assignee: {id: assignee.id},
            reporter: {id: reporter.id},
            name: name,
            description: description,
            dueDate: format(dueDate, "yyyy-MM-dd 00:00"),
            employees: employeesId,
            gitRef: gitLink
        };        
    
        axios
        .post("/project", project)
        .then(() => {
            props.navigate("projects");
        })
        .catch((error) => {
            //TODO
        });   
    }
    
    return (
        <div className="profile">
            <div className="container emp-profile">
                <div className="row">
                    <div className="col-md-4">
                    </div>
                    <div className="col-md-5">
                            <p style={{fontSize:'30px', fontWeight:'bold'}}>Create new project</p>              
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Name:</label>
                    </div>
                    <div className="col-md-6">
                        <input type="text" onChange={(e)=>setName(e.target.value)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Description:</label>              
                    </div>
                    <div className="col-md-6">
                        <textarea className='textarea' onChange={(e)=>setDescription(e.target.value)} cols="80" rows="6"/>
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
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
                    <div className="col-md-4">
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
                    <div className="col-md-4">
                        <label>Reporter (GET REPORTER ID FROM COOKIES AND DELETE THIS INPUT):</label>
                    </div>
                    <div className="col-md-6">
                        <div className='pretty-select'>
                            <img className="photo" src={`data:image/jpeg;base64,${reporter != null ? reporter.photo : ''}`} />
                            &nbsp;&nbsp;{ reporter != null ? reporter.user.name+' '+ reporter.user.surname : ''}
                        </div>       
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
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
                                <i onClick={()=>removeEmployeeFromList(employee.id)} className="bi bi-x-lg pretty-select" style={{padding:'2px'}}></i>
                            </div>)
                            :''
                        }       
                    </div>
                </div><hr/>          
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <label>Git link:</label>
                    </div>
                    <div className="col-md-6">
                        <input type="text" onChange={(e)=>setGitLink(e.target.value)} />
                    </div>
                </div>
                <div>
                    <br/>
                    <div className="row">                                            
                            <div className="col-md-7"></div>
                            <div className="col-md-2">
                                <input type="submit" className="profile-edit-btn" onClick={()=>submitCreateProject()} value="Save" />
                            </div>
                            <div className="col-md-2">
                                <button onClick={()=> props.navigate("projects")}
                                    style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                            </div>
                    </div>
                </div>                                                            
            </div>  
            <ChooseEmployeeModal show={showModal} onHide={()=>setShowModal(false)} submitChange={(employee)=>editAssignee(employee)} 
                           assignee={assignee} reporter={reporter} />  
        </div>
    );
}