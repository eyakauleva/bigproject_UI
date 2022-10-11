// import { useCookies } from 'react-cookie';
// import jwt_decode from "jwt-decode";

// function JwtToken(){
//     const [cookies, setCookie] = useCookies(["token"]);   
    
//     const isUserLoggedIn = () => {  
//         if (cookies.token==undefined) {
//             return false;
//         } else{
//             let decodedToken = jwt_decode(cookies.token);
//             if (decodedToken.exp < new Date().getTime()){
//                 console.log(window.location.pathname);
//                 return false;
//             }            
//             else return true;
//         }    
//     };
// }

// export default JwtToken;
