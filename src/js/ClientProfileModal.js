import { useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from "axios";
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import '.././css/ClientProfileModal.css';

var clearErrorMessage;
var noEditMode;
export {clearErrorMessage}
export {noEditMode}
export default function ClientProfileModal(props) {
    const[cookies, setCookie, removeCookie] = useCookies(["token"]);
    const[user, setUser] = useState({});
    const[name, setName] = useState("");
    const[surname, setSurname] = useState("");
    const[email, setEmail] = useState("");
    const[phone, setPhone] = useState("");
    const[editMode, setEditmode] = useState(false);  
    const[errorMessage, setErrorMessage] = useState("");
    const[decodedToken, setDecodedToken] = useState({});
    const[error, setError] = useState("");

    clearErrorMessage = () => {
        setErrorMessage("");
    }

    noEditMode = () => {
        setEditmode(false);
    }

    useEffect(() => {   
        if(props.id !== undefined) 
            getClient();
    }, [props.id]);

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
    }

    const getClient = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        axios
        .get("/user/" + props.id,
            config)
        .then(response => response.data)
        .then((data) =>{
            if(data){
                setUser(data);       
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

    const blockUser = () => {
        if(window.confirm("Are you sure you want to block this client?")){
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
                props.onHide();
                alert("User is blocked");
                getClient();
                props.getOrders();
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
        if(window.confirm("Are you sure you want to block this client?")){
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
                props.onHide();
                alert("User is deactivated");
                getClient();
                props.getOrders();
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
                props.onHide();
                alert("User is activated");
                getClient();
                props.getOrders();
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

        const update = async() => {
            await axios
            .put("/user/" + props.id, 
                user,
                config)
            .then(() => {
                getClient();
                setEditmode(false);
                props.setShowModal();
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

    const editProfileOnUI = () => {
        setName(user.name);
        setSurname(user.surname);
        setEmail(user.email);
        setPhone(user.phone);
        setEditmode(true);
    }

  return (
    <Modal className="client-profile"
      {...props}
      centered>
        {displayError()}
      <Modal.Header closeButton>
        <div className="row" style={{width:"100%"}}>
            <div className="col-md-1"></div>
            <div className="col-md-6" style={{fontWeight:"bold", fontSize:"20px"}}>
                {editMode == true
                ? 'Edit profile'
                : user.name + " " + user.surname}
            </div>
            <div className="col-md-5">
            {
                !editMode && decodedToken.id === user.id
                ? <button onClick={()=>editProfileOnUI()} className="mybtn"><span>Edit profile</span></button>
                : ''
            }
            </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        {
            editMode == true
            ? <div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Name:</label>
                    </div>
                    <div className="col-md-8">
                        {editMode 
                        ? <input type="text" defaultValue={user.name} 
                                onChange={e => setName(e.target.value)}/> 
                        : <span>{user.name}</span>} 
                    </div>
                </div><hr/>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-3">
                        <label>Surname:</label>
                    </div>
                    <div className="col-md-8">
                        {editMode 
                        ? <input type="text" defaultValue={user.surname}  
                                onChange={e => setSurname(e.target.value)}/> 
                        : <span>{user.surname}</span>}
                    </div>
                </div><hr/>
            </div>
            : ''
        }           
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-3">
                <label>Email:</label>
            </div>
            <div className="col-md-8">
                {editMode 
                ? <input type="text" defaultValue={user.email} 
                        onChange={e => setEmail(e.target.value)}/> 
                : <span>{user.email}</span>} 
            </div>
        </div><hr/>
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-3">
                <label>Phone:</label>
            </div>
            <div className="col-md-8">
                {editMode 
                ? <input type="text" defaultValue={user.phone}  
                        onChange={e => setPhone(e.target.value)}/> 
                : <span>{user.phone}</span>}
            </div>
        </div>     
        {
            decodedToken.role === "ROLE_ADMIN"
            ? <div>
                <hr/>
                <div className="row">
                    <div className="col-md-1"></div>            
                    <div className="col-md-3">
                        <label>Status:</label>
                    </div>
                    <div className="col-md-8">{user.status}</div>
                </div>
            </div>   
            : ""
        }             
      </Modal.Body>
      <Modal.Footer>
        <div className="footer">
            <div className="row">
                <div className="col-md-1"></div>            
                <div className="col-md-11 error">
                    {errorMessage}
                </div>
            </div>
            <div className="buttons">
                <div className="col-md-1"></div> 
                <div className="col-md-4">
                {
                    decodedToken.role === "ROLE_ADMIN" && user.status !== "BLOCKED"
                    ? <button onClick={()=>blockUser()} className="block"><span>Block user</span></button>
                    : decodedToken.role === "ROLE_ADMIN" && user.status === "BLOCKED"
                    ? <button onClick={activateUser} style={{background:"#70E852"}}
                        className="block"><span>Activate</span></button>
                    : editMode == true && decodedToken.id === user.id
                    ? <input onClick={()=>editProfileRequest()} type="submit" className="submit-edit" value="Save" />
                    : ''
                }
                </div>
                <div className="col-md-4">
                {
                    decodedToken.role === "ROLE_ADMIN" && user.status !== "DEACTIVATED"
                    ? <button onClick={()=>deactivateUser()} className="block deactivate"><span>Deactivate</span></button>
                    : editMode == true && decodedToken.id === user.id
                    ? <button onClick={()=>{setEditmode(false); setErrorMessage("")}} 
                                style={{background: '#FF6E4E'}} className="submit-edit">Cancel</button>
                    : ''
                }
                </div>
            </div>          
        </div>
      </Modal.Footer>
    </Modal>
  );  
}