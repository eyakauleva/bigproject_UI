import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format, parseISO } from "date-fns";

import '../css/Modal.css';
import '../css/SingleTask.css';
import '.././css/Users.css';
import '.././css/ChangePasswordModal.css';
import { id } from 'date-fns/locale';

export default function ChangePasswordModal(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const[currentPassword, setCurrentPassword] = useState("");
  const[newPassword, setNewPassword] = useState("");
  const[submitPassword, setSubmitPassword] = useState("");
  const[errorMessage, setErrorMessage] = useState('');

  const submitChangePassword = () => {
    let config = {
        headers: {
            //TODO Authorization: 'Bearer ' + token
        }
    };

    let body = {
        login: 'user1', //TODO get login from token
        currentPassword: currentPassword,
        newPassword: newPassword
    }  

    axios
    .post("/user/password", 
        body,
        config)
    .then(() => {
        props.onHide();
        removeCookie("token");        
        props.navigate('/login');
    })
    .catch((error) => {
        let code = error.toJSON().status;
        if(code===401) setErrorMessage("Bad credentials");
        else alert('Internal server error');
    });            
  }

  return (
    <Modal className="change-password"
      {...props}
      centered>
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