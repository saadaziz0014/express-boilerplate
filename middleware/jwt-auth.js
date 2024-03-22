var jwt = require('jsonwebtoken');

exports.checkAuth = function (req, res, next) {
    try {
      const token = req.headers.authorization.split(" ")[1]; //Seperating Bearer token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if(decodedToken.role === 'user'){
        req.tokenData = decodedToken;
        next();
      }else{
        return res.status(401).json({
            success: false,
            message: "Only users are allowed to access",
            error: error,
          });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        login: false,
        message: "Invalid or Expired Token",
        error: error,
      });
    }
};

exports.checkAuthAdmin = function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]; //Seperating Bearer token
        const decodedToken = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        if(decodedToken.role === 'admin'){
          req.tokenData = decodedToken;
          next();
        }else{
          return res.status(401).json({
              success: false,
              message: "Only Admins are allowed to access",
              error: error,
            });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          login: false,
          message: "Invalid or Expired Token",
          error: error,
        });
      }
};