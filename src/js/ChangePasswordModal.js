import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from "axios";
import { useCookies } from 'react-cookie';
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import '.././css/ChangePasswordModal.css';

export default function ChangePasswordModal(props) {
  const [cookies] = useCookies(["token"]);
  const[currentPassword, setCurrentPassword] = useState("");
  const[newPassword, setNewPassword] = useState("");
  const[submitPassword, setSubmitPassword] = useState("");
  const[errorMessage, setErrorMessage] = useState('');
  const[error, setError] = useState("");

  const displayError = () => {
    if(error!=="")
    {
      alert(error);
      logout();
    }
  }

  const submitChangePassword = () => {
    let config = {
        headers: {
          Authorization: 'Bearer ' + cookies.token
        }
    };

    let decodedToken = jwt_decode(cookies.token);

    let body = {
      login: decodedToken.sub,
      currentPassword: currentPassword,
      newPassword: newPassword
    }  

    axios
    .post("/user/password", 
        body,
        config)
    .then(() => {
        props.onHide();
        logout();
    })
    .catch((error) => {
        let code = error.toJSON().status;
        if(code===401) setErrorMessage("Bad credentials");
        else if(code===400 && error.response.data !== null) setErrorMessage(error.response.data.message);
        else if(code===403)
            alert("Access is denied"); 
        else if(code!==undefined && code!==null) 
            alert('Internal server error');
    });            
  }

  return (
    <Modal className="change-password"
      {...props}
      centered>
      {displayError()}
      <Modal.Header>
        <Modal.Title>
            <i class="bi bi-exclamation-triangle"></i>   
            <span>&nbsp;Change Password and re-login</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>   
        <div className="row">
           <div className="col-md-4">
                <label>Current password:</label>
            </div>
            <div className="col-md-6">
                <input class="psw" type="password" onChange={e => setCurrentPassword(e.target.value)} />                 
            </div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>New password:</label>
            </div>
            <div className="col-md-6">
                <input class="psw" type="password" onChange={e => setNewPassword(e.target.value)} />                    
            </div>
        </div>     
        <div className="row">
           <div className="col-md-4">
                <label>Repeat new password:</label>
            </div>
            <div className="col-md-6">
                <input class="psw" type="password" onChange={e => setSubmitPassword(e.target.value)} />                    
            </div>
            {newPassword !== submitPassword && newPassword !== '' ? <div className='error-msg'>Not equals</div> : ''}
            {newPassword === currentPassword && newPassword !== '' ? <div className='error-msg'>Create new password</div> : ''}
            <div className='error-msg'>{errorMessage}</div>
        </div> 
      </Modal.Body>
      <Modal.Footer>
        <div>
            <button className={(newPassword !== submitPassword || newPassword === currentPassword) && newPassword !== '' ? 'add-btn dsbld' : 'add-btn'} 
                disabled={(newPassword !== submitPassword || newPassword === currentPassword) && newPassword !== '' ? true : false} 
                onClick={()=>{submitChangePassword();}}>Submit</button>
        </div>
      </Modal.Footer>
    </Modal>
  );  
}