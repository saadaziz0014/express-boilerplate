var express = require('express');
var router = express.Router();
var upload = require("../../config/multerService");
const userController = require('../../controllers/admin/userController');


router.get('/all', userController.getAllUsers);

router.get('/:id', userController.getUserById);

router.get('/delete-a-user/:id', userController.deleteAUser )



module.exports = router;