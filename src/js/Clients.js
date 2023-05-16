import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from "axios";
import jwt_decode from "jwt-decode";

import '.././css/Users.css';

export default function Clients(props) {
    const[cookies] = useCookies(["token"]);
    const[clients, setClients] = useState({});
    const[inputText, setInputText] = useState("");
    const[decodedToken, setDecodedToken] = useState({});

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

    return(
        <div className="users">
            <div className="container">
                <div className="well well-sm row" style={{fontFamily:"sans-serif"}}>
                    <div className="col-md-8"></div>
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
                {
                  filteredClients.map((client) =>
                    <div style={{background: "#DCE5E7"}} className='item list-group-item users-list'>  
                            <div style={client.status == 'BLOCKED' ? {opacity: 0.33} : {}} className="row">
                                <div className="user-wrapper">
                                    <div className="col-md-3">
                                        <span className="name-list-not-full">{client.name + ' ' + client.surname}</span>
                                    </div>
                                    <div className="col-md-3">
                                        <span className="name-list-not-full">{client.login}</span>
                                    </div>
                                    <span className="container row">
                                        <div className="col-md-3">
                                            <i className="bi bi-briefcase suitcase"></i>
                                            <span className="position-list-not-full">{client.email}</span>
                                        </div>
                                        <div className="col-md-3">
                                            <i className="bi bi-briefcase suitcase"></i>
                                            <span className="position-list-not-full">{client.phone}</span>
                                        </div>
                                        <div className="col-md-2">
                                            <i className="bi bi-briefcase suitcase"></i>
                                            <span className="position-list-not-full">{client.phone}</span>
                                        </div>
                                        <div className="col-md-2">
                                            <i className="bi bi-briefcase suitcase"></i>
                                            <span className="position-list-not-full">{client.phone}</span>
                                        </div>
                                    </span>
                                </div>
                            </div>
                    </div>)
                } 
                </div>
            </div>
        </div>
    );
}