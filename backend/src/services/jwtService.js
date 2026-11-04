const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
