import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import { format } from "date-fns";
import axios from "axios";

import {logout} from '../Sidebar.js';

import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { LinearScale, CategoryScale } from 'chart.js';
Chart.register(LinearScale, CategoryScale);

export default function ClosureChart(props) {
    const[cookies, setCookie] = useCookies(["token"]);
    const[values, setValues] = useState([]);
    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                  label: (context) => {
                    let date = '';
                    props.labels.forEach((label, idx) => {
                        if(label === context.label){
                            date = format(new Date(props.dates[idx]), 'dd.MM.yyyy');
                        }
                    })
                    return date + ' — ' + context.formattedValue + ' closed';
                  }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const data = {
        labels: props.labels,
        datasets: [
          {
            label: 'Closed tckets',
            data: values,
            borderWidth: 1.5,
            borderColor: 'rgba(2, 96, 232, 0.7)',
            backgroundColor: 'rgba(2, 96, 232, 0.7)',
          },
        ],
    };

    useEffect(() => {
        if(props.dates.length > 0){
            getClosedTicketsCount();
        }
    }, [props.dates]);

    const getClosedTicketsCount = async () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        if(props.projectId != undefined){
            axios
            .get("/project/closedCount/" + props.projectId + "?weekFirstDate=" + props.dates[0]
                + "&weekLastDate=" + props.dates[6], config)
            .then(response => response.data)
            .then((_data) =>{
                if(_data){
                    setValues(_data);
                }                    
            })
            .catch((error) => {
                let code = error.status;
                if(code===401)
                    document.cookie = "expired=true; path=/";
                else if(code===403)
                    alert("Access is denied"); 
                else if(code!==undefined && code!==null) {
                    alert('Internal server error');
                }
            });
        }
    }

    return (
        <div>
            <Line options={options} data={data} />
        </div> 
    );
}