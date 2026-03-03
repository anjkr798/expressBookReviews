const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

/* ===========================
   Middleware
=========================== */

app.use(express.json());

app.use(session({
  secret: "access",   // MUST match jwt secret in auth_users.js
  resave: true,
  saveUninitialized: true
}));


/* ===========================
   Authentication Middleware
=========================== */

app.use("/customer/auth/*", function (req, res, next) {

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = req.session.authorization.accessToken;

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    req.user = user;
    next();
  });

});


/* ===========================
   Routes
=========================== */

app.use("/customer", customer_routes);
app.use("/", genl_routes);


/* ===========================
   Start Server
=========================== */

app.listen(PORT, () => console.log("Server is running"));