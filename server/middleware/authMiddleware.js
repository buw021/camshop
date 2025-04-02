const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next, secret) => {
  const token = req.cookies.admintoken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_ADMINSECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("admintoken");
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};
const verifyUserToken = (req, res, next, secret) => {
  const token = req.cookies.usertoken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("usertoken");
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { verifyUserToken, verifyAdminToken };
