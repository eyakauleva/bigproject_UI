import React, { useState, useEffect } from "react";
import axios from "axios";
import '.././css/Profile.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export default function Profile() {
    const[employee, setEmployee] = useState({});
    const[user, setUser] = useState({});
    const[login, setLogin] = useState("");
    const[name, setName] = useState("");
    const[surname, setSurname] = useState("");
    const[email, setEmail] = useState("");
    const[phone, setPhone] = useState("");
    const[birthday, setBirthday] = useState("");
    const[technologies, setTechnologies] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const[editMode, setEditmode] = useState(false);    

    useEffect(() => {        
        getEmployee();
    }, []);

    const getEmployee = async () => {
        await axios
            .get("/employee/2")
            .then(response => response.data)
            .then((data) =>{
                if(data)
                    setEmployee(data);
                    setUser(data.user);
            })
            .catch((error) => {
                
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const editProfile = () => {
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

        let employee = {
            user: user,
            birthDate: birthday,
            technologies: technologies
        };

        const update = async() => {
            await axios
            .put("employee/2", 
                employee,
                config)
            .then(() => {
                getEmployee();
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
            console.log(selectedImage);
        };
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
                                <div class="file btn btn-lg btn-primary " id="editPhoto">
                                    Change Photo    setSelectedImage(e.target.files[0]);                            
                                    <input type="file" name="file" accept="image/*" onChange={uploadPhoto}/>
                                </div>
                                : ""}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="profile-head">
                                <h5>
                                    {user.name} {user.surname}
                                </h5>
                                <h6>
                                    {employee.position}
                                </h6>
                                <p className="proile-rating">Work experience : <span>{employee.experience}</span></p>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <button onClick={()=>setEditmode(true)} className="profile-edit-btn">Edit Profile</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <div className="profile-work">
                            <p>Current project</p>
                            <a href="">[???Current project name with link ???]</a><br/>
                        </div>
                    </div>
                    <div className="col-md-8">                            
                                    <Tabs
                                      defaultActiveKey="profile"
                                      id="uncontrolled-tab-example"
                                      className="mb-3">
                                      <Tab eventKey="profile" title="Profile">
                                        <div className="tab-pane fade show active" id="home" aria-labelledby="home-tab">
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
                                           <div className="row">
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
                                              {editMode ? <input type="text"
                                                        defaultValue={employee.birthDate} 
                                                        onChange={e => setBirthday(e.target.value)}/> 
                                                        : <p>{employee.birthDate}</p>} 
                                              </div>
                                          </div>
                                        </div>
                                      </Tab>
                                      <Tab eventKey="work" title="Work">
                                        <div>
                                          <div className="row">
                                              <div className="col-md-6">
                                                  <label>Experience</label>
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
                                                    {editMode ? <textarea
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
                                                  <p>?????????????????</p>
                                              </div>
                                          </div>
                                        </div>
                                      </Tab>
                                    </Tabs>

                                    
                    </div>

                </div>  
                {editMode ?
                <div className="row">
                <div className="col-md-6">
                    <input onClick={editProfile} type="submit" className="profile-edit-btn" value="Save" />
                </div>
                <div className="col-md-6">
                    <button onClick={()=>{setEditmode(false); setSelectedImage(null);}} style={{background: '#D5D5D5'}} className="profile-edit-btn">Cancel</button>
                </div>                                        
            </div>
            :""}  

            </form>           
        </div>
  </div>    
  );
}