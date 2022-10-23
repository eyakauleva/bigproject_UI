import { useState, useEffect } from 'react';

import initialData from './initial-data';
import Column from './Column';
import { DragDropContext } from '@hello-pangea/dnd';
import { useCookies } from "react-cookie";
import axios from "axios";

import '../../css/Dashboard.css';

function Dashboard() {
  const[data, setData] = useState(initialData);
  const[initFlag, setInitFlag] = useState(false); // flag to rerender component after data initialization

  // const[cookies, setCookie] = useCookies(["token"]);

  useEffect(() => {
    getTickets(); 
    
  }, []);

  function getTickets(){    
    axios
    .get("/project/1/tickets")
    .then(response => response.data)
    .then((_data) =>{
        if(_data){
          _data.map(ticket => {
            let ticket_id_toString = ''+ticket.id;
            let task = {id: ticket_id_toString, content: ticket.name, order: ticket.order};
            const {tasks} = data;
            tasks[ticket_id_toString] = task;
            data.columns[ticket.status].taskIds.push(task.id);
            setInitFlag(true);
          })  
        }                    
    })
    .catch((error) => {
        
    }); 
    
    
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
      .then(()=>{
      })
      .catch((error) => {
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


    // --- maybe can be removed after backend added

    // Object.keys(data.tasks).map((key, index) => {
    //   if(data.tasks[key].order>=destination.index)
    //     data.tasks[key].order-=1;
    // });

    // console.log(data.tasks);

    // const startTask = {
    //   ...data.tasks[draggableId],
    //   order: destination.index,
    // };

    // const finishTask = {
    //   ...data.tasks[destination.index], // ticket's id and order must be the same!!!!
    //   order: source.index,
    // };

    // ---


    const newState = {
      ...data,
      // --- maybe can be removed after backend added
      // tasks: {
      //   ...data.tasks,
      //   [startTask.id]: startTask,
      //   [finishTask.id]: finishTask,
      // },
      // --- 
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      },
    };

    setData(newState);

    console.log("id=" + draggableId);
    console.log("destination=" + destination.index);
    console.log("destinationColumn=" + finish.title);
    axios
    .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title)
    .then(()=>{
    })
    .catch((error) => {
    }); 
    
  };

  return (
    <div className="dashboard">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className='dash-container'>
        {
          data.columnOrder.map(columnId => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);    
            return <div className='wrapper'><Column key={column.id} column={column} tasks={tasks} /></div>;
          }) 
        }
        </div>
      </DragDropContext>
    </div>        
  );
}

export default Dashboard;
