import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import { format } from "date-fns";
import axios from "axios";

import {logout} from '../Sidebar.js';

import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { LinearScale, CategoryScale } from 'chart.js';
Chart.register(LinearScale, CategoryScale);

export default function TicketsChart(props) {
    const[cookies, setCookie] = useCookies(["token"]);
    const labels = ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'];
    const[values, setValues] = useState([]);
    const[totalCount, setTotalCount] = useState(0);
    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                  label: (context) => {
                    return context.formattedValue;
                  }
                }
            },
        }
    };

    const data = {
        labels: labels,
        datasets: [
          {
            label: 'Awaiting tickets',
            data: values,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
    };

    useEffect(() => {
        getProjectTickets();
    }, []);

    const getProjectTickets = async () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        if(props.projectId != undefined){
            axios
            .get("/project/" + props.projectId + "/tickets", config)
            .then(response => response.data)
            .then((_data) =>{
                if(_data){
                    let total = 0;
                    let count = [labels.length];
                    labels.map((label, idx)=>{
                        count[idx] = Object
                                .values(_data)
                                .filter((ticket)=>{
                                    return ticket.status === label;
                                })
                                .length;
                        total += count[idx];
                    });
                    setValues(count);
                    setTotalCount(total);
                }                    
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null)
                alert(error.response.data.message);
                else if(code===401)
                alert('Authorization is required');
                else if(code===403)
                alert("Access is denied"); 
                else alert('Internal server error');
            });
        }
    }

    return (
        <div>
            <div style={{marginTop: "10%"}}>
            {
                totalCount > 0
                ? <Pie options={options} data={data} />
                : ''
            }
            </div>
            <div style={{marginTop: "10%", textAlign: "center"}}>Total count:&nbsp;<b>{totalCount}</b></div>
        </div> 
    );
}