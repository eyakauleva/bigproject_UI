import Modal from 'react-bootstrap/Modal';
import { useState, useLayoutEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from "axios";

const TimeTrackingModal = (props) =>{
    const[estimatedTime, setEstimatedTime] = useState(0.0);
    const[loggedTime, setLoggedTime] = useState(0);
    const[ticket, setTicket] = useState({});
    const[cookies] = useCookies(["token"]);

    useLayoutEffect(() => {
        setEstimatedTime(props.ticket.estimatedTime);
        setTicket(props.ticket);
    }, [props]);

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
            loggedTime: loggedTime,
            ticketId: props.ticket.id
        }; 

        let employeeId = document.cookie
                        .split("; ")
                        .find((row) => row.startsWith("employeeId="))
                        ?.split("=")[1]
        axios
          .post("/time/" + employeeId, time, config)
          .then(() => {
            let newTicketState = ticket;
            newTicketState.estimatedTime = estimatedTime;
            setTicket(newTicketState);
            setLoggedTime(0);

            props.close(false);
            props.submitChange(estimatedTime, loggedTime);
        })
          .catch((error) => {
            let code = error.status;
            if(code===401)
                alert('Authorization is required');
            else if(code===403)
                alert("Access is denied");
            else alert('Internal server error');
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
                    <input type="number" className="log-form" defaultValue="" min="0" onChange={e => setLoggedTime(e.target.value)}
                                            onKeyPress={(event) => {
                                                if (!/[0-9.]/.test(event.key)) {
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
                      onClick={() => {props.close(false); setEstimatedTime(ticket.estimatedTime); setLoggedTime(0); }}
                      className="btn btn-outline-danger" 
                      value="Cancel" 
                    />
                </div>
            </Modal.Footer>
        </Modal>
    );
}
export default TimeTrackingModal;