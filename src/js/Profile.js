import React, { useState, useEffect } from "react";
import axios from "axios";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { format, parseISO } from "date-fns";
import { useParams } from 'react-router-dom';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import '.././css/Profile.css';

export default function Profile() {
    const[employee, setEmployee] = useState({});
    const[user, setUser] = useState({});
    const[currProject, setCurrProject] = useState({});
    const[login, setLogin] = useState("");
    const[name, setName] = useState("");
    const[surname, setSurname] = useState("");
    const[email, setEmail] = useState("");
    const[phone, setPhone] = useState("");
    const[birthDate, setBirthDate] = useState(new Date());
    const[technologies, setTechnologies] = useState("");
    const[selectedImage, setSelectedImage] = useState(null);
    const[editMode, setEditmode] = useState(false);  
    const {id} = useParams();    

    useEffect(() => {        
        getEmployee();
    }, []);

    const getEmployee = async () => {
        if(id){
            await axios
            .get("/employee/" + id)
            .then(response => response.data)
            .then((data) =>{
                if(data){
                    setEmployee(data);
                    setUser(data.user);
                    setCurrProject(data.currentProject);                    
                }                    
            })
            .catch((error) => {
                //TODO
            });
        }        
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const editProfileRequest = () => {
        let config = {
        headers: {
            //Authorization: 'Bearer ' + token
        }
        };

        let user = {
            login: login,
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
        setLogin(user.login);
        setName(user.name);
        setSurname(user.surname);
        setEmail(user.email);
        setPhone(user.phone);
        setBirthDate(employee.birthDate);
        setTechnologies(employee.technologies);
        setEditmode(true);
    }

    const blockUser = () => {
        let config = {
            headers: {
                //Authorization: 'Bearer ' + token
            }
        };

        axios
        .put("/user/" + id + "/block",
            config)
        .catch((error) => {
        
        });   
    }

  return (
    <div className="profile">
      <div className="container emp-profile">
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-4">
                        <div className="profile-img">
                            {editMode && selectedImage
                            ? <img src={`${selectedImage}`} />
                            : <img src={`data:image/jpeg;base64,${employee.photo}`} />}
                            {editMode ? 
                                <div className="file btn btn-lg btn-primary " id="editPhoto">
                                    Change Photo                           
                                    <input type="file" name="file" accept="image/*" onChange={uploadPhoto}/>
                                </div>
                                : ""}
                        </div>
                        <div className="profile-work">
                            <br/>
                            <p>Current project</p>
                            <hr/>
                            {currProject
                            ? <div><a href={"/app/dashboard/"+currProject.id}>{currProject.name}</a><br/></div>
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
                                    </div>
                                    {
                                        !editMode ?
                                        <div className="col-md-3">
                                            <button onClick={editProfileOnUI} className="mybtn"><span>Edit Profile</span></button>
                                        </div>
                                        : ""
                                    } 
                                    
                                    {
                                        // TODO: condition (admin is logged)
                                        <div className="col-md-3">
                                            <button onClick={blockUser} className="block-btn"><span>Block user</span></button>
                                        </div>
                                    }
                                        <div className="col-md-3">
                                            <button className="block-btn"><span>Block user</span></button>
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
                                                    {editMode ? <input type="text"
                                                        defaultValue={user.login} 
                                                        onChange={e => setLogin(e.target.value)}/> 
                                                        : <p>{user.login}</p>} 
                                                </div>
                                          </div>
                                          {editMode ?
                                        <div>
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
                                              {editMode ? <input type="text"
                                                        defaultValue={user.email} 
                                                        onChange={e => setEmail(e.target.value)}/> 
                                                        : <p>{user.email}</p>} 
                                              </div>
                                          </div>
                                          <div className="row">
                                              <div className="col-md-6">
                                                  <label>Phone</label>
                                              </div>
                                              <div className="col-md-6">
                                              {editMode ? <input type="text"
                                                        defaultValue={user.phone} 
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
                                                    {editMode ? <textarea style={{maxHeight:'350px'}}
                                                        defaultValue={employee.technologies} 
                                                        onChange={e => setTechnologies(e.target.value)}/> 
                                                        : <p>{employee.technologies}</p>} 
                                              </div>
                                          </div>
                                          <div className="row">
                                              <div className="col-md-6">
                                                  <label>Total Projects</label>
                                              </div>
                                              <div className="col-md-6">
                                                  <p>{employee.projectsCount}</p>
                                              </div>
                                          </div>
                                        </div>
                                      </Tab>
                                    </Tabs></div>
                                    <br/>
                                    
                                    {
                                        editMode?
                                        <div>
                                            <br/>
                                            <div className="row">                                            
                                                <div className="col-md-3"></div>
                                                <div className="col-md-2">
                                                    <input onClick={editProfileRequest} type="submit" className="profile-edit-btn" value="Save" />
                                                </div>
                                                <div className="col-md-2">
                                                    <button onClick={()=>{setEditmode(false); setSelectedImage(null);}} 
                                                        style={{background: '#FF6E4E'}} className="profile-edit-btn">Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                        : ""
                                    }

                        </div>
                    </div>                                       
                </div>
                <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-8 tickets">
                        <p>Tickets</p>
                        <hr/>
                    </div>
                </div>
            </form>           
      </div>
    </div>    
  );
}