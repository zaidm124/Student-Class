const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("We need a token, please give it to us next time");
  } else {
    jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "you have failed to authenticate" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

router.get("/isUserAuth", verifyJWT, (req, res) => {
  res.json({ auth: true, message: "you are authenticated" });
});



router.post("/register", async (req, res) => {
  const email = req.body;
  const token = jwt.sign({ email }, "jwtSecret", {
    expiresIn: "10d",
  });
  res.json({ auth: true, token: token,email });
});

module.exports = router;
