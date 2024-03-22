const bcryptjs = require("bcryptjs");
const validator = require("fastest-validator");
const jwt = require("jsonwebtoken");
const common = require('../helper/common');
const User = require("../models/user");
const emailSending = require('../config/emailSending')


/******************** Registering a User *******************/
exports.register = async function (req, res, next) {
    try {
        let user= {
            name: req.body.name,
            email: req.body.email ? req.body.email.toLowerCase() : '',
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            age: req.body.age,
        };
        let schema = {
            name: { type: "string", optional: false },
            email: { type: "string", optional: false },
            password: { type: "string", optional: false },
            firstName: { type: "string", optional: true },
            lastName: { type: "string", optional: true },
            phone: { type: "string", optional: true },
            age: { type: "number", optional: true },
        }
        if(validateResponse(res, user, schema) === true){
            await User.findOne({ email: {'$regex' : req.body.email, '$options' : 'i'} })
            .then(async(result) => {
                if (result) {
                    res.status(409).json({ success: false, message: "Email already Exists" });
                }else{
                    bcryptjs.genSalt(13, function (err, salt) {
                        bcryptjs.hash(req.body.password, salt, async function (err, hash) {
                            user.password = hash;                            
                            await User.create(user).then((response)=>{
                                let tokenData = { userId: user._id, email: user.email, role: user.role };
                                const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
                                res.status(200).json({ 
                                    success: true,
                                    message: "register successfully",
                                    token,
                                    data: user
                                }); 
                            }); 
                        });
                    });
                }
            });            
        }          
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong",error: error });
    }
};

function validateResponse(res, postJson, schema) {
    const v = new validator();
    const validateResponse = v.validate(postJson, schema);
  
    if (validateResponse !== true) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: validateResponse,
      });
    } else {
      return true;
    }
}
/******************** Login a User *******************/
exports.login = async function (req, res, next) {
    try {        
        const users = {
            email: req.body.email ? req.body.email.toLowerCase() : '',
            password: req.body.password,
        };
        const schema = {
            email: { type: "string", optional: false },
            password: { type: "string", optional: false },
        };
        
        if(validateResponse(res, users, schema) === true){
            User.findOne({ email: users.email , isDeleted: false})
            .then(async (user) => {
                if (user === null) {
                    res.status(401).json({ success: false,message: "User Doesn't Exist" });
                } else {
                    let userPass = await User.findById(user._id).select('password');
                    bcryptjs.compare(req.body.password,userPass.password,function (err, result) {
                        if (result) {
                            let tokenData = { userId: user._id, email: user.email, role: user.role };
                            if(user.role == "user"){
                                const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
                                res.status(200).json({
                                    success: true,
                                    message: "Authentication successful",
                                    token,
                                    data: user,
                                });
                            }
                            if(user.role == "admin"){
                                const token = jwt.sign(tokenData, process.env.JWT_ADMIN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
                                res.status(200).json({
                                    success: true,
                                    message: "Authentication successful",
                                    token,
                                    data: user,
                                });
                            }
                        } else {
                            res.status(401).json({ success: false, message: "Invalid Credentials" });
                        }
                    });
                }
            });
        }
            
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong",error: error });
    }
};

/******************** Update User Profile *******************/
exports.updateUser = async function (req, res, next) {
    try {
        const id = req.tokenData.userId;
        await User.findOne({ _id: id, isDeleted: false }).then(async (result) => {
            if (result) {                    
                let user= {
                    name: req.body.name ? req.body.name : result.name,
                    firstName: req.body.firstName ? req.body.firstName : result.firstName,
                    lastName: req.body.lastName ? req.body.lastName : result.lastName,
                    phone: req.body.phone ? req.body.phone : result.phone,
                    age: req.body.age ? req.body.age : result.age,
                };
                let schema = {
                    name: { type: "string", optional: true },
                    firstName: { type: "string", optional: true },
                    lastName: { type: "string", optional: true },
                    phone: { type: "string", optional: true },
                    age: { type: "number", optional: true },
                }
                if(validateResponse(res, user, schema) === true){
                    const updatedUser = await User.findByIdAndUpdate(id,user,{ new: true });                    
                    res.status(200).json({ success: true, message: "User Updated successfully", data: updatedUser });
                }
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong",error: error });
    }
};

/********************Get User By Id*******************/
exports.getUserById = async function (req, res, next) {
    try {
        const id = req.tokenData.userId;    
        await User.findOne({ _id: id, isDeleted: false }).then((result) => {
            if (result) {
                res.status(200).json({ success: true, data: result });
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong",error: error });
    }
};

/******************** Forgot Password *******************/
exports.forgotPassword = async function (req, res, next) {
    try {
        const email = req.body.email;    
        await User.findOne({email: email}).then(async(result) => {
            if (result) {
                const newPassword = common.generateRandomString(8);
                console.log(newPassword)
                bcryptjs.genSalt(13, function (err, salt) {
                    bcryptjs.hash(newPassword, salt, async function (err, hash) {
                        const newHashedPassword = hash;
                        await User.findByIdAndUpdate(result._id,{ password: newHashedPassword },{ new: true });
                        const emailSubject = 'Forgot Password';
                        const emailBody = `<p>We have received your Reset Password Request. Your temporary password is ${newPassword} \n Please use these logins and change your password.</p>`;
                        await emailSending.sendEMessage(emailSubject,emailBody,email);
                        res.status(200).json({ success: true, message: "Email has been sent" });
                    });
                });
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong",error: error });
    }
};

/******************** Change Password *******************/
exports.changePassword = async function (req, res, next) {
    try {
        const id = req.tokenData.userId;    
        await User.findById(id).then(async(response) => {
            if (response) {
                let user= {
                    oldPassword: req.body.oldPassword,
                    newPassword: req.body.newPassword
                };
                let schema = {
                    oldPassword: { type: "string", optional: false },
                    newPassword: { type: "string", optional: false }
                }
                if(validateResponse(res, user, schema) === true){
                    let userPass = await User.findById(id).select('password');
                    bcryptjs.compare(user.oldPassword,userPass.password,function (err, result) {
                        if (result) {
                            bcryptjs.genSalt(13, function (err, salt) {
                                bcryptjs.hash(user.newPassword, salt, async function (err, hash) {
                                    let newPassword = hash; 
                                    await User.findByIdAndUpdate(id,{ password: newPassword },{ new: true });
                                    res.status(200).json({ success: true, message: "Password updated successfully" });
                                });
                            });
                        } else {
                            res.status(401).json({ success: false, message: "Invalid Credentials" });
                        }
                    });
                }
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong",error: error });
    }
};