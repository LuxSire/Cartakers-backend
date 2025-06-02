const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(token
    );

    console.log(process.env.TOKEN_SECRET);

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next(); // Pass the request to the next middleware
    });
}

module.exports = { authenticateToken };