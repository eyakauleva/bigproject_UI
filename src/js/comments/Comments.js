import { useState, useLayoutEffect } from 'react';
import axios from "axios";
import Comment from './Comment';
import CommentForm from './CommentForm';

const Comments = ({currentTicketId}) =>{
    const[allCommentsForCurentTicket, setAllCommentsForCurentTicket] = useState([]);
    const[error, setError] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    const[show, setShow] = useState("");
    const[activeComment, setActiveComment] = useState(null);

    useLayoutEffect(() => {
        getCommentsByTicketId(currentTicketId)
    },[])
    const findCookieByName = (cookieName) => {
        return document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(cookieName + "="))
                    ?.split("=")[1];
    }

    const currentUserId = findCookieByName("employeeId");
    const token = findCookieByName("token");

    const getCommentsByTicketId = (ticketId) => {
        if(ticketId) {
            let config = {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            };
            axios
            .get("/comment/" + ticketId, config)
            .then(response => response.data)
            .then(data =>{
                if(data){
                    const dataWithView = data.map(d =>{
                        d.isFullView = true;
                        return d;
                    });
                    setAllCommentsForCurentTicket(sortComments(dataWithView));                      
                }                 
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null)
                    setErrorMessage(error.response.data.message);
                else if(code===401)
                    setError('Authorization is required');
                else if(code===403)
                    alert("Access is denied");
                else alert('Internal server error');
            });  
        }
    }
    const sortComments = (comments) =>{
        comments.sort(
            (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return comments;
    }
    const addComment = (text) =>{
        if(text != null){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            };
            let comment = {
                employee: {id: currentUserId},
                ticket: {id: currentTicketId},
                comment: text
            };  
            axios
            .post("/comment/create/", comment, config)
            .then(response => response.data)
            .then((data) => {
                data.isFullView = true;
                setAllCommentsForCurentTicket(sortComments([data, ...allCommentsForCurentTicket]));
                setShow(false);
                setActiveComment(null);
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null && error.response.data.message === "validation error"){
                    if(Array.of(error.response.data.fieldErrors).length > 0)
                        setErrorMessage(error.response.data.fieldErrors[0].defaultMessage);
                }
                else if(code===400 && error.response.data !== null)
                    setErrorMessage(error.response.data.message);
                else if(code===401)
                    setError('Authorization is required');
                else if(code===403)
                    alert("Access is denied");       
                else alert('Internal server error');
            });   
        }
    }
    const deleteComment = (commentId) => {
        if (window.confirm("Are you sure you want to remove comment?")) {
            if(commentId != null){
                let config = {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                };
                
                axios
                .delete("/comment/delete/" + commentId, config)
                .then(() => {
                    const updatedComments = allCommentsForCurentTicket.filter(
                        (comment) => comment.id !== commentId
                    );
                    setAllCommentsForCurentTicket(updatedComments); 
                })
                .catch((error) => {
                    let code = error.toJSON().status;
                    if(code===400 && error.response.data !== null && error.response.data.message === "validation error"){
                        if(Array.of(error.response.data.fieldErrors).length > 0)
                            setErrorMessage(error.response.data.fieldErrors[0].defaultMessage);
                    }
                    else if(code===400 && error.response.data !== null)
                        setErrorMessage(error.response.data.message);
                    else if(code===401)
                        setError('Authorization is required');
                    else if(code===403)
                        alert("Access is denied");       
                    else alert('Internal server error');
                }); 
            }
        }
    }
    const updateComment = (updatedText, commentId) => {
        if(commentId != null && updatedText != null){
            let config = {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            };
            let comment = {
                employee: {id: currentUserId},
                ticket: {id: currentTicketId},
                comment: updatedText
            }; 
            axios
            .put("/comment/update/" + commentId, comment, config)
            .then(response => response.data)
            .then((data) => {
                const updatedComments = allCommentsForCurentTicket.map((updatedComment) => {
                    if (updatedComment.id === commentId) {
                      return { ...updatedComment, id:data.id, comment: data.comment, updatedAt:data.updatedAt, isFullView:true };
                    }
                    return updatedComment;
                });
                setAllCommentsForCurentTicket(sortComments(updatedComments));
                setActiveComment(null);
            })
            .catch((error) => {
                let code = error.toJSON().status;
                if(code===400 && error.response.data !== null && error.response.data.message === "validation error"){
                    if(Array.of(error.response.data.fieldErrors).length > 0)
                        setErrorMessage(error.response.data.fieldErrors[0].defaultMessage);
                }
                else if(code===400 && error.response.data !== null)
                    setErrorMessage(error.response.data.message);
                else if(code===401)
                    setError('Authorization is required');
                else if(code===403)
                    alert("Access is denied");       
                else alert('Internal server error');
            }); 
        } 
    }

    const updateView = (comment) => {
        if(activeComment === null || !comment.isEdit || comment.id !== activeComment.id){
            var newState =  allCommentsForCurentTicket.map(com => {
                if(com.id === comment.id){
                    com.isFullView = !com.isFullView;
                    return com;
                }
                return com;
                
            }); 
            setAllCommentsForCurentTicket(newState);
        }
    }
    return (
    <div className="comments">
        {allCommentsForCurentTicket.length !== 0 ? 
                allCommentsForCurentTicket.map((mapComment) => (
                    <Comment 
                    key={mapComment.id} 
                    comment={mapComment}
                    deleteComment={deleteComment}
                    activeComment={activeComment}
                    setActiveComment={setActiveComment}
                    updateComment={updateComment}
                    employeeId={currentUserId}
                    updateView={updateView}
                    />
                ))
       :<div>There are no comments yet on this ticket</div>}
        <hr/>
        {!show && <button type="button" className="btn btn-outline-primary btn-comment" onClick={() => setShow(!show)}>
                    <i className="bi bi-chat"></i>  Comment
                  </button>
        }
        {show && <CommentForm 
                    submitLabel="Comment" 
                    handleSubmit={addComment} 
                    handleCancel={() => setShow(false)}
                    />}
    </div>
    );
}
export default Comments;