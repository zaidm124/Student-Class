import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import "../../css/main.css";
import post, { newAnnouncement } from "./NewAnnouncememnt";
import db from "../firebase";
import loadimg from "../../assets/images/load.gif";
import Loader from "../Loader/Loader";
import { Dropdown, Form, Button, FormControl } from "react-bootstrap";
import axios from "axios";
import Auth from "../Protected/auth";

import io from "socket.io-client";
import { doc } from "firebase/firestore";

const socket = io("/");

let docurl = "#";

function Main(props) {
  const [Maindata, setMaindata] = useState([]);
  const [announce, setAnnounce] = useState(false);
  const [uploadedFiles, setuploadedfiles] = useState([]);
  const [load, setload] = useState(false);
  const [message, setMessage] = useState("");
  const [allUrl, setAllUrl] = useState([]);
  const [title, setTitle] = useState("");

  //   for drop down
  let dropMenu;
  if(props.location.state.batchName == 'CSE'){
  dropMenu = ["CN", "DAA", "DBMS", "OOT", "OS", "SS", "All"];
  }
  else if(props.location.state.batchName == 'ECE'){
    dropMenu = ["OS","CN","AC","DC","MicroCont","EM","All"];
  }
  else{
    dropMenu = ["CN", "DAA", "DBMS", "OOT", "OS", "SS","AC","DC","MicroCont","EM", "All"];
  }
  const [dropItem, setDropItem] = useState("Select Subject");

  // serach filters
  const [searchFilter, setSearchFilter] = useState("");
  const [selectFilter, setSelectFilter] = useState("Select");

  const onsearchFilter = (e) => {
    setSearchFilter(e);
  };
  const onSelectfilter = (e) => {
    setSelectFilter(e);
  };

  // loading
  const loading = () => {
    if (load) {
      return <Loader />;
    } else {
      return <h1></h1>;
    }
  };

  const userAuthnticated = () => {
    axios
      .get("/isUserAuth", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        // console.log(response);
        if (!response.data.auth) {
          props.history.push("/");
        } else {
        }
      });
  };

  useEffect(() => {
    userAuthnticated();
  }, []);

  const redirect = (res) => {
    Auth.login(() => {
      props.history.push({
        pathname: "/announcement",
        state: {
          res,
          email: props.location.state.email,
          userDetails: props.location.state.userDetails,
        },
      });
    });
  };

  // useEffect(() => {
  //     db.collection('batch').doc('pciH9dYco14ZdT8EghcX').collection('post').onSnapshot(snap => {
  //         snap.docs.map(doc => {
  //             // if (doc.id === '4jjqnyTNKB7jCQ1Ux7T2') {
  //                 let read = doc.data().read;
  //                 let flag = 0;
  //                 read.map(data => {
  //                     if (data === props.location.state.userDetails.email) {
  //                         flag = 1;
  //                     }
  //                 });
  //                 if (flag === 0) {
  //                     // window.alert('Red');
  //                     if (document.getElementById(doc.id)) {
  //                         document.getElementById(doc.id).style.backgroundColor = 'green';
  //                     }
  //                 }
  //             // }
  //         });
  //     });
  // });

  const read = async (res) => {
    // window.alert(res.id);
    let read = [];
    await new Promise((resolve, reject) => {
      db.collection("batch")
        .doc("pciH9dYco14ZdT8EghcX")
        .collection("post")
        .onSnapshot((snap) => {
          snap.docs.map((doc) => {
            if (doc.id === res.id) {
              read = doc.data().read;
              let flag = 0;
              read.map((data) => {
                if (data === props.location.state.userDetails.email) {
                  flag = 1;
                }
              });
              if (flag === 0) {
                read.push(props.location.state.userDetails.email);
              }
              resolve(true);
            }
          });
        });
    }).then(() => {
      // console.log(read);
      db.collection("batch")
        .doc("pciH9dYco14ZdT8EghcX")
        .collection("post")
        .doc(res.id)
        .update({
          read: read,
        })
        .then(() => {
          console.log("added as marked");
        });
    });
  };

  const deleteAnnouncement = (res) => {
    if (window.confirm("Are you sure you want to delete this:")) {
      db.collection("batch")
        .doc("pciH9dYco14ZdT8EghcX")
        .collection("post")
        .doc(res.id)
        .delete()
        .then(() => {
          // window.alert("deleted");
        });
    }
  };

  useEffect(async () => {
    setload(true);
    await new Promise(function (resolve, reject) {
      resolve(
        db
          .collection("batch")
          .doc("pciH9dYco14ZdT8EghcX")
          .collection("post")
          .orderBy("timestamp", "desc")
          .onSnapshot((snap) => {
            let finalData = [];
            snap.docs.map((doc) => {
              const classData = {
                author: doc.data().author,
                message: doc.data().message,
                url: doc.data().url,
                id: doc.id,
                title: doc.data().title,
                subject: doc.data().subject,
                timestamp: doc.data().timestamp,
                batchName: doc.data().batchName,
                email: doc.data().email,
              };
              finalData.push(classData);
            });
            // setMaindata(finalData);
            setMaindata(
              finalData.filter(
                (item) => item.batchName == props.location.state.batchName
              )
            );
            // console.log(finalData);
            setload(false);
          })
      );
    });
  }, []);

  let fileUrl = [];

  const fileuploaded = () => {
    // document.getElementById('announceFile').click();
  };
  const fileselected = async (e) => {
    setload(true);
    docurl = await newAnnouncement(e, fileUrl);
    const fileData = {
      url: docurl,
      fileName: e.target.files[0].name,
    };
    setAllUrl((allUrl) => [...allUrl, fileData]);
    let file = e.target.files[0];
    setload(false);
    if (file) {
      let fileName = file.name;
      if (fileName.length >= 12) {
        let splitName = fileName.split(".");
        fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
      }
      setuploadedfiles([...uploadedFiles, fileName]);
    }
    // console.log(uploadedFiles);
  };

  const announcementBox = () => {
    if (announce) {
      return (
        <div className="announce-after-box">
          <Dropdown id="subject_drop">
            <Dropdown.Toggle id="dropdown-button-dark-example1" variant="dark">
              {dropItem}
            </Dropdown.Toggle>

            <Dropdown.Menu variant="dark">
              {dropMenu.map((res) => {
                return (
                  <Dropdown.Item
                    className="drop_name"
                    onClick={() => setDropItem(res)}
                  >
                    {res}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
          <div className="announce-after-box-up">
            <input
              type="text"
              className="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Topic"
            />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="write the description..."
            />
          </div>
          <div id="uploaded-file" className="uploaded-file-preview">
            {uploadedFiles.map((res, index) => {
              return (
                <a
                  className="uploaded-file-preview-box"
                  href={docurl}
                  target="_blank"
                >
                  <h5>{res}</h5>
                </a>
              );
            })}
          </div>
          <div className="announce-after-box-down">
            <div className="announce-after-box-down-upload">
              <input
                type="file"
                id="announceFile"
                hidden
                onChange={(e) => fileselected(e)}
              />
              <label for="announceFile">
                <i
                  className="fas fa-file-word"
                  onClick={() => fileuploaded()}
                />
              </label>
            </div>
            <div className="announce-after-box-down-save">
              <button
                onClick={() => {
                  setuploadedfiles([]);
                  setDropItem("Select Subject");
                  setAllUrl([]);
                  setMessage("");
                  setTitle("");
                  setAnnounce(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (
                    message &&
                    title &&
                    dropItem &&
                    dropItem !== "Select Subject"
                  ) {
                    post(
                      title,
                      message,
                      props.location.state.userDetails.username,
                      allUrl,
                      dropItem,
                      props.location.state.batchName,
                      props.location.state.userDetails.email
                    );
                    setAllUrl([]);
                    setMessage("");
                    setTitle("");
                    setDropItem("Select Subject");
                    setAnnounce(false);
                    setuploadedfiles([]);
                    // socket.on("show-announcement",(hello)=>{
                    //     window.alert("new announcement");
                    //     console.log(hello)
                    // });
                    // socket.emit('new-announcement',2024);
                  } else {
                    window.alert(
                      "Please make sure you have filled Subject,Topic,Message"
                    );
                  }
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="announce-box-before" onClick={() => setAnnounce(true)}>
          {/* put here avtar image  */}
          <img src={props.location.state?.userDetails.url} />
          <h4>New Announcement...</h4>
        </div>
      );
    }
  };
  return (
    // props.location.state.batchName
    <div className="batch-main-page">
      {loading()}
      <div
        className="classroom-home-page-main-div-middle-box"
        style={{ backgroundImage: `url(${props.location.state?.src})` }}
      >
        <h3>
          <i class="fas fa-arrow-left" onClick={() => window.history.back()} />
        </h3>
        <h2>{props.location.state?.batchName}</h2>
      </div>
      <div className="batch-main-page-middle">
        <div className="batch-main-page-middle-announce-box">
          {announcementBox()}
        </div>
        <div className="batch-main-filter-box">
          <Dropdown id="batch-main-filter-box-filter">
            <Dropdown.Toggle id="dropdown-button-dark-example1" variant="light">
              {selectFilter}
            </Dropdown.Toggle>

            <Dropdown.Menu variant="dark">
              {dropMenu.map((res) => {
                return (
                  <Dropdown.Item
                    className="drop_name"
                    onClick={() => onSelectfilter(res)}
                  >
                    {res}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
          <Form className="d-flex" id="batch-main-filter-box-search">
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <Button variant="success">Search</Button>
          </Form>
        </div>
        {/*{console.log(Maindata)}*/}
        {Maindata.length
          ? Maindata.map((res) => {
              if (
                selectFilter === "Select" &&
                searchFilter.trim().toLowerCase() === ""
              ) {
                return (
                  <div className="flex">
                    <div
                      className="batch-main-page-middle-boxes"
                      id={res.id}
                      onClick={() => {
                        redirect(res);
                        read(res);
                      }}
                    >
                      <div className="batch-main-page-middle-boxes-i">
                        <i className="fas fa-bullhorn" />
                      </div>
                      <div className="batch-main-page-middle-boxes-date-and-title">
                        <div className="batch-main-page-middle-boxes-title">
                          <h2>
                            {res.author} Posted New Document : {res.title}
                          </h2>
                        </div>
                        <h4>
                          {new Date(res?.timestamp?.seconds * 1000)
                            .toString()
                            .substring(0, 21)}
                        </h4>
                      </div>
                    </div>
                    {props.location.state?.userDetails.email === res?.email ||
                    props.location.state?.userDetails.email ===
                      "zaidm124@gmail.com" ? (
                      <div className="delee">
                        <i
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteAnnouncement(res)}
                          className="fa fa-trash"
                        ></i>
                      </div>
                    ) : null}
                  </div>
                );
              } else if (
                (selectFilter == "Select" || selectFilter == "All") &&
                res.title
                  .toLowerCase()
                  .includes(searchFilter.trim().toLowerCase())
              ) {
                return (
                  <div className="flex">
                    <div
                      className="batch-main-page-middle-boxes"
                      id={res.id}
                      onClick={() => redirect(res)}
                    >
                      <div className="batch-main-page-middle-boxes-i">
                        <i className="fas fa-bullhorn" />
                      </div>
                      <div className="batch-main-page-middle-boxes-date-and-title">
                        <div className="batch-main-page-middle-boxes-title">
                          <h2>
                            {res.author} Posted New Document : {res.title}
                          </h2>
                        </div>
                        <h4>
                          {new Date(res?.timestamp?.seconds * 1000)
                            .toString()
                            .substring(0, 21)}
                        </h4>
                      </div>
                    </div>
                    {props.location.state?.userDetails.email === res?.email ||
                    props.location.state?.userDetails.email ===
                      "zaidm124@gmail.com" ? (
                      <div className="batch-main-page-middle-boxes-i del">
                        <i
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteAnnouncement(res)}
                          className="fa fa-trash"
                        ></i>
                      </div>
                    ) : null}
                  </div>
                );
              } else if (
                res.subject == selectFilter &&
                res.title
                  .toLowerCase()
                  .includes(searchFilter.trim().toLowerCase())
              ) {
                return (
                  <div className="flex">
                    <div
                      className="batch-main-page-middle-boxes"
                      id={res.id}
                      onClick={() => redirect(res)}
                    >
                      <div className="batch-main-page-middle-boxes-i">
                        <i class="fas fa-bullhorn" />
                      </div>
                      <div className="batch-main-page-middle-boxes-date-and-title">
                        <div className="batch-main-page-middle-boxes-title">
                          <h2>
                            {res.author} Posted New Document : {res.title}
                          </h2>
                        </div>
                        <h4>
                          {new Date(res?.timestamp?.seconds * 1000)
                            .toString()
                            .substring(0, 21)}
                        </h4>
                      </div>
                    </div>
                    {props.location.state?.userDetails.email === res?.email ||
                    props.location.state?.userDetails.email ===
                      "zaidm124@gmail.com" ? (
                      <div className="batch-main-page-middle-boxes-i del">
                        <i
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteAnnouncement(res)}
                          className="fa fa-trash"
                        ></i>
                      </div>
                    ) : null}
                  </div>
                );
              }
            })
          : null}
      </div>
    </div>
  );
}

export default withRouter(Main);
