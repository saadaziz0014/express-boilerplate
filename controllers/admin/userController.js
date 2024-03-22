const validator = require("fastest-validator");
const User = require("../../models/user");


/********************Get User By Id*******************/
exports.getUserById = async function (req, res, next) {
    try {
        const id = req.params.id;    
        await User.findOne({_id: id, isDeleted: false}).then((result) => {
            if (result) {
                res.status(200).json({ success: true, data: result });
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });
    } catch (error) {
        res.status(500).json({success: false,
            message: "Something went wrong",
            error: error,
        });
    }
};

/******************** Users List *******************/
exports.getAllUsers = async function (req, res, next) {
    try {
        await User.find({role:"user", isDeleted: false}).then((result) => {
            if (result) {
                res.status(200).json({ success: true, data: result });
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });        
    } catch (error) {
        res.status(500).json({success: false,
            message: "Something went wrong",
            error: error,
        });        
    }
};


/******************** Users List *******************/
exports.deleteAUser = async function (req, res, next) {
    try {
        const id = req.params.id;
        await User.find({_id:id, isDeleted: false}).then(async(result) => {
            if (result) {
                await User.findByIdAndUpdate(id,{isDeleted: true})
                res.status(200).json({ success: true, message: "user deleted successfully" });
            } else {
                res.status(409).json({ success: false, message: "User Not Found" });
            }
        });        
    } catch (error) {
        res.status(500).json({success: false,
            message: "Something went wrong",
            error: error,
        });        
    }
};