import { useState } from 'react';

const CommentForm = ({handleSubmit, submitLabel, initialText = '', handleCancel}) =>{
    const [text, setText] = useState(initialText);

    const onSubmit = event =>{
        event.preventDefault();
        handleSubmit(text);
        setText("");
    }

    return (
        <form  className={submitLabel==="Update" ?"comment-form-edit":"comment-form"} onSubmit={onSubmit}>
                <textarea
                className="comment-form-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                />
                <div className="comment-btn-group">
                    <button className="btn btn-outline-success btn-comment-form">{submitLabel}</button>
                    <button className="btn btn-outline-danger btn-cancel-form"  onClick={handleCancel}>Cancel</button>
                </div>
        </form>
    );
}
export default CommentForm;