const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// .env configuration
require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(require('./routes/auth'));
app.use(express.static(path.join(__dirname, "client/build")));

const { authTokenHandler } = require("./middleware/authTokenHandler");
const router = require("./routes/auth");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const homeRouter = require("./routes/home");

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/isUserAuth", authTokenHandler);

app.get("/isUserAuth", authTokenHandler, (req, res) => {
  res.json({ auth: true, message: "you are authenticated", user: req.user });
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// }

// app.post("/hash", async (req, res) => {
//   const secPass = await bcrypt.hash(req.body.password, 10);
//   res.json({ secPass });
// });

// app.post('/login', async (req, res) => {
//     const email = req.body.email;
//     const userPass = req.body.userPass;
//     const correctPass = req.body.correctPass;
//     const token = jwt.sign({ email }, 'jwtSecret', {
//         expiresIn: '10d',
//     });
//     if (await bcrypt.compare(userPass, correctPass)) {
//         res.json({ auth: true, token: token });
//     } else {
//         res.json({ auth: false });
//     }
// });
const users = {};

io.on("connection", (socket) => {
  console.log("ready to use");
  socket.on("join-room", (roomId, email) => {
    users[email] = true;
    console.log("joined---", roomId, email);
    socket.join(roomId);
    // socket.to(roomId).emit('user-connected', users);
    io.to(roomId).emit("user-connected", users);

    socket.on("disconnect", () => {
      console.log("left---", email);
      users[email] = false;
      delete users[email];
      // socket.to(roomId).emit('user-disconnected', users);
      io.to(roomId).emit("user-disconnected", users);
      // console.log(users);
    });
  });

  socket.on("new-announcement", (roomId) => {
    console.log("new announcement on server");
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("show-announcement", "hello");
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://127.0.0.1:${PORT}`);
});
