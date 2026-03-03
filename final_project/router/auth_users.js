const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/* ===============================
   Check if username already exists
================================= */
const isValid = (username) => {
    return users.some(user => user.username === username);
};

/* ===============================
   Check if username + password match
================================= */
const authenticatedUser = (username, password) => {
    return users.some(user =>
        user.username === username &&
        user.password === password
    );
};


/* ===============================
   Login Route
   Only registered users can login
================================= */
regd_users.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password required"
        });
    }

    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign(
            { data: username },
            "access",
            { expiresIn: 60 * 60 } // 1 hour
        );

        req.session.authorization = {
            accessToken
        };

        return res.status(200).json({
            message: "User successfully logged in"
        });

    } else {
        return res.status(401).json({
            message: "Invalid login credentials"
        });
    }
});


/* ===============================
   Add or Modify Book Review
================================= */
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!req.session.authorization) {
        return res.status(403).json({
            message: "User not authenticated"
        });
    }

    const username = jwt.verify(
        req.session.authorization.accessToken,
        "access"
    ).data;

    if (books[isbn]) {
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/updated successfully"
        });
    } else {
        return res.status(404).json({
            message: "Book not found"
        });
    }
});

regd_users.post("/register", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password required"
        });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({
        message: "User successfully registered"
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;