import React, { useState, useEffect } from "react";
import '.././css/Projects.css';
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Projects() {
    const [isList, setIsList] = useState(false);
    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
      };
      const list =  ['asda', 'asdad', 'asdasd'].filter((item) =>{
        if(inputText === ''){
            return item;
        } else {
            return item.toLowerCase().includes(inputText);
        }
    });
    return(
        <div className="projects">
            <div className="container">
                <div className="well well-sm">
                    <strong className="col-md-3">Display:</strong>
                    <div className="btn-group col-md-3">
                       <a href="#" id="list" className="btn-custom btn-custom-default btn-sm" onClick={() => setIsList(true)}>
                           <IconContext.Provider
                                value={{ 
                                    className: "glyphicon glyphicon-th-list",
                                    size: '15px'
                                }}
                            >
                           <FaList/>
                           </IconContext.Provider>
                           List
                        </a> 
                        <a href="#" id="grid" className="btn-custom btn-custom-default btn-sm" onClick={() => setIsList(false)}>
                            <IconContext.Provider
                                value={{ 
                                    className: "glyphicon glyphicon-th",
                                    size: '15px'
                                }}
                            >
                           <FaTh/>
                           </IconContext.Provider>
                            Grid
                        </a>
                    </div>
                    <div className="search">
                    <InputGroup>
                        <Form.Control
                            placeholder="Username"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            onChange={inputHandler}
                        />
                        <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                    </InputGroup>
                    </div>
                </div>
                <div id="products" className={isList ? '' : 'row'}>
                {/* {list.map(item => (
                    <div key={item}>{item}</div>
                    ))} */}
                    <div className={isList ? 'item col-md-4 col-lg-4 list-group-item' : 'item col-md-4 col-lg-4 grid-group-item'}>
                        <div className="thumbnail">
                            <div className="caption">
                                <h4 className="group inner list-group-item-heading">
                                    Product title</h4>
                                <p className="group inner list-group-item-text">
                                    Product description... Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                                    sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
                                <div className="row">
                                    <div className="col-xs-12 col-md-6">
                                        <p className="lead">
                                            $21.000</p>
                                    </div>
                                    <div className="col-xs-12 col-md-6">
                                        <a className="btn btn-success" href="http://www.jquery2dotnet.com">Add to cart</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={isList ? 'item col-md-4 col-lg-4 list-group-item' : 'item col-md-4 col-lg-4 grid-group-item'}>
                        <div className="thumbnail">
                            <div className="caption">
                                <h4 className="group inner list-group-item-heading">
                                    Product title</h4>
                                <p className="group inner list-group-item-text">
                                    Product description... Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                                    sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
                                <div className="row">
                                    <div className="col-xs-12 col-md-6">
                                        <p className="lead">
                                            $21.000</p>
                                    </div>
                                    <div className="col-xs-12 col-md-6">
                                        <a className="btn btn-success" href="http://www.jquery2dotnet.com">Add to cart</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}