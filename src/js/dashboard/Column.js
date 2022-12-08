import React from 'react';
import { Droppable } from '@hello-pangea/dnd';

import Task from './Task';

import '../../css/Column.css';

export default class Column extends React.Component {
  render() {
    return (
      <div className='column-container'>
        <h3 className='title'>{this.props.column.title} {this.props.tasks.length}</h3>
        <Droppable droppableId={this.props.column.id}>
          {provided => (
            <div className='tasks-list' ref={provided.innerRef} {...provided.droppableProps}>
              {this.props.tasks.map((task, index) => (
                <Task key={task.id} task={task} index={index} navigate={this.props.navigate} />
              ))}              
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  }
}
