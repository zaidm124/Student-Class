import React, { useEffect, useState } from 'react';
import NavBar from '../Navbar/Navbar';
import '../../css/home.css';
import Loader from '../Loader/Loader';
import db from '../firebase';
import { withRouter } from 'react-router-dom';
import Auth from '../Protected/auth';
import axios from 'axios';

import io from 'socket.io-client';

const socket = io('/');

const data = [
    {
        src: 'https://www.czechuniversities.com/uploads/2020/05/18705.jpg',
        name: 'CSE-2020',
        batchName: 'CSE',
    },
    {
        src: 'https://wallpapercave.com/wp/wp2700096.jpg',
        name: 'ECE-2020',
        batchName: 'ECE',
    },
    {
        src: 'https://st2.depositphotos.com/3559981/6255/i/600/depositphotos_62552689-stock-photo-photo-of-man-wearing-vendetta.jpg',
        name: 'Both-Batch',
        batchName: 'COMMON',
    },
];

function Home (props) {
    const [id, setId] = useState();
    const [email, setEmail] = useState();
    const [users, setUsers] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [userDetails, setUserDetails] = useState('');
    const [load, setload] = useState(false);
    const [online, setonline] = useState([]);

    const loading = () => {
        if (load) {
            return <Loader/>;
        } else {
            return <h1></h1>;
        }
    };

    const userAuthnticated = () => {
        axios
        .get('/isUserAuth', {
            headers: {
                'x-access-token': localStorage.getItem('token'),
            },
        })
        .then((response) => {
            // console.log(response);
            if (!response.data.auth) {
                props.history.push('/');
            } else {
                // console.log(response.data.user)
            }
        });
    };

    useEffect(() => {
        userAuthnticated();
    }, []);

    useEffect(() => {
        socket.on('user-disconnected', (users) => {
            // console.log(Object.keys(users));
            setonline(Object.keys(users));
        });
    }, []);

    useEffect(() => {
        socket.on('user-connected', users => {
            // console.log('joined room---', users);
            // console.log(Object.keys(users));
            setonline(Object.keys(users));
        });

    }, []);

    const redirect = (res) => {
        Auth.login(() => {
            props.history.push({
                pathname: '/main',
                state: {
                    batchName: res.batchName,
                    userDetails: userDetails,
                    id: id,
                    src: res.src,
                    email: email,
                },
            });
        });

        // console.log(imageUrl);
        // console.log(res.batchName);
    };

    useEffect(() => {
        if (props.location.state?.signup) {
            setEmail(props.location?.state?.signup);
        } else {
            setEmail(props.location.state?.login);
            document.getElementById('home-page-user-info').style.display = 'none';
        }
    }, []);

    useEffect(async () => {
        setload(true);
        await new Promise(function (resolve, reject) {
            let docId;
            let batch = 2024;
            resolve(
                db.collection('batch').onSnapshot((snap) => {
                    snap.docs.map((doc) => {
                        if (doc.data().number === batch) {
                            docId = doc.id;
                            setId(docId);
                            // console.log(doc.data().number);
                            // console.log(id);
                            setload(false);
                        }
                    });
                }),
            );
        });
    }, [email]);

    useEffect(async () => {
        setload(true);
        await new Promise(function (resolve, reject) {
            resolve(
                db
                .collection('batch')
                .doc(id)
                .collection('user')
                .onSnapshot((snap) => {
                    setUsers(snap.docs.map((doc) => doc.data().username));
                    snap.docs.map((doc) => {
                        if (doc.data().email === email) {
                            // console.log(email);
                            setUserDetails(doc.data());

                            socket.emit('join-room', 2024, doc.data().username);
                            // console.log(doc.data().username);
                            // setImageUrl(doc.data().url);
                        }
                    });
                    // console.log(users);
                    setload(false);
                }),
            );
        });
    }, [id]);

    return (
        <div className = "classroom-home-page" id = "classroom-home-page">
            {loading()}
            <NavBar online = {online} userDetails = {userDetails} email = {email} loadiing = {setload}/>
            <div className = "classroom-home-page-main-div">
                <div className = "classroom-home-page-main-div-head">
                    <h2>Student Classroom</h2>
                </div>
                <div className = "classroom-home-page-main-div-middle">
                    {data.map((res) => {
                        return (
                            <div
                                onClick = {() => redirect(res)}
                                className = "classroom-home-page-main-div-middle-box"
                                style = {{ backgroundImage: `url(${res.src})` }}
                            >
                                <h2>{res.name}</h2>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default withRouter(Home);
