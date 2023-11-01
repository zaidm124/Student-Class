import React, { useEffect, useState, useRef } from "react";
import "../../css/register.css";
import { withRouter } from "react-router-dom";
import db from "../firebase";
import emailjs from "emailjs-com";
import Loader from "../Loader/Loader";
import axios from "axios";

function Signup(props) {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState();
  const [load, setload] = useState(false);
  const [id, setId] = useState();

  const form = useRef();
  const loading = () => {
    if (load) {
      return <Loader />;
    } else {
      return <h1></h1>;
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    let flag = 1;
    const data = await new Promise(function (resolve, reject) {
      db.collection("signin").onSnapshot((snap) => {
        snap.docs.map((doc) => {
          if (doc.data().email == email) {
            flag = 0;
            resolve(true);
          } else {
            resolve(true);
          }
        });
      });
    }).then(() => {
      if (flag == 0) {
        window.alert("Account already registered with this email id.");
      } else {
        if (
          password &&
          password === confirm
        ) {
          setload(true);
          emailjs
            .sendForm(
              "service_iyewh4h",
              "template_xn1gyii",
              form.current,
              "user_FiABlOrM99A3dIoTZv7TU"
            )
            .then(
              (result) => {
                setTimeout(() => {}, 3000);
                // console.log(result.text);
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                document.getElementById("signup").style.display = "none";
                document.getElementById("code").style.display = "flex";
                setload(false);
              },
              (error) => {
                // console.log(error.text);
              }
            );
        } else {
          window.alert(
            "Error Signing up, please make sure you are signing up using institute id"
          );
        }
        // document.getElementById("signup").style.display = "none";
        // document.getElementById("code").style.display = "flex";
      }
    });
  };
  const codeCheck = (e) => {
    e.preventDefault();
    const actualCode = props.cod;

    if (code.toString() === actualCode.toString()) {
      axios.post("/register",{
        email,
        password
      }).then((response)=>{
        console.log(response.data.auth)
        if(response.data.auth){
          db.collection("batch").onSnapshot((snap) => {
            snap.docs.map((doc) => {
              if (doc.data().number === 2024) {
                setId(doc.id);
                db.collection("batch")
                  .doc(doc.id)
                  .collection("user")
                  .add({
                    batch: 2024,
                    email: email,
                    username: "",
                    password:response.data.userInfo.hashPass,
                    url: "",
                  }).then(()=>{
                    props.history.push({
                      pathname: "/home",
                      state: { signup: email },
                    });
                  });
              }else{
                window.alert("Error Signing up")
              }
            });
          });
        }

        
      })
      
    } else {
      alert("wrong code");
    }
  };

  const showpassword = () => {
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  };

  return (
    <>
      <form
        className="login_signup_box_select"
        ref={form}
        onSubmit={sendEmail}
        id="signup"
      >
        <div className="username">
          <h4>Email</h4>
          <input
            type="text"
            name="message"
            value={props.cod}
            id="actualcode_input"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            name="user_email"
          />
        </div>
        <div className="password">
          <h4>
            Password
            <input type="checkbox" onClick={() => showpassword()} />
          </h4>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="password">
          <h4>re-enter Password</h4>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div className="button">
          <input type="submit" value="Create-Profile" />
        </div>
        {loading()}
      </form>
      <form
        className="enter_verification_code"
        id="code"
        onSubmit={(e) => codeCheck(e)}
      >
        <h3>Check your mail and confirm code here !</h3>
        <input
          onChange={(e) => setCode(e.target.value)}
          value={code}
          type="text"
        />
        <button type="submit">Confirm</button>
        <div class="alert" id="alertbox">
          <strong>Check</strong> your mail box !!
        </div>
      </form>
    </>
  );
}

export default withRouter(Signup);


// axios
//         .post("/register", {
//           email: email,
//         })
//         .then((response) => {
//           if (response.data.auth) {
//             localStorage.setItem("token", response.data.token);
//             localStorage.setItem("email", email);

//             axios
//               .post("/hash", {
//                 password: password,
//               })
//               .then((response) => {
//                 db.collection("signup").add({
//                   email,
//                   password: response.data.secPass,
//                   confirm: response.data.secPass,
//                 });

                // db.collection("batch").onSnapshot((snap) => {
                //   snap.docs.map((doc) => {
                //     if (doc.data().number === 2024) {
                //       setId(doc.id);
                //       // console.log(doc.data().number);
                //       // console.log(id);
                //       db.collection("batch")
                //         .doc(doc.id)
                //         .collection("user")
                //         .add({
                //           batch: 2024,
                //           email: email,
                //           username: "",
                //           url: "",
                //         });
                //     }
                //   });
                // });

//                 db.collection("signin")
//                   .add({
//                     email,
//                     password: response.data.secPass,
//                   })
//                   .then(() => {
//                     props.history.push({
//                       pathname: "/home",
//                       state: { signup: email },
//                     });
//                   });
//               });
//           } else {
//             alert("Error in signing up");
//           }
//         });

//       // console.log(actualCode.toString());
//       // console.log(code.toString());
