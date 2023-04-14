import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Line } from 'react-chartjs-2';
import axios from "axios";
import jwt_decode from "jwt-decode";

import {logout} from './Sidebar.js';
import '.././css/Profile.css';

export default function Statistics(props) {
    const[cookies, setCookie] = useCookies(["token", "employeeId"]);
    const[error, setError] = useState("");

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const options = {
        legend: {
            display: false
        },
        tooltips: {
            callbacks: {
              label: (item, data) => ('01.01.2023  '+ 8 + 'h')
            }
        },
    }
    const data = {
        labels,
        datasets: [
          {
            data: [8,8,8,8,8,0,0],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'yellow', //transparent
          },
        ],
    };

    useEffect(() => {        
        
    }, []);

    const displayError = () => {
        if(error!=="")
        {
          alert(error);
          logout();
        }
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
                            <div>
                                <i class="bi bi-caret-left"></i>
                            </div>
                            <div>
                                <i class="bi bi-caret-right"></i>
                            </div>
                        </div>
                        <div style={{height: '400px', width: '600px'}}>
                            <Line options={options} data={data} />
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