import { useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from "axios";
import { useCookies } from 'react-cookie';

import '../css/Modal.css';
import '../css/SingleTask.css';
import '.././css/Users.css';
import '.././css/ChangePasswordModal.css';
import { id } from 'date-fns/locale';

export default function OrderDescriptionModal(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);

  function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }

  return (
    <Modal className="order-description"
      {...props}
      centered>
      <Modal.Header closeButton>
        <Modal.Title>
            Order Description
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>   
        <div>
            {bin2String(props.description)}
        </div>
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
    </Modal>
  );  
}