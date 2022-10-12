import React, { useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

import '.././css/Authorization.css';

function Authorization(props){ 
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[errorMessage, setErrorMessage] = useState('');
    const[cookies, setCookie] = useCookies(["token"]);

  const handleUserInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    switch(name) {
        case 'username':
            setUsername(value);
            break;
        case 'password':
            setPassword(value);
            break;
        default:
          break;
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestOptions = {
      login: username,
      password: password
    }

    axios.post('auth', requestOptions)
      .then(response => {
        setCookie("token", response.data.token, { path: '/' });
        props.navigate('/app');        
      })
      .catch((error) => {
        setErrorMessage(error.response.data.errorMessage);
      })
  }

  const renderErrorMessage = () => {
    return(
        <div className="error">{errorMessage}</div>
    );
  }

    
    return(   
        <div className="body">
                <div className="auth-form">
                    <div className="left">
                        <div className="title">Have a productive day!</div> 
                        <div className="subtitle">Relax &amp; code</div> 
                        <div className="image-wrapper">
                            <img className="image" src={require("../images/working_people.png")} />
                        </div>
                    </div>
                    <div className="right">
                        <div className="title"><h1>Log In</h1></div>
                        <div className="form">
                            <form onSubmit={handleSubmit}>
                                <div className="input-container">
                                    <input type="text" name="username" value={username} onChange={handleUserInput} 
                                            required placeholder="Username" />
                                </div>
                                <div className="input-container">
                                    <input type="password" name="password" value={password} onChange={handleUserInput}
                                            required placeholder="Password" />
                                </div>
                                {renderErrorMessage()}
                                <div className="button-container">
                                    <input type="submit" value="Login"/>
                                </div>                            
                            </form>
                        </div>
                        <div className="hint">Contact administrator in case you forgot your password</div>
                    </div>
                </div> 
        </div>
    )  
}

export default Authorization;