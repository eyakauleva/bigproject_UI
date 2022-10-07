// import '../../css/App.css';
import { useState } from 'react';

import initialData from './initial-data';
import Column from './Column';

import { DragDropContext } from '@hello-pangea/dnd';

function Dashboard() {
  const[data, setData] = useState(initialData);

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

    const column = data.columns[source.droppableId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.splice(source.index, 1);
    newTaskIds.splice(destination.index, 0, draggableId);

    const newColumn = {
      ...column,
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
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {
        data.columnOrder.map(columnId => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);    
          return <Column key={column.id} column={column} tasks={tasks} />;
        }) 
      }
    </DragDropContext>    
  );
}

export default Dashboard;
