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
  const dropMenu = ["CE", "P & SA", "MPI", "CAO", "ICT"];
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
        console.log(response);
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
              };
              finalData.push(classData);
            });
            setMaindata(finalData);
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
    console.log(uploadedFiles);
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Topic"
            />
            <input
              type="text"
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
              <button onClick={() => setAnnounce(false)}>Cancel</button>
              <button
                onClick={() => {
                  post(
                    title,
                    message,
                    props.location.state.userDetails.username,
                    allUrl,
                    dropItem
                  );
                  setAnnounce(false);
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
                selectFilter == "Select" &&
                searchFilter.trim().toLowerCase() == ""
              ) {
                return (
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
                          .substring(0, 16)}
                      </h4>
                    </div>
                  </div>
                );
              } else if (
                selectFilter == "Select" &&
                res.title
                  .toLowerCase()
                  .includes(searchFilter.trim().toLowerCase())
              ) {
                return (
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
                          .substring(0, 16)}
                      </h4>
                    </div>
                  </div>
                );
              } else if (
                res.subject == selectFilter &&
                res.title
                  .toLowerCase()
                  .includes(searchFilter.trim().toLowerCase())
              ) {
                return (
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
                          .substring(0, 16)}
                      </h4>
                    </div>
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