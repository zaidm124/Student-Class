import React, { useEffect, useRef, useState } from "react";
import "../../css/ForgotPass.css";
import db from "../firebase";
import Loader from "../Loader/Loader";
import emailjs from "emailjs-com";
import axios from "axios";

// prop.co = code that we have to send to mail of the user
// prop.pr = to set page

function ForgetPass(prop) {
  const [ForgotEmail, setForgotEmail] = useState("");
  const [FoundEmail, setFoundEmail] = useState(true);
  const [load, setload] = useState(false);
  const [FoCode, setFoCode] = useState("");
  const [CodeCheck, setCodeCheck] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const loading = () => {
    if (load) {
      return <Loader />;
    } else {
      return <></>;
    }
  };
  const form = useRef();

  const sendEmail = async (e) => {
    e.preventDefault();
    let flag = 1;
    const data = await new Promise(function (resolve, reject) {
      db.collection("batch").onSnapshot((snapshot) => {
        snapshot.docs.map((doc) => {
          console.log(doc.id);
          db.collection("batch")
            .doc(doc.id)
            .collection("user")
            .onSnapshot((snapshot) => {
              snapshot.docs.map((doc) => {
                if (doc.data().email == ForgotEmail) {
                  flag = 0;
                  resolve(true);
                } else {
                  resolve(true);
                }
              });
            });
        });
      });
    }).then(() => {
      if (flag == 1) {
        window.alert("No account with this email");
      } else {
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
              setload(false);
              document.getElementById("forgot_box").style.display = "none";
              document.getElementById("code_boxx").style.display = "flex";
            },
            (error) => {
              // console.log(error.text);
            }
          );
      }
    });
  };

  const checkCode = (e) => {
    e.preventDefault();
    const actualCode = prop.co;

    if (FoCode.toString() === actualCode.toString()) {
      console.log(actualCode.toString());
      console.log(FoCode.toString());
      setCodeCheck(false);
    } else {
      alert("wrong code");
    }
  };

  const changePassword = (e) => {
    // e.preventDefault();
    axios
      .post("/hash", {
        password: newPassword,
      })
      .then((response) => {
        db.collection("batch").onSnapshot((snapshot) => {
          snapshot.docs.map((doc) => {
            console.log(doc.id);
            db.collection("batch")
              .doc(doc.id)
              .collection("user")
              .onSnapshot((snapshot) => {
                snapshot.docs.map((doc2) => {
                  if (doc2.data().email == ForgotEmail) {
                    db.collection("batch")
                      .doc(doc.id)
                      .collection("user")
                      .doc(doc2.id)
                      .update({
                        password: response.data.secPass,
                      })
                      .then(() => {
                        alert("password has been changed");
                      });
                  }
                });
              });
          });
        });
        // db.collection("signin").onSnapshot((snap) => {
        //   snap.docs.map((doc) => {
        //     if (doc.data().email === ForgotEmail) {
        //       db.collection("signin")
        //         .doc(doc.id)
        //         .update({
        //           password: response.data.secPass,
        //         })
        //         .then(() => {
        //           alert("password has been changed");
        //         });
        //     }
        //   });
        // });
      })
      .then(() => {});
  };

  const showpassword = () => {
    var x = document.getElementById("newpassword");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  };
  useEffect(() => {
    console.log(prop.co);
    document.getElementById("forgot_box").style.display = "flex";
    document.getElementById("code_boxx").style.display = "none";
  }, []);
  const checkForgotEmail = () => {
    if (true) {
      document.getElementById("forgot_box").style.display = "none";
      document.getElementById("code_boxx").style.display = "flex";
      // sendEmail();
    } else {
      document.getElementById("forgot_box").style.display = "flex";
      document.getElementById("code_boxx").style.display = "none";
      alert("Sorry Your Email Not Found In Our List");
    }
  };
  const finalCodeCheck = () => {
    if (CodeCheck) {
      return (
        <>
          <form ref={form} onSubmit={sendEmail} className="forgot_password_box">
            <div className="forgot_password_box" id="forgot_box">
              <div className="username">
                <h4>Email</h4>
                <input
                  type="text"
                  name="user_email"
                  value={ForgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value.trim())}
                />
              </div>
              <input
                type="text"
                name="message"
                value={prop.co}
                id="actualcode_input"
              />
              <div className="button">
                <button type="submit">Verify</button>
              </div>
              <div className="back_to_login">
                <h3 onClick={() => prop.pr(false)}>Back to Login</h3>
              </div>
            </div>
            <div id="code_boxx">
              <h1>Please Check Your Mail Box and enter The Code</h1>
              <input
                placeholder="code.."
                onChange={(e) => setFoCode(e.target.value)}
              />
              <div className="button">
                <button onClick={checkCode}>Submit</button>
              </div>
            </div>
            {loading()}
          </form>
          {() => checkForgotEmail()}
        </>
      );
    } else {
      return (
        <>
          <div className="re_enter_pass">
            <div className="password">
              <h4>
                New Password
                <input type="checkbox" onClick={() => showpassword()} />
              </h4>
              <input
                type="password"
                id="newpassword"
                onChange={(e) => setNewPassword(e.target.value.trim())}
              />
            </div>
            <div className="button">
              <button
                onClick={() => {
                  changePassword();
                  prop.pr(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      );
    }
  };
  return <>{finalCodeCheck()}</>;
}

export default ForgetPass;
