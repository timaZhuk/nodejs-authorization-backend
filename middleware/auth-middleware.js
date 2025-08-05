const jwt = require("jsonwebtoken");

//---------------------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  console.log(authHeader);
  //if left part -true the assign left part
  //"Bearer rGKJGDSL456GKLGLHGKJHLK:JHL-J:LKjkK" -- we get token from this
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authorized user",
    });
  }
  //decode this token
  try {
    const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decodedTokenInfo);
    req.userInfo = decodedTokenInfo;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Access denied. No authorized user",
    });
  }
  //-------
};

module.exports = authMiddleware;
