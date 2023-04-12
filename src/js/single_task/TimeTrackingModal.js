import Modal from 'react-bootstrap/Modal';
import { useState, useLayoutEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from "axios";

const TimeTrackingModal = (props) =>{
    const[estimatedTime, setEstimatedTime] = useState(0);
    const[loggedTime, setLoggedTime] = useState(0);
    const[ticket, setTicket] = useState({});
    const[cookies] = useCookies(["token"]);

    useLayoutEffect(() => {
        setEstimatedTime(props.ticket.estimatedTime);
        setLoggedTime(props.ticket.loggedTime);   
      }, [props.ticket.estimatedTime, props.ticket.loggedTime]);
      useLayoutEffect(() => {
        setTicket(props.ticket);
      }, [props.ticket]);
    const updateTimeOfTicket = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };
        if(estimatedTime === undefined) {
            setEstimatedTime(props.ticket.estimatedTime);
        }
        let time = {
            estimatedTime: estimatedTime,
            loggedTime: loggedTime
        }; 
        let newTicketState = ticket;
        newTicketState.estimatedTime = estimatedTime;
        newTicketState.loggedTime = loggedTime;
        setTicket(newTicketState);
        axios
          .put("/project/tickets/" + props.ticket.id + "/time", time, config)
          .then(() => {
            props.close(false);
            props.submitChange(estimatedTime, loggedTime);
        })
          .catch((error) => {
            console.log(error);
        }); 
    }
    return (
        <Modal
        {...props} 
        centered
        size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Time Tracking</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="time-modal-item">
                    <span>Estimated time:</span>
                    <input type="number" className="log-form" defaultValue={estimatedTime} min="0" onChange={e => setEstimatedTime(e.target.value) }
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                event.preventDefault();
                                                }
                                            }}
                    />
                </div>
                <div className="time-modal-item">
                    <span>Logged time:</span>
                    <input type="number" className="log-form" defaultValue="" min="0" onChange={e => setLoggedTime(ticket.loggedTime + parseInt(e.target.value))}
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                event.preventDefault();
                                                }
                                            }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div>                                       
                    <input type="submit" onClick={() => updateTimeOfTicket()} className="btn btn-outline-primary" value="Save" />
                </div>
                <div>
                    <input 
                      type="button" 
                      onClick={() => {props.close(false); setEstimatedTime(ticket.estimatedTime); setLoggedTime(ticket.loggedTime);}}
                      className="btn btn-outline-danger" 
                      value="Cancel" 
                    />
                </div>
            </Modal.Footer>
        </Modal>
    );
}
export default TimeTrackingModal;