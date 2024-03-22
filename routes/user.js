var express = require('express');
var router = express.Router();
var upload = require('../config/multerService');
var Authentication = require('../middleware/jwt-auth');
const userController = require('../controllers/userController')


router.get('/', Authentication.checkAuth , userController.getUserById);

router.post(
  '/register',
  upload.any('picture'),
  userController.register
);
router.post(
  '/update-user',
  upload.any('picture'),
  Authentication.checkAuth,
  userController.updateUser
);
router.post(
  '/login',
  userController.login
);
router.post(
  '/forgot-password',
  userController.forgotPassword
);
router.post(
  '/change-password',
  Authentication.checkAuth ,
  userController.changePassword
);

module.exports = router;