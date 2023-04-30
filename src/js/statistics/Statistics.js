import React, { useState, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { format } from "date-fns";
import axios from "axios";
import jwt_decode from "jwt-decode";

import {logout} from '../Sidebar.js';
import TimeChart from './TimeChart.js';
import TicketsChart from './TicketsChart.js';
import ClosureChart from './ClosureChart.js';
import '../../css/Statistics.css';

export default function Statistics(props) {
    const[cookies, setCookie] = useCookies(["token", "employeeId"]);
    const[errorMessage, setErrorMessage] = useState("");
    const[error, setError] = useState("");

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const[dates, setDates] = useState([]);
    const[leftCount, setLeftCount] = useState(0);
    const[expiredCount, setExpiredCount] = useState(0);
    const[upcomingDeadline, setUpcomingDeadline] = useState([]);
    const[projects, setProjects] = useState([]);

    useLayoutEffect(() => {
        let datesBuf = [];
        if(dates.length != 7) {
            labels.forEach((label, idx) => {
                let today = new Date();
                let day = today.getDay() || 7;
                if(day !== (idx + 1)) {
                    today.setHours(-24 * (day - idx - 1));
                }
                datesBuf.push(format(today, 'yyyy-MM-dd').toString());
            });
            setDates(prevDates => [...prevDates, ...datesBuf]);
        }
        getCurrentProjects();
        setStatisticsData();
    }, []);

    const getCurrentProjects = () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        let decodedToken = jwt_decode(cookies.token);

        if(decodedToken.role!=="ROLE_CUSTOMER"){
            axios
            .get("/employee/user/" + decodedToken.id, config)
            .then(response => response.data)
            .then((data) =>{
                if(data.currentProjects!=null){
                    setProjects(data.currentProjects.sort((a, b) => a.id > b.id ? 1 : -1));
                }                  
            })
            .catch((error) => {               
                let code = error.toJSON().status;
                if(code===401){
                    alert('Authorization is required');
                }
                else alert('Internal server error');
            });

        } else {
            axios
            .get("/orders/" + decodedToken.id + "/project", config)
            .then(response => response.data)
            .then((data) =>{
              if(data){
                let projects = [];
                data.orders.map(order => projects.push(order.project));
                setProjects(projects.sort((a, b) => a.id > b.id ? 1 : -1)); 
              } 
                            
            })
            .catch((error) => {               
                let code = error.toJSON().status;
                if(code===401){
                    alert('Authorization is required');
                }
                else alert('Internal server error');
            });
        }
    }

    function setStatisticsData(){ 
        let assigneeId = document.cookie
                              .split("; ")
                              .find((row) => row.startsWith("employeeId="))
                              ?.split("=")[1];
    
        if(assigneeId != undefined){
          let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
          };
      
          axios
          .get("/project/assignee/" + assigneeId, config)
          .then(response => response.data)
          .then((data) =>{
              if(data){
                let leftTickets = Object
                                .values(data)
                                .filter((ticket)=>{
                                    return ticket.status !== 'CLOSE' 
                                        && ticket.status !== 'READY_FOR_TEST' 
                                        && ticket.type !== 'PROJECT';
                                });
                setLeftCount(leftTickets.length);

                const today = new Date();

                let expiredTickets = leftTickets
                                    .filter((ticket)=>{
                                        let dueDate = new Date(ticket.dueDate);
                                        return  (dueDate.getDate() < today.getDate() 
                                                    && dueDate.getMonth() === today.getMonth()
                                                    && dueDate.getFullYear() === today.getFullYear()) ||
                                                (dueDate.getMonth() < today.getMonth()
                                                    && dueDate.getFullYear() === today.getFullYear()) ||
                                                dueDate.getFullYear() < today.getFullYear();
                                    });
                setExpiredCount(expiredTickets.length);

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                let upcomingDeadlineTickets = leftTickets
                                        .filter((ticket)=>{
                                            let dueDate = new Date(ticket.dueDate);
                                            return  (dueDate.getDate() === tomorrow.getDate() &&
                                                    dueDate.getMonth() === tomorrow.getMonth() &&
                                                    dueDate.getFullYear() === tomorrow.getFullYear())
                                                    ||
                                                    (dueDate.getDate() === today.getDate() &&
                                                    dueDate.getMonth() === today.getMonth() &&
                                                    dueDate.getFullYear() === today.getFullYear());
                                        });
                setUpcomingDeadline(
                    expiredTickets.concat(upcomingDeadlineTickets)
                                    .sort(function(t1, t2){
                                        return new Date(t1.dueDate) - new Date(t2.dueDate);
                                    })
                );
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
        }
    }

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
    }

    const changeWeek = (previous) => {
        let mult = 1;
        if(previous){
            mult = -1;
        }
        const newDates = [...dates];
        newDates.forEach((date, idx) => {
            let buf = new Date(date);
            buf.setHours(mult * 24 * 7);
            newDates[idx] = format(buf, 'yyyy-MM-dd').toString();
        });
        setDates(newDates);
    }

    const getColor = (count) => {
        if (count == 0) {
            return "#BEF761";
        } else if (count < 3) {
            return "#FFF851";
        } else {
            return "#F85C50";
        }
    }

    const getFontColor = (count) => {
        if (count == 0) {
            return "black";
        } else if (count < 3) {
            return "black";
        } else {
            return "white";
        }
    } 

    return (
        <div className="profile statistics">
            {displayError()}
            <div className="container emp-profile">
                <Tabs
                    defaultActiveKey="my" className="mb-3">
                    <Tab eventKey="my" title="My">
                        <div className="row">
                            <div className="col-md-6 wrapper">
                                <div className="title">My logged time throughout the week:</div>
                                <div className="dates-swicther">
                                    <div onClick={()=>changeWeek(true)}>
                                        {dates.length == 7 
                                        ? <div className="date-switcher-el">
                                            <div className="date">{format(new Date(dates[0]), 'dd.MM.yyyy')}</div>
                                            <div><i class="bi bi-caret-left-square"></i></div>
                                        </div>
                                        : ''}
                                    </div>
                                    <div onClick={()=>changeWeek(false)}>
                                        {dates.length == 7 
                                        ? <div className="date-switcher-el">
                                            <div><i class="bi bi-caret-right-square"></i></div>
                                            <div className="date">{format(new Date(dates[6]), 'dd.MM.yyyy')}</div>
                                        </div> 
                                        : ''}
                                    </div>
                                </div>
                                <div>
                                    <TimeChart dates={dates} labels={labels} />
                                </div>
                            </div>
                            <div className="col-md-1"></div>
                            <div className="col-md-4 wrapper">
                                <table className="wrapper-table">
                                    <tr>
                                        <td><div>Total tickets left:</div></td>
                                        <td><div className="number-circle" style={{background: getColor(leftCount), color: getFontColor(leftCount)}}>
                                            {leftCount}
                                        </div></td>
                                    </tr>
                                    <tr>
                                        <td><div>Expired tickets count:</div></td>
                                        <td><div className="number-circle" style={{background: getColor(expiredCount), color: getFontColor(expiredCount)}}>
                                            {expiredCount}
                                        </div></td>
                                    </tr>
                                </table>
                                <br/>
                                <table className="wrapper-table-tickets">
                                    <tr><td className="subtitle">Upcoming deadlines:</td></tr>
                                    <tr>
                                        <th>Ticket</th>
                                        <th>Date</th>
                                    </tr>
                                    {upcomingDeadline.map((ticket)=>
                                        <tr>
                                            <td><a href={'/app/ticket/' + ticket.id}>{ticket.name}</a></td>
                                            <td>{format(new Date(ticket.dueDate), 'dd.MM.yyyy')}</td>
                                        </tr>
                                    )} 
                                </table>
                            </div>
                        </div>
                    </Tab>
                    {
                        projects.map(project => {
                            return  <Tab eventKey={project.name} title={project.name}>
                                        <div className="row">
                                            <div className="col-md-3 wrapper">
                                                <div className="title">Today's tickets state</div>
                                                <TicketsChart projectId={project.id} />
                                            </div>
                                            <div className="col-md-2"></div>
                                            <div className="col-md-6 wrapper">
                                                <div className="title">Tickets closure throughout the week:</div>
                                                <div className="dates-swicther">
                                                    <div onClick={()=>changeWeek(true)}>
                                                        {dates.length == 7 
                                                        ? <div className="date-switcher-el">
                                                            <div className="date">{format(new Date(dates[0]), 'dd.MM.yyyy')}</div>
                                                            <div><i class="bi bi-caret-left-square"></i></div>
                                                        </div>
                                                        : ''}
                                                    </div>
                                                    <div onClick={()=>changeWeek(false)}>
                                                        {dates.length == 7 
                                                        ? <div className="date-switcher-el">
                                                            <div><i class="bi bi-caret-right-square"></i></div>
                                                            <div className="date">{format(new Date(dates[6]), 'dd.MM.yyyy')}</div>
                                                        </div> 
                                                        : ''}
                                                    </div>
                                                </div>
                                                <div>
                                                    <ClosureChart dates={dates} projectId={project.id} labels={labels} />
                                                </div>
                                            </div>
                                        </div>
                                    </Tab>
                        })
                    }
                </Tabs>         
            </div>
        </div>    
    );
}