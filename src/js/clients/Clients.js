import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import ClientProfileModal, {clearErrorMessage, noEditMode} from './ClientProfileModal';
import axios from "axios";
import jwt_decode from "jwt-decode";

import '../../css/users/Users.css';
import '../../css/users/Clients.css';

export default function Clients(props) {
    const[cookies] = useCookies(["token"]);
    const[clients, setClients] = useState({});
    const[inputText, setInputText] = useState("");
    const[decodedToken, setDecodedToken] = useState({});
    const[clientId, setClientId] = useState();
    const[showModal, setShowModal] = useState();
    const[modalClient, setModalClient] = useState([]);

    useLayoutEffect(() => { 
        getClients();        
    }, []);

    const getClients = async() => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        await axios
        .get("/user/clients", config)
        .then(response => response.data)
        .then((data) =>{             
            if(data){
                data = data.sort((a,b) => a.surname > b.surname ? 1 : -1);
                setClients(data); 
                setDecodedToken(jwt_decode(cookies.token));                
            }                                   
        })
        .catch((error) => {
            let code = error.toJSON().status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);            
            else if(code===401){
                document.cookie = "expired=true; path=/";
            }
            else if(code===403)
                alert("Access is denied"); 
            else if(code!==undefined && code!==null) 
                alert('Internal server error');
        });    
    };

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase().replaceAll(' ', '');
        setInputText(lowerCase);
    };

    const filteredClients =  Object.values(clients).filter((client) =>{
        if(inputText === ''){
            return client;
        } else {
            return client.name.toLowerCase().startsWith(inputText)
                || client.surname.toLowerCase().startsWith(inputText)
                || (client.name + client.surname).toLowerCase().startsWith(inputText)
                || (client.surname + client.name).toLowerCase().startsWith(inputText); 
        }
    });

    const deactivateUser = (e, clientId) => {
        e.stopPropagation(); 
        if(window.confirm("Are you sure you want to deactivate this user?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            axios
            .put("/user/" + clientId + "/deactivate",
                null,
                config)
            .then(()=>{
                alert("User is deactivated");
                getClients();  
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null)
                    alert(error.response.data.message);    
                else if(code===401){
                    document.cookie = "expired=true; path=/";
                }
                else if(code===403)
                    alert("Access is denied"); 
                else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
            });  
        }        
    }
    const activateUser = (e, clientId) => {
        e.stopPropagation(); 
        if(window.confirm("Are you sure you want to activate this user?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            axios
            .put("/user/" + clientId + "/activate",
                null,
                config)
            .then(()=>{
                alert("User is activated");
                getClients();  
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null)
                    alert(error.response.data.message);    
                else if(code===401){
                    document.cookie = "expired=true; path=/";
                }
                else if(code===403)
                    alert("Access is denied"); 
                else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
            });  
        } 
    }
    const blockUser = (e, clientId) => {
        e.stopPropagation(); 
        if(window.confirm("Are you sure you want to block this user?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };
    
            axios
            .put("/user/" + clientId + "/block",
                null,
                config)
            .then(()=>{
                alert("User is blocked");
                getClients();  
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null)
                    alert(error.response.data.message);    
                else if(code===401){
                    document.cookie = "expired=true; path=/";
                }
                else if(code===403)
                    alert("Access is denied"); 
                else if(code!==undefined && code!==null) {
                alert('Internal server error');
            }
            });   
        }        
    }


    return(
        <div className="users clients">
            <div className="container">
                <div className="well well-sm row" style={{fontFamily:"sans-serif"}}>
                    <div className="col-md-8"><h5 className="title">Clients</h5></div>
                    <div className="search col-md-4">
                        <InputGroup>
                            <Form.Control
                                placeholder="Name"
                                aria-label="Name"
                                aria-describedby="basic-addon1"
                                onChange={inputHandler}
                            />
                            <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                        </InputGroup>
                    </div>
                </div>
                <div id="users">
                    <div className='first-item item list-group-item users-list'>  
                        <div className="row">
                            <div className="user-wrapper custom-text">
                                <div className="col-md-2">
                                    <span className="name-list-not-full">Full name</span>
                                </div>
                                <div className="col-md-2">
                                    <span className="name-list-not-full">Login</span>
                                </div>
                                <div className="col-md-2">
                                    <span className="name-list-not-full">Email</span>
                                </div>
                                <div className="col-md-2">
                                    <span className="name-list-not-full">Phone</span>
                                </div>
                                <div className="col-md-2">
                                    <span className="name-list-not-full">Actions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {
                  filteredClients.map((client) =>
                    <div className='item list-group-item users-list' onClick={() => {setShowModal(true); setClientId(client.id); setModalClient(client);}}>  
                            <div className="row">
                                <div className="user-wrapper custom-text">
                                    <div className="col-md-2">
                                        <span className="name-list-not-full">{client.name + ' ' + client.surname}</span>
                                    </div>
                                    <div className="col-md-2">
                                        <span className="name-list-not-full">{client.login}</span>
                                    </div>
                                    <div className="col-md-2">
                                        <i class="bi bi-envelope"></i>
                                        <span className="item-content">{client.email}</span>
                                    </div>
                                    <div className="col-md-2">
                                        <i class="bi bi-phone"></i>
                                        <span className="item-content">{client.phone}</span>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="button-group-modification">
                                        {client.status !== "DEACTIVATED" &&
                                            <button onClick={(event) => {deactivateUser(event, client.id)}} className="deactivate-btn-cl">
                                                    <span style={{fontSize:"22px"}}><i className="bi bi-person-dash-fill"></i></span>
                                            </button>
                                        }
                                        </div>
                                        <div className="button-group-modification">
                                            {client.status !== "BLOCKED" ?
                                                <button onClick={(event) => {blockUser(event, client.id)}} className="block-btn-cl">
                                                    <span style={{fontSize:"22px"}}><i className="bi bi-person-x-fill"></i></span>
                                                </button>
                                                :
                                                <button onClick={(event) => {activateUser(event, client.id)}} className="activate-btn-cl">
                                                    <span style={{fontSize:"22px"}}><i className="bi bi-person-dash-fill"></i></span>
                                                </button>
                                            }
                                             
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>)
                } 
                </div>
            </div>
            <ClientProfileModal show={showModal} onHide={()=>{setShowModal(false); clearErrorMessage(); noEditMode()}} 
                    id={clientId} client={modalClient} setShowModal={()=>setShowModal(true)} getClients={() => getClients()}/>
        </div>
    );
}