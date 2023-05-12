import { useState, useLayoutEffect, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useCookies } from "react-cookie";
import axios from "axios";
import Form from 'react-bootstrap/Form';
import jwt_decode from "jwt-decode";

import { logout } from '../Sidebar.js';
import Column from './Column';
import SearchBar from "./SearchBar";
import '../../css/Dashboard.css';
import '../../css/Projects.css';
import ProjectEmployeesModal, { clearInput } from '../project/ProjectEmployeesModal.js';

export default function Dashboard(props) {
  const initialData = {
    tasks: {},
    columns: {
      'OPEN': { id: 'OPEN', title: 'OPEN', taskIds: [], },
      'IN_DESIGN': { id: 'IN_DESIGN', title: 'IN_DESIGN', taskIds: [], },
      'IN_BUILD': { id: 'IN_BUILD', title: 'IN_BUILD', taskIds: [], },
      'READY_FOR_TEST': { id: 'READY_FOR_TEST', title: 'READY_FOR_TEST', taskIds: [], },
      'CLOSE': { id: 'CLOSE', title: 'CLOSE', taskIds: [], },
    },
    columnOrder: ['OPEN', 'IN_DESIGN', 'IN_BUILD', 'READY_FOR_TEST', 'CLOSE'],
  };
  const [data, setData] = useState(initialData);
  const [searchData, setSearchData] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("—");
  const [filterDueDate, setFilterDueDate] = useState("—");
  const [isShowOnlyMine, setShowOnlyMine] = useState(false);
  const [project, setProject] = useState({ employees: [] });
  const [cookies] = useCookies(["token", "employeeId"]);
  const [showModal, setShowModal] = useState(false);
  const [decodedToken, setDecodedToken] = useState({});
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    setDecodedToken(jwt_decode(cookies.token));
    getProject();
    
    props.listenCookieChange(() => {
      setFilterSeverity("—");
      setShowOnlyMine(false);
      setData(initialData);
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds = []
      });
      data.tasks = {};
      getProject();
    }, 1000);
  }, []);
  useLayoutEffect(() => {
    getTickets();
  }, [project]);

  const filterBySeverity = (value) => {
    setFilterSeverity(value);
    if (value == '—') {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds.sort((a, b) =>
          data.tasks[a].order > data.tasks[b].order ? 1 : -1,
        );
      });
    }
    else {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds.sort((a) =>
          data.tasks[a].severity != value ? 1 : -1,
        );
        console.log(data.columns[columnName].taskIds)
      });
    }
  }

  const filterByDueDate = (value) => {
    setFilterDueDate(value);
    console.log(value)
    if (value == '—') {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds.sort((a, b) =>
          data.tasks[a].order > data.tasks[b].order ? 1 : -1,
        );
      });
    }
    else {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds.sort(function (a, b) {
          if (value == 'ASC') {
            return new Date(data.tasks[a].dueDate) - new Date(data.tasks[b].dueDate);
          } else if (value == 'DESC') {
            return new Date(data.tasks[b].dueDate) - new Date(data.tasks[a].dueDate);
          }
        })
      });
    }
  }

  const showOnlyMine = (isChecked) => {
    setShowOnlyMine(isChecked);
    if (isChecked) {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds =
          data.columns[columnName].taskIds.filter((a) =>
            data.tasks[a].assigneeId == parseInt(cookies.employeeId)
          );
      });
    } else {
      searchData.map(ticket => {
        let doContain = false;
        data.columnOrder.map((columnName) => {
          data.columns[columnName].taskIds.map(task_id => {
            if (task_id == ticket.id)
              doContain = true;
          });
        });
        if (!doContain) {
          let columnName = data.tasks[ticket.id].status;
          data.columns[columnName].taskIds.push(ticket.id);
        }
      });
    }
  }

  const displayError = () => {
    if (error !== "") {
      alert(error);
      logout();
    }
  }
  function getProjectByUserId(project) {
    let config = {
      headers: {
        Authorization: 'Bearer ' + cookies.token
      }
    };
    let decoded_token = jwt_decode(cookies.token);
    let id = decoded_token.id;
    axios
      .get("/orders/" + id + "/project/", config)
      .then(response => response.data)
      .then((data) => {
        if (data) {
           let userProject = data.find((order) => order.project.id == project.id)
           if(userProject){
            setProject(project);
           } else{
            setProject(data[0].project);
            document.cookie = "project=" + data[0].project.id + "; path=/";
           }
        }
      })
      .catch((error) => {
        let code = error.toJSON().status;
        if (code === 400 && error.response.data !== null)
          alert(error.response.data.message);
        else if(code===401){
          document.cookie = "expired=true; path=/";
        }
        else if(code===403)
            alert("Access is denied"); 
        else if(code!==undefined && code!==null) 
            alert('Internal server error');
      });
  }

  function getProject() {
    let currentProjectId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("project="))
      ?.split("=")[1];
    let decoded_token = jwt_decode(cookies.token);
    if (currentProjectId !== undefined) {
      let config = {
        headers: {
          Authorization: 'Bearer ' + cookies.token
        }
      };

      axios
        .get("/project/tickets/" + currentProjectId, config)
        .then(response => response.data)
        .then((data) => {
          if (data) {
            if(decoded_token.role=="ROLE_CUSTOMER") { 
              getProjectByUserId(data);
            } else {
              setProject(data);
            }
          }
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if (code === 400 && error.response.data !== null)
            alert(error.response.data.message);
          else if(code===401){
            document.cookie = "expired=true; path=/";
          }
          else if(code===403)
              alert("Access is denied"); 
          else if(code!==undefined && code!==null) 
              alert('Internal server error');
        });
    }
  }

  function getTickets() {
    let currentProjectId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("project="))
      ?.split("=")[1];
    if(project.id != undefined && project.id != currentProjectId){
      return;
    }
    if (currentProjectId !== undefined) {
      data.columnOrder.map((columnName) => {
        data.columns[columnName].taskIds = []
      });
      data.tasks = {};

      let config = {
        headers: {
          Authorization: 'Bearer ' + cookies.token
        }
      };

      axios
        .get("/project/" + currentProjectId + "/tickets", config)
        .then(response => response.data)
        .then((_data) => {
          if (_data) {
            _data
              .sort((a, b) => a.order > b.order ? 1 : -1)
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
                  assigneeId: ticket.assignee.id
                };
                const { tasks } = data;
                tasks[ticket_id_toString] = task;
                if(!data.columns[ticket.status].taskIds.find(taskId => taskId == task.id)){
                   data.columns[ticket.status].taskIds.push(task.id);
                }
              })
            setSearchData(_data);
          }
        })
        .catch((error) => {
          let code = error.toJSON().status;
          if (code === 400 && error.response.data !== null)
            alert(error.response.data.message);
          else if(code===401){
            document.cookie = "expired=true; path=/";
          }
          else if(code===403)
              alert("Access is denied"); 
          else if(code!==undefined && code!==null) 
              alert('Internal server error');
        });
    }
  }

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;

    let isUserOnProject = false;
    project.employees.map((employee) => {
      if(employee.id == cookies.employeeId) {
        isUserOnProject = true;
      }
    });
    if(!isUserOnProject) {
      alert('Acces is denied');
      return;
    }

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

    if (start == finish) {
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

      newState.tasks[draggableId].status = finish.title;

      axios
        .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title,
          null, config)
        .then(() => { })
        .catch((error) => {
          let code = error.toJSON().status;
          if (code === 400 && error.response.data !== null)
            alert(error.response.data.message);
          else if(code===401){
            document.cookie = "expired=true; path=/";
          }
          else if(code===403)
              alert("Access is denied"); 
          else if(code!==undefined && code!==null) 
              alert('Internal server error');
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

    newState.tasks[draggableId].status = finish.title;

    axios
      .put("/project/reorder?id=" + draggableId + "&destination=" + destination.index + "&destinationColumn=" + finish.title,
        null, config)
      .catch((error) => {
        let code = error.toJSON().status;
        if (code === 400 && error.response.data !== null)
          alert(error.response.data.message);
        else if(code===401){
          document.cookie = "expired=true; path=/";
        }
        else if(code===403)
            alert("Access is denied"); 
        else if(code!==undefined && code!==null) 
            alert('Internal server error');
      });

    setData(newState);

  };

  return (
    <div className="projects">
      {displayError()}
      <div className="container" style={{ fontFamily: "sans-serif" }}>
        <div className="well well-sm row">
          <div className="project-info">
            <div>Project: <b>{project.name}</b></div>
            <div className='project-employees' onClick={()=>setShowModal(true)}>
            {
              project.employees != undefined
              ? project.employees
                .sort((a, b) => a.id > b.id ? 1 : -1)
                .map((employee, idx) => {
                  if(idx<3) return  <div className="profile-img" style={{marginLeft:1.5*idx + "%"}}>
                                      <img style={{border:"2px solid #66b3ff"}} src={`data:image/jpeg;base64,${employee.photo}`} />
                                    </div>
                })
              : ''
            }
            {
              project.employees.length > 3
              ? <div className="profile-img" style={{marginLeft:"4.2%"}}>
                  <span className='centered'>+{project.employees.length-3}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" fill="#D4DADE" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                  </svg>
                </div>
              : ''
            }
            </div>
          </div>
          <div className='col-1 filter-title'>Show first</div>
          <Form.Select size="sm" value={filterSeverity} onChange={e => filterBySeverity(e.target.value)} style={{ "width": "10%" }}>
            <option value='—'>&nbsp;&nbsp;—</option>
            <option value='CRITICAL'>CRITICAL</option>
            <option value='HIGH'>HIGH</option>
            <option value='NORMAL'>NORMAL</option>
            <option value='LOW'>LOW</option>
          </Form.Select>
          <div className='col-1 filter-title'>Sort by due date</div>
          <Form.Select size="sm" value={filterDueDate} onChange={e => filterByDueDate(e.target.value)} style={{ "width": "10%" }}>
            <option value='—'>&nbsp;&nbsp;—</option>
            <option value='ASC'>UP</option>
            <option value='DESC'>DOWN</option>
          </Form.Select>
          <Form.Check checked={isShowOnlyMine} onChange={e => showOnlyMine(e.target.checked)}
            className='col-2 filter-only-mine' style={decodedToken.role === "ROLE_CUSTOMER" ? { visibility: "hidden" } : {}}
            type="switch" label="&nbsp;Only mine" />
          <div className='col-1'></div>
          <SearchBar placeholder="Ticket name" data={searchData} />
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
                  return <div className='wrapper'><Column key={column.id} column={column} tasks={tasks} navigate={props.navigate} /></div>;
                })
              }
            </div>
          </DragDropContext>
        </div>
      </div>
      <ProjectEmployeesModal navigate={props.navigate} show={showModal} onHide={() => { setShowModal(false); clearInput() }}
        employees={project.employees} editMode={false} />
    </div>
  );
}
