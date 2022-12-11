import React from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useState, useEffect} from 'react';
import { format, parseISO } from "date-fns";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import ClientProfileModal from './ClientProfileModal.js';
import '.././css/Orders.css';

export default function Orders(props) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const[orders, setOrders] = useState([]);
    const[clientId, setClientId] = useState();
    const[showModal, setShowModal] = useState(false);

    useEffect(() => {    
        getOrders();
    }, []);

    const getOrders = () => {
        axios
        .get("/orders/all")
        .then(response => response.data)
        .then((data) =>{             
            if(data){
                setOrders(data);
            }                                   
        })
        .catch((error) => {
           //TODO
        });    
   };

   const deleteOrder = (id) => {
        axios
        .put("/orders/" + id + "/block")
        .then(() =>{             
            getOrders();                                 
        })
        .catch((error) => {
        //TODO
        }); 
   }
    
    return (
        <div className="orders">
            <div className="container">
                <div className="well well-sm row" style={{fontFamily:"sans-serif"}}>
                        <div className="col-md-8"></div>
                        <div className="search col-md-4">
                            <InputGroup>
                                <Form.Control
                                    placeholder="???????"
                                    aria-label="???????"
                                    aria-describedby="basic-addon1"
                                    // onChange={inputHandler}
                                />
                                <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                            </InputGroup>
                        </div>
                </div> 
                <div className='item  list-group-item'> 
                    <div className='order-wrapper' style={{fontWeight:"bold"}}>
                        <div className="col-md-1"></div>                            
                        <div className="col-md-2">Create date</div>
                        <div className="col-md-3">Client</div>
                        <div className="col-md-1">Cost</div>
                        <div className="col-md-2"><i className="bi bi-download"></i>&nbsp;Description</div>
                        <div className="col-md-2">Action</div>
                        <div className="col-md-1">Delete</div>
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
                                <div onClick={()=>deleteOrder(order.id)} className="col-md-1 delete">Delete</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ClientProfileModal show={showModal} onHide={()=>setShowModal(false)} id={clientId} getOrders={()=>getOrders()} />         
        </div>
    );
}