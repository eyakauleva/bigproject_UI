import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, parseISO, differenceInHours, differenceInMinutes } from "date-fns";

import '../../css/Task.css';

export default class Task extends React.Component {


  isTaskOverdued() {
    const statusList = ['READY_FOR_TEST', 'CLOSE'];
    return this.props.task.dueDate !== null && 
           !statusList.includes(this.props.task.status) && 
           (differenceInMinutes(new Date(this.props.task.dueDate).getTime(), new Date().getTime()) % 60 < 0 || 
           differenceInHours(new Date(this.props.task.dueDate).getTime(), new Date().getTime()) < 0);
  } 

  render() {
    return (
      <Draggable draggableId={this.props.task.id} index={this.props.index} >
        {provided => (
          <div className={this.isTaskOverdued() === true ? 'task-container overdue-task' : 'task-container'}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}>
            <div className='name' onClick={() => this.props.navigate("ticket/"+this.props.task.id)}>{this.props.task.content}</div>
            <div className='due-date'>{this.props.task.dueDate != null ? <p>{format(parseISO(this.props.task.dueDate), "do MMMM Y")}</p> : ''}</div>
            <div className='icon-panel'>
              {
                this.props.task.severity === "CRITICAL"
                ? <div>
                    <div className='severity' style={this.isTaskOverdued() ? {fontSize:'14px', color:'white'} : {fontSize:'14px', color:'#FF0000'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
                      <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>                     
                      &nbsp;{this.props.task.severity}
                    </div>
                    <div style={this.isTaskOverdued() ? {fontSize:'14px', color:'white'} : {fontSize:'14px', color:'#FF0000'}}>
                      {differenceInHours(new Date(this.props.task.dueDate).getTime(), new Date().getTime())}h&nbsp;
                      {differenceInMinutes(new Date(this.props.task.dueDate).getTime(), new Date().getTime()) % 60}m
                    </div>
                  </div>
                : this.props.task.severity === "HIGH"
                ? <div> 
                    <div className='severity' style={this.isTaskOverdued() ? {fontSize:'14px', color:'white'} : {fontSize:'14px', color:'#FF7A2F'}}> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
                      </svg>
                      &nbsp;{this.props.task.severity}
                    </div>
                    <div style={this.isTaskOverdued() ? {fontSize:'14px', color:'white'} : {fontSize:'14px', color:'#FF7A2F'}}>
                      {differenceInHours(new Date(this.props.task.dueDate).getTime(), new Date().getTime())}h&nbsp;
                      {differenceInMinutes(new Date(this.props.task.dueDate).getTime(), new Date().getTime()) % 60}m
                    </div>
                  </div>
                : this.props.task.severity === 'NORMAL'
                ? <div> 
                    <div className='severity' style={{color:'#17F1D7'}}> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-square" viewBox="0 0 16 16">
                        <path d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6z"/>
                        <path d="M12.93 5h1.57a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-1.57a6.953 6.953 0 0 1-1-.22v1.79A1.5 1.5 0 0 0 5.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 4h-1.79c.097.324.17.658.22 1z"/>
                      </svg>
                      &nbsp;{this.props.task.severity}
                    </div>
                  </div>  
                : this.props.task.severity === 'LOW'   
                ? <div> 
                    <div style={{color:'#00DC7D', fontSize:'14px', fontWeight:'bold'}}> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-app-indicator" viewBox="0 0 16 16">
                        <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z"/>
                        <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                      </svg>
                      &nbsp;{this.props.task.severity}
                    </div>
                  </div>
                : ''      
              }
              <img className="assignee-pic" src={`data:image/jpeg;base64,${this.props.task.assigneePhoto}`} 
                  onClick={() => this.props.navigate("profile/"+this.props.task.assigneeId)} title={this.props.task.assigneeName} alt="" />
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
