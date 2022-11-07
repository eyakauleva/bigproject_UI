import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useCookies } from "react-cookie";
import axios from "axios";
import { FaList, FaTh } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useParams } from 'react-router-dom';

import Column from './Column';

import '../../css/Dashboard.css';
import '../../css/Projects.css';

function Dashboard(props) {
  const initialData = {
    tasks: {},
    columns: {
      'OPEN': {id: 'OPEN', title: 'OPEN', taskIds: [], },
      'IN_DESIGN': {id: 'IN_DESIGN', title: 'IN_DESIGN', taskIds: [], },
      'IN_BUILD': {id: 'IN_BUILD', title: 'IN_BUILD', taskIds: [], },
      'READY_FOR_TEST': {id: 'READY_FOR_TEST', itle: 'READY_FOR_TEST', taskIds: [], },
      'CLOSE': {id: 'CLOSE', title: 'CLOSE', taskIds: [], },
    },
    columnOrder: ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'],
  };
  const[data, setData] = useState(initialData);
  const[initFlag, setInitFlag] = useState(false); // flag to rerender component after data initialization  
  const {id} = useParams(); 

  // const[cookies, setCookie] = useCookies(["token"]);

  useEffect(() => {
    getTickets();     
  }, []);

  function getTickets(){ 
    if(id){
      
      //TODO get current project by userId
      let projectId = 1;

      axios
      .get("/project/" + projectId + "/tickets")
      .then(response => response.data)
      .then((_data) =>{
          if(_data){          
            _data.map(ticket => {
              let ticket_id_toString = '' + ticket.id;
              let task = {
                id: ticket_id_toString, 
                content: ticket.name, 
                order: ticket.order, 
                dueDate: ticket.dueDate,
                severity: ticket.severity,
                assigneePhoto: ticket.assignee.photo,
                assigneeName: ticket.assignee.user.name + " " + ticket.assignee.user.surname};
              const {tasks} = data;
              tasks[ticket_id_toString] = task;
              data.columns[ticket.status].taskIds.push(task.id);              
            })  
            setInitFlag(true);
          }                    
      })
      .catch((error) => {
          //TODO
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
  
      setData(newState);

      axios
      .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title)
      .catch((error) => {
        //TODO
      }); 

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

    setData(newState);

    axios
    .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title)
    .catch((error) => {
      // TODO
    });     
  };  

  return (
    <div className="projects">
        <div className="container">
                <div className="well well-sm">
                  <strong className="col-md-3">Display:</strong>
                    <div className="btn-group col-md-3">
                       <a href="#" id="list" className="btn-custom btn-custom-default btn-sm">
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
                        <a href="#" id="grid" className="btn-custom btn-custom-default btn-sm">
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
                        />
                        <InputGroup.Text id="basic-addon1"><i className="bi bi-search"></i></InputGroup.Text>
                    </InputGroup>
                    </div>
                </div>
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

export default Dashboard;
