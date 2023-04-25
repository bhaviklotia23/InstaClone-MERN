const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../modules/User/user.model");

dotenv.config();

exports.isAuthenticateUser = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    const { _id } = payload;
    User.findById(_id).then((userDetails) => {
      req.user = userDetails;
    });
    next();
  });
};
