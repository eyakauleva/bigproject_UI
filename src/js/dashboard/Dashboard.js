import { useState, useLayoutEffect, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useCookies } from "react-cookie";
import axios from "axios";
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import {logout} from '../Sidebar.js';
import Column from './Column';
import SearchBar from "./SearchBar";
import '../../css/Dashboard.css';
import '../../css/Projects.css';

export default function Dashboard(props) {
  const initialData = {
    tasks: {},
    columns: {
      'OPEN': {id: 'OPEN', title: 'OPEN', taskIds: [], },
      'IN_DESIGN': {id: 'IN_DESIGN', title: 'IN_DESIGN', taskIds: [], },
      'IN_BUILD': {id: 'IN_BUILD', title: 'IN_BUILD', taskIds: [], },
      'READY_FOR_TEST': {id: 'READY_FOR_TEST', title: 'READY_FOR_TEST', taskIds: [], },
      'CLOSE': {id: 'CLOSE', title: 'CLOSE', taskIds: [], },
    },
    columnOrder: ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'],
  };
  const[data, setData] = useState(initialData);
  const {id} = useParams(); 
  const[searchData, setSearchData] = useState([]);
  const[filterSeverity, setFilterSeverity] = useState("CRITICAL");
  const[isShowOnlyMine, setShowOnlyMine] = useState(false);
  const[cookies] = useCookies(["token", "employeeId"]);
  const[error, setError] = useState("");

  useLayoutEffect(() => {
    getTickets();     
  }, []);

  const filterBySeverity = (value) => {
    setFilterSeverity(value);
    
    data.columnOrder.map((columnName) => {
      data.columns[columnName].taskIds.sort((a)=>
        data.tasks[a].severity != value ? 1 : -1,
      );
    }); 
  }

  const showOnlyMine = (isChecked) => {
    setShowOnlyMine(isChecked);

    if(isChecked) {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds = 
          data.columns[columnName].taskIds.filter((a)=>
            data.tasks[a].assigneeId == parseInt(cookies.employeeId)
          );
      }); 
    } else{
      searchData.map(ticket => {
        let doContain = false;
        data.columnOrder.map((columnName) => {
          data.columns[columnName].taskIds.map(task_id => {
            if(task_id==ticket.id)
              doContain = true;
          });
        });
        if(!doContain){
          let columnName = data.tasks[ticket.id].status;
          data.columns[columnName].taskIds.push(ticket.id);
        }
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

  function getTickets(){ 
    if(id){
      let config = {
        headers: {
            Authorization: 'Bearer ' + cookies.token
        }
      };

      axios
      .get("/project/" + id + "/tickets", config)
      .then(response => response.data)
      .then((_data) =>{
          if(_data){
            _data.sort((a) =>
              a.severity != filterSeverity ? 1 : -1,
            )
            .map(ticket => {
              let ticket_id_toString = '' + ticket.id;
              let task = {
                id: ticket_id_toString, 
                content: ticket.name, 
                order: ticket.order, 
                dueDate: ticket.dueDate,
                severity: ticket.severity,
                status: ticket.status,
                assigneePhoto: ticket.assignee.photo,
                assigneeName: ticket.assignee.user.name + " " + ticket.assignee.user.surname,
                assigneeId: ticket.assignee.id};
              const {tasks} = data;
              tasks[ticket_id_toString] = task;
              data.columns[ticket.status].taskIds.push(task.id);              
            }) 
            setSearchData(_data);
          }                    
      })
      .catch((error) => {
        console.log(error);
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

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if(start == finish){
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
  
      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };
  
      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      let config = {
        headers: {
            Authorization: 'Bearer ' + cookies.token
        }
      };

      let initData = data;

      newState.tasks[draggableId].status = finish.title;

      axios
      .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title,
            null, config)
      .then(()=>{})
      .catch((error) => {
        let code = error.toJSON().status;
        if(code===400 && error.response.data !== null)
            alert(error.response.data.message);
        else if(code===401)
          setError('Authorization is required');
        else if(code===403)
          alert("Access is denied"); 
        else alert('Internal server error');
        setData(initData);
      }); 

      setData(newState);

      return;
    }

    const startTasksIds = Array.from(start.taskIds);
    startTasksIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTasksIds,
    };

    const finishTasksIds = Array.from(finish.taskIds);
    finishTasksIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTasksIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      },
    };

    let config = {
      headers: {
          Authorization: 'Bearer ' + cookies.token
      }
    };

    let initData = data;

    newState.tasks[draggableId].status = finish.title;

    axios
    .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title, 
          null, config)
    .then(()=>{})
    .catch((error) => {
      let code = error.toJSON().status;
      if(code===400 && error.response.data !== null)
          alert(error.response.data.message);
      else if(code===401)
        setError('Authorization is required');
      else if(code===403)
        alert("Access is denied"); 
      else alert('Internal server error');
      setData(initData);
    });      
    
    setData(newState);
    
  };  

  return (
    <div className="projects">
      {displayError()}
      <div className="container" style={{fontFamily:"sans-serif"}}>
        <div className="row switch-project">
          <div className='col-1'>Project</div>
          {/* TODO display all employee's projects*/}
          <Form.Select size="sm" onChange={e => filterBySeverity(e.target.value)} style={{"width":"10%"}}>
            <option selected value='CRITICAL'>CRITICAL</option>                    
            <option value='HIGH'>HIGH</option>
            <option value='NORMAL'>NORMAL</option>
            <option value='LOW'>LOW</option>
          </Form.Select>
          {/* TODO display employees*/}
          <div className='col-3'></div>
        </div>
        <div className="well well-sm row">
          <div className='col-1 filter-title'>Show first</div>
          <Form.Select size="sm" onChange={e => filterBySeverity(e.target.value)} style={{"width":"10%"}}>
            <option selected value='CRITICAL'>CRITICAL</option>                    
            <option value='HIGH'>HIGH</option>
            <option value='NORMAL'>NORMAL</option>
            <option value='LOW'>LOW</option>
          </Form.Select>
          <Form.Check onChange={e => showOnlyMine(e.target.checked)} className='col-2 filter-only-mine' type="switch" label="&nbsp;Only mine" />
          <div className='col-3'></div> 
          <SearchBar placeholder="Ticket name" data={searchData}/>
        </div>  
      </div>
      <div className="container">                        
        <div className="dashboard">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className='dash-container'>
            {
              data.columnOrder.map(columnId => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map(taskId => data.tasks[taskId]);    
                return <div className='wrapper'><Column key={column.id} column={column} tasks={tasks} navigate={props.navigate}/></div>;
              }) 
            }
            </div>
          </DragDropContext>                  
        </div>  
      </div>
    </div>
  );
}
