import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import axios from "axios";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { format, parseISO } from "date-fns";
import { useParams } from 'react-router-dom';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import '.././css/Profile.css';
import ChangePasswordModal from './ChangePasswordModal';

export default function Profile(props) {
    const[cookies, setCookie] = useCookies(["token", "employeeId"]);
    const[employee, setEmployee] = useState({});
    const[user, setUser] = useState({});
    const[currProjects, setCurrProjects] = useState([]);
    const[name, setName] = useState("");
    const[surname, setSurname] = useState("");
    const[email, setEmail] = useState("");
    const[phone, setPhone] = useState("");
    const[birthDate, setBirthDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const[technologies, setTechnologies] = useState("");
    const[position, setPosition] = useState("");
    const[selectedImage, setSelectedImage] = useState(null);
    const[editMode, setEditmode] = useState(false);  
    const{id} = useParams();   
    const[showModal, setShowModal] = useState(true);
    const[errorMessage, setErrorMessage] = useState("");
    const[decodedToken, setDecodedToken] = useState({});
    const[error, setError] = useState("");

    useEffect(() => {        
        getEmployee();
    }, []);

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
    }

    const getEmployee = async () => {
        if(id){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };

            await axios
            .get("/employee/" + id, config)
            .then(response => response.data)
            .then((data) =>{
                if(data){
                    setEmployee(data);
                    setUser(data.user);
                    setCurrProjects(data.currentProjects.sort((a, b) => a.id > b.id ? 1 : -1)); 
                    setPosition(data.position);      
                    setDecodedToken(jwt_decode(cookies.token));
                }                    
            })
            .catch((error) => {                
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const editProfileRequest = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        let user = {
            name: name,
            surname: surname,
            email: email,
            phone: phone
        };

        let res = null;
        if(selectedImage!=null){
            res = selectedImage;
            res = res.substring(res.indexOf(',') + 1);
        }
        
        let employee = {
            user: user,
            birthDate: format(birthDate, "yyyy-MM-dd"),
            position: position,
            technologies: technologies,
            photo: res
        };

        const update = async() => {
            await axios
            .put("/employee/" + id, 
                employee,
                config)
            .then(() => {
                getEmployee();
                setEditmode(false);
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
        update();
    }

    const uploadPhoto = (e) => {
        const file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {            
            setSelectedImage(reader.result);
        };
    }

    const editProfileOnUI = () => {
        setName(user.name);
        setSurname(user.surname);
        setEmail(user.email);
        setPhone(user.phone);
        setBirthDate(parseISO(employee.birthDate));
        setTechnologies(employee.technologies);
        setEditmode(true);
    }

    const blockUser = () => {
        if(window.confirm("Are you sure you want to block this user?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            axios
            .put("/user/" + user.id + "/block",
                null,
                config)
            .then(()=>{
                alert("User is blocked");
                getEmployee();
            })
            .catch((error) => {
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
    }

    const deactivateUser = () => {
        if(window.confirm("Are you sure you want to deactivate this user?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            axios
            .put("/user/" + user.id + "/deactivate",
                null,
                config)
            .then(()=>{
                alert("User is deactivated");
                getEmployee();
            })
            .catch((error) => {
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
    }

    const activateUser = () => {
        if(window.confirm("Are you sure you want to activate this user?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            axios
            .put("/user/" + user.id + "/activate",
                null,
                config)
            .then(()=>{
                alert("User is activated");
                getEmployee();
            })
            .catch((error) => {
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
    }

    return (
        <div className="profile">
            {displayError()}
            <div className="container emp-profile">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="profile-img">
                                {editMode && selectedImage
                                ? <img src={`${selectedImage}`} />
                                : <img src={`data:image/jpeg;base64,${employee.photo}`} />}
                                {editMode 
                                ? <div className="file btn btn-lg btn-primary " id="editPhoto">
                                    Change Photo                           
                                    <input type="file" name="file" accept="image/*" onChange={uploadPhoto}/>
                                </div> 
                                : ""}
                            </div>
                            <div className="profile-work">
                                <br/>
                                <p>Current projects</p>
                                <hr/>
                                {currProjects != null
                                ? <div>
                                    {currProjects
                                    .map(project => <div><a href={"/app/project/"+project.id}>{project.name}</a><br/></div>)}
                                </div>
                                : <div>No current project</div>}                            
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="profile-head">
                                <div className="row">
                                    <div className="col-md-3">
                                        <h5>
                                            {user.name} {user.surname}
                                        </h5>
                                        <p className="profile-rating">{employee.position}</p>
                                        {
                                            decodedToken.role === "ROLE_ADMIN"
                                            ? <div className="profile-rating">
                                                <span>Role: {decodedToken.role.split("_").pop().toLowerCase()}</span><br/>
                                                <span>Status: {user.status.toLowerCase()}</span>
                                              </div>
                                            : ""
                                        }                                        
                                    </div>
                                    <div className="container col-md-9" >
                                        <div className="button-group-modification">
                                            {                                    
                                                decodedToken.role === "ROLE_ADMIN" && user.status !== "BLOCKED"
                                                ? 
                                                <button onClick={blockUser} className="block-btn">
                                                    <span class="hidden_hover" style={{fontSize:"25px"}}><i className="bi bi-person-x-fill"></i></span>
                                                    <span class="hidden_span">Block User</span>
                                                </button>
                                                : decodedToken.role === "ROLE_ADMIN" && user.status === "BLOCKED"
                                                ? 
                                                <button onClick={activateUser} style={{background:"#70E852"}} className="block-btn">
                                                    <span class="hidden_hover" style={{fontSize:"25px"}}><i className="bi bi-person-check-fill"></i></span>
                                                    <span class="hidden_span">Activate user</span>
                                                </button>
                                                : ''
                                            }
                                        </div>
                                        <div className="button-group-modification">
                                            {                                       
                                                decodedToken.role === "ROLE_ADMIN" && user.status !== "DEACTIVATED"
                                                ?<button onClick={deactivateUser} className="deactivate-btn">
                                                        <span class="hidden_hover" style={{fontSize:"25px"}}><i className="bi bi-person-dash"></i></span>
                                                        <span class="hidden_span">Deactivate</span>
                                                    </button>
                                                    
                                                : ""
                                            }
                                        </div>
                                        <div className="button-group-modification">
                                            {
                                                !editMode && decodedToken.id === user.id
                                                ?
                                                <button onClick={editProfileOnUI} className="mybtn">
                                                    <span className="hidden_hover" style={{fontSize:"25px"}}><i className="bi bi-pencil-square" ></i></span>
                                                    <span className="hidden_span">Edit Profile</span>
                                                </button>
                                                : ""
                                            }   
                                        </div>
                                    </div>
                                                           
                                </div>                                
                                <br/>
                                <div className="col-md-8">
                                    <Tabs
                                        defaultActiveKey="profile"
                                        className="mb-3">
                                        <Tab eventKey="profile" title="Profile">
                                            <div className="tab-panel">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Login</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p>{user.login}</p>
                                                    </div>
                                                </div>
                                                {editMode
                                                ? <div>
                                                    <div className="row ">
                                                        <div className="col-md-6">
                                                            <label>Name</label>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input type="text"
                                                            defaultValue={user.name} 
                                                            onChange={e => setName(e.target.value)}/>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <label>Surname</label>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input type="text"
                                                            defaultValue={user.surname} 
                                                            onChange={e => setSurname(e.target.value)}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                : <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Full name</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p>{user.name} {user.surname}</p>
                                                    </div>
                                                </div>
                                                }
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Email</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                    {editMode 
                                                    ? <input type="text" defaultValue={user.email} 
                                                            onChange={e => setEmail(e.target.value)}/> 
                                                    : <p>{user.email}</p>} 
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Phone</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                    {editMode 
                                                    ? <input type="text" defaultValue={user.phone}  
                                                            onChange={e => setPhone(e.target.value)}/> 
                                                    : <p>{user.phone}</p>} 
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Date of birth</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        {
                                                            editMode 
                                                            ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                                <DatePicker style={{width:'100%'}} value={birthDate} onChange={setBirthDate} format="do MMMM Y" />
                                                            </MuiPickersUtilsProvider> 
                                                            : employee.birthDate != null
                                                            ? <p>{format(parseISO(employee.birthDate), "do MMMM Y")}</p> 
                                                            : ''
                                                        }
                                                    </div> 
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="work" title="Work">
                                            <div className="tab-panel">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Start date at company</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        {employee.startDate != null ? <p>{format(parseISO(employee.startDate), "do MMMM Y")}</p> : ''}
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Total experience</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p>{employee.experience}</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Position</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p>{employee.position}</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Technologies</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        {editMode 
                                                        ? <textarea style={{maxHeight:'350px'}} defaultValue={employee.technologies} 
                                                                onChange={e => setTechnologies(e.target.value)}/> 
                                                        : <p>{employee.technologies}</p>} 
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Total projects count</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p>{employee.projectsCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </div>
                                <br/>                                    
                                {
                                    editMode && decodedToken.id === user.id
                                    ? <div>
                                        <div className='error'>{errorMessage}</div><br/>
                                        <div className="row">                                            
                                            <div className="col-md-4"></div>
                                            <div className="col-md-2">
                                                <input onClick={()=>editProfileRequest()} type="submit" className="profile-edit-btn" value="Save" />
                                            </div>
                                            <div className="col-md-2">
                                                <button onClick={()=>{setEditmode(false); setSelectedImage(null); setErrorMessage("")}} 
                                                    style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                    : ""
                                }
                            </div>
                        </div>                                       
                    </div>
                </form>           
            </div>
            {
                user.status === 'DEACTIVATED' && decodedToken.id == user.id
                ? <ChangePasswordModal show={showModal} onHide={()=>setShowModal(false)} backdrop="static" navigate={props.navigate}/>
                : ''
            }
        </div>    
    );
}