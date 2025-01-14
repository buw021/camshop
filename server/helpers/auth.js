const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

const comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

const decodeJWT = (usertoken) => {
  const decoded = jwt.verify(usertoken, process.env.JWT_SECRET);
  return decoded.id;
};

const reqToken = (req) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return;
  }
  const token = authorizationHeader.split(" ")[1];
  return token;
};

module.exports = {
  hashPassword,
  comparePassword,
  decodeJWT,
  reqToken,
};
