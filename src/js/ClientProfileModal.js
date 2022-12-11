import { useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from "axios";
import { useCookies } from 'react-cookie';

import '.././css/ClientProfileModal.css';

export default function ClientProfileModal(props) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const[user, setUser] = useState({});
    const[errorMessage, setErrorMessage] = useState('');

    useEffect(() => {   
        if(props.id !== undefined) 
            getClient();
    }, [props.id]);

    const getClient = () => {
        let config = {
            headers: {
                //TODO Authorization: 'Bearer ' + token
            }
        };

        axios
        .get("/user/" + props.id,
            config)
        .then(response => response.data)
        .then((data) =>{
            if(data){
                setUser(data);                    
            }                    
        })
        .catch((error) => {
            //TODO
        });            
  }

    const blockUser = () => {
        let config = {
            headers: {
                //Authorization: 'Bearer ' + token
            }
        };

        axios
        .put("/user/" + props.id + "/block",
            config)
        .then(()=>{
            props.onHide();
            alert("User is blocked");
            props.getOrders();
        })
        .catch((error) => {
            alert("Internal server error")
        });   
    }

    const deactivateUser = () => {
        let config = {
            headers: {
                //Authorization: 'Bearer ' + token
            }
        };

        axios
        .put("/user/" + props.id + "/deactivate",
            config)
        .then(()=>{
            props.onHide();
            alert("User is deactivated");
            props.getOrders();
        })
        .catch((error) => {
            alert("Internal server error")
        });  
    }

  return (
    <Modal className="client-profile"
      {...props}
      centered>
      <Modal.Header closeButton>
        <div className="row" style={{width:"100%"}}>
            <div className="col-md-10" style={{fontWeight:"bold", fontSize:"20px"}}>{user.name + " " + user.surname}</div>
        </div>
      </Modal.Header>
      <Modal.Body>           
        <div className="row">
           <div className="col-md-4">
                <label>Email:</label>
            </div>
            <div className="col-md-6">{user.email}</div>
        </div>
        <div className="row">
           <div className="col-md-4">
                <label>Phone:</label>
            </div>
            <div className="col-md-6">{user.phone}</div>
        </div>     
        <div className="row">
            {/** TODO only for admin */}
           <div className="col-md-4">
                <label>Status:</label>
            </div>
            <div className="col-md-6">{user.status}</div>
        </div> 
      </Modal.Body>
      <Modal.Footer>
        <div className="footer">
            <div className="col-md-4">
            {
                // TODO: condition (admin is logged & user is NOT blocked yet)
                <button onClick={()=>blockUser()} className="block"><span>Block user</span></button>
            }
            </div>
            <div className="col-md-4">
            {
                // TODO: condition (admin is logged & user is NOT deactivated yet)
                <button onClick={()=>deactivateUser()} className="block deactivate"><span>Deactivate</span></button>
            }
            </div>
        </div>
      </Modal.Footer>
    </Modal>
  );  
}