const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next, secret) => {
  const token = req.cookies.admintoken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.clearCookie("admintoken");
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

const verifyUserToken = (req, res, next) => {
  verifyToken(req, res, next, process.env.JWT_SECRET);
};

const verifyAdminToken = (req, res, next) => {
  verifyToken(req, res, next, process.env.JWT_ADMINSECRET);
};

module.exports = { verifyUserToken, verifyAdminToken };
