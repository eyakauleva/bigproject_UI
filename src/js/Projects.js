import React, { useState, useEffect } from "react";
import '.././css/Projects.css';
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';

export default function Projects() {
    const [isList, setIsList] = useState(false);
    function changeOnListOrGrid(e , isList){
        setIsList(isList);
      }
    return(
        <div className="projects">
            <div className="container">
                <div className="well well-sm">
                    <strong>Display</strong>
                    <div className="btn-group">
                       <a href="#" id="list" className="btn-custom btn-custom-default btn-sm" onClick={(e) => changeOnListOrGrid(e, true)}>
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
                        <a href="#" id="grid" className="btn-custom btn-custom-default btn-sm" onClick={(e) => changeOnListOrGrid(e, false)}>
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
                </div>
                <div id="products" className="row list-group-item">
                    <div className={isList ? 'item col-md-4 col-lg-4 list-group-item' : 'item col-md-4 col-lg-4 grid-group-item'}>
                        <div className="thumbnail">
                            <img className="group list-group-image" src="http://placehold.it/400x250/000/fff" alt="" />
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
                            <img className="group list-group-image" src="http://placehold.it/400x250/000/fff" alt="" />
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