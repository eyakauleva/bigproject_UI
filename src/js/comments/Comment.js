import { format, parseISO } from "date-fns";
import CommentForm from "./CommentForm";

    const Comment = ({comment, deleteComment, activeComment, setActiveComment, updateComment, employeeId, updateView}) =>{
    const createdAt = format(parseISO(comment.createdAt), "dd/MMM/Y hh:mm a");
    const updatedAt = comment.updatedAt!= null && format(parseISO(comment.updatedAt), "dd/MMM/Y hh:mm a");
    const isEditing =
            activeComment &&
            activeComment.id === comment.id &&
            activeComment.type === "editing";
    const isCanDeleteOrUpdate = employeeId === comment.employee.id;
    const isAdmin = comment.employee.user.role === "ROLE_ADMIN";
    return (
        <div key={comment.id} className="comment" onClick={() => updateView(comment)}>
            <div className="comment-container">
              {comment.isFullView ?
                                   <i class="bi bi-caret-down-fill comment-arrow-icon"></i>:
                                   <i class="bi bi-caret-right-fill comment-arrow-right-icon"></i>
              }
                <div className={comment.isFullView ? "comment-image-container":"comment-image-container-non-full-view"}>
                   <a href={"/app/profile/"+comment.employee.id}> {comment != null && <img className="photo" src={`data:image/jpeg;base64,${comment.employee.photo}`} />}</a>
                </div>
                <div className={comment.isFullView ? "comment-content":"comment-content-non-full-view"}>
                    {comment != null && <div className="comment-author"><a href={"/app/profile/"+comment.employee.id}>{comment.employee.user.name + ' '+ comment.employee.user.surname}</a> added comment - </div>}
                    {comment.updatedAt == null ? 
                        <div className="comment-date">{createdAt}</div>:
                        <div className="comment-date">{updatedAt} - edited</div>
                    }
                </div>
                {(comment.isFullView && !isEditing) && (isCanDeleteOrUpdate || isAdmin) &&
                    <div className="comment-actions">
                        <i class="bi bi-pencil-square comment-icon" onClick={() => {setActiveComment({id: comment.id, type: "editing"}); comment.isEdit = true;}}></i>
                        <i class="bi bi-trash3-fill comment-icon" onClick={() => deleteComment(comment.id)}></i>
                    </div>
                }
                {!comment.isFullView && <div className="comment-text-non-full-view">{comment.comment}</div>}
            </div>
            {isEditing && 
               <CommentForm 
               submitLabel="Update" 
               handleSubmit={(text) => updateComment(text, comment.id)} 
               initialText={comment.comment}
               handleCancel={() => setActiveComment(null)}
             />}
             {comment.isFullView && !isEditing && <div className="comment-text">{comment.comment}</div>}
            
        </div>
    );
}
export default Comment;