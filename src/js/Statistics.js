import React, { useState, useEffect, useLayoutEffect } from "react";
import { useCookies } from 'react-cookie';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Bar } from 'react-chartjs-2';
import { format } from "date-fns";
import axios from "axios";
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import TimeChart from './TimeChart.js';
import '.././css/Profile.css';

export default function Statistics(props) {
    const[cookies, setCookie] = useCookies(["token", "employeeId"]);
    const[errorMessage, setErrorMessage] = useState("");
    const[error, setError] = useState("");

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const[dates, setDates] = useState([]);

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
    }, []);

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

    return (
        <div className="profile">
            {displayError()}
            <div className="container emp-profile">
                <Tabs
                    defaultActiveKey="my" className="mb-3">
                    <Tab eventKey="my" title="My">
                        <div>Week activity</div>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <div onClick={()=>changeWeek(true)}>
                                {dates.length == 7 ? format(new Date(dates[0]), 'dd.MM.yyyy') : ''}<i class="bi bi-caret-left"></i>
                            </div>
                            <div onClick={()=>changeWeek(false)}>
                                <i class="bi bi-caret-right"></i>{dates.length == 7 ? format(new Date(dates[6]), 'dd.MM.yyyy') : ''}
                            </div>
                        </div>
                        <div style={{height: '400px', width: '600px'}}>
                            <TimeChart dates={dates} labels={labels} />
                        </div>
                    </Tab>
                    <Tab eventKey="?Project?" title="?Project?">
                        <div className="tab-panel">
                            <div className="row">
                                <div className="col-md-3">
                                    <label>Start date at company</label>
                                </div>
                            </div>
                        </div>
                    </Tab>
                </Tabs>         
            </div>
        </div>    
    );
}