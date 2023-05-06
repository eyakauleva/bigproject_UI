import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import { format } from "date-fns";
import axios from "axios";

import {logout} from '../Sidebar.js';

import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { LinearScale, CategoryScale } from 'chart.js';
Chart.register(LinearScale, CategoryScale);

export default function TimeChart(props) {
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
                    return date + ' — ' + context.formattedValue + 'h';
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
            label: 'Logged time',
            data: values,
            backgroundColor: 'rgba(2, 96, 232, 0.7)',
          },
        ],
    };

    useEffect(() => {
        if(props.dates.length > 0){
            getWeekLoggedTime();
        }
    }, [props.dates]);

    const getWeekLoggedTime = async () => {
        let config = {
            headers: {
                Authorization: 'Bearer ' + cookies.token
            }
        };

        let employeeId = document.cookie
                        .split("; ")
                        .find((row) => row.startsWith("employeeId="))
                        ?.split("=")[1];

        await axios
        .get("/time/employee/" + employeeId + "?weekFirstDate=" + props.dates[0]
            + "&weekLastDate=" + props.dates[6], config)
        .then(response => response.data)
        .then((data_) =>{
            if(data_){
                setValues(data_);
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

    return (
        <div>
            <Bar options={options} data={data} />
        </div> 
    );
}