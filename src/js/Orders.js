import React from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useState, useLayoutEffect} from 'react';
import { format, parseISO } from "date-fns";
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import ClientProfileModal from './ClientProfileModal.js';
import '.././css/Orders.css';

export default function Orders(props) {
    const [cookies] = useCookies(["token"]);
    const[orders, setOrders] = useState([]);
    const[clientId, setClientId] = useState();
    const[showModal, setShowModal] = useState(false);
    const[decodedToken, setDecodedToken] = useState({});
    const[error, setError] = useState("");

    useLayoutEffect(() => {    
        getOrders();
    }, []);

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
    }

    const getOrders = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        axios
        .get("/orders/all", config)
        .then(response => response.data)
        .then((data) =>{             
            if(data){
                setOrders(data);
                setDecodedToken(jwt_decode(cookies.token));
            }                                   
        })
        .catch((error) => {
            let code = error.toJSON().status;
            if(code===400 && error.response.data !== null)
                alert(error.response.data.message);
            else if(code===401)
                setError('Authorization is required');
            else if(code===403)
                alert("Access is denied");
            else alert('Internal server error');
        });    
   };

    const deleteOrder = (id) => {
        if(window.confirm("Are you sure you want to block this order?")){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + cookies.token
                }
            };

            axios
            .put("/orders/" + id + "/block", null, config)
            .then(() =>{             
                getOrders();                                 
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null)
                    alert(error.response.data.message);
                else if(code===401)
                    setError('Authorization is required');
                else if(code===403)
                    alert("Access is denied");
                else alert('Internal server error');
            }); 
        }        
   }
    
    return (
        <div className="orders">
            {displayError()}
            <div className="container">
                <div className="well well-sm row" style={{fontFamily:"sans-serif"}}>
                    {/* <div className="col-md-1">Filter by:</div> */}
                </div> 
                <div className='item  list-group-item'> 
                    <div className='order-wrapper' style={{fontWeight:"bold"}}>
                        <div className="col-md-1"></div>                            
                        <div className="col-md-2">Create date</div>
                        <div className="col-md-3">Client</div>
                        <div className="col-md-1">Cost</div>
                        <div className="col-md-2"><i className="bi bi-download"></i>&nbsp;Description</div>
                        <div className="col-md-2">Action</div>
                        {
                            decodedToken.role === "ROLE_ADMIN"
                            ? <div className="col-md-1">Delete</div>
                            : ''
                        }                        
                    </div>
                </div>
                <div>
                    {
                        orders.map((order) => 
                        <div className='item  list-group-item'> 
                            <div className='order-wrapper'>
                                <div className="col-md-1">
                                    {order.status === "OPEN"
                                    ? <i className="bi bi-patch-exclamation-fill"></i>
                                    : ''}                                
                                </div>                        
                                <div className="col-md-2 date">
                                    {order.startDate != null ? <span>{format(parseISO(order.startDate), "do MMMM Y")}</span> : ''}
                                </div>
                                <div onClick={()=>{setClientId(order.client.id); setShowModal(true)}} className="col-md-3 client">
                                    {order.client.name + ' ' + order.client.surname}
                                </div>
                                <div className="col-md-1"> {order.cost != null ? order.cost : '—'} </div>                                
                                <div className="col-md-2 download">
                                    <a href={"http://localhost:8080/orders/" + order.id +"/description"}>
                                        download&nbsp;<i className="bi bi-file-earmark"></i>
                                    </a>
                                </div>   
                                <div className="col-md-2">
                                    {order.status === "OPEN"
                                    ? <a href={"orders/" + order.id + "/create"} className='order-button'><span>Create project</span></a>
                                    : order.project != null
                                    ? <a href={"project/" + order.project.id} className='order-button'><span>See project</span></a>
                                    : ''}                                        
                                </div>
                                {
                                    decodedToken.role === "ROLE_ADMIN"
                                    ? <div className='col-md-1 remove' title='Delete order' onClick={()=>deleteOrder(order.id)} style={{cursor:"pointer"}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#CE3D1D" class="bi bi-x-circle" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                    </div>
                                    : ''
                                }    
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ClientProfileModal show={showModal} onHide={()=>setShowModal(false)} id={clientId} getOrders={()=>getOrders()} />         
        </div>
    );
}