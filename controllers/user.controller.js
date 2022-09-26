
const User = require('../models/user');
const Role = require('../models/role');
const UserStorage = require('../models/user.storage');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToFirebaseStorage } = require('../shared/firebase/firebase.storage');
const { __parse } = require('../shared/helper');


async function register(req, res, next) {

    try {

        const { email, password, user_role } = req.body;
        const checkUserExist = await User.findOne({ email: email });
        if (checkUserExist && Object.keys(checkUserExist).length) {
            throw new Error('user with this email already exist');
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userRole = __parse(await Role.findOne({ name: user_role }));
        if (!userRole || !Object.keys(userRole).length) {
            throw new Error('Selected Role not found !');
        }
        const user = new User({ email: email, password: hashedPassword, role: userRole._id });
        const createdUser = __parse(await user.save());
        res.status(200).json({ message: 'success', result: { data: { ...createdUser } } });

    } catch (error) {
        res.status(401).json({ message: error?.message });
    }

}

async function login(req, res, next) {
    try {

        const { email, password } = req.body;
        const foundUser = __parse(await User.findOne({ email: email }).populate('role'));
        if (!foundUser) {
            throw new Error('Use not found !');
        }
        const passwordCheck = bcrypt.compareSync(password, foundUser?.password || '');
        if (!passwordCheck) {
            throw new Error('Incorrect password !')
        }
        delete foundUser.password;
        const token = jwt.sign({ data: foundUser }, 'mysecret123!@#', { expiresIn: '5h' });
        res.status(200).json({
            message: ' success', restult: {
                token: token,
                data: { ...foundUser }
            }
        });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
}

async function uploadFiles(req, res, next) {

    try {

        const userFile = req.files['file0'][0];
        const fileUrl = await uploadToFirebaseStorage(userFile.buffer, userFile.originalname);
        res.status(200).json({ message: 'success', result: { data: { file_url: fileUrl } } });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
}

async function saveUploadedFile(req, res, next) {

    try {

        const { user_id, url } = req.body;
        await User.updateOne(
            {
                _id: user_id
            },
            {
                "$push": { files: [{ 'url': url }] }
            }
        );

        res.status(200).json({ message: 'success', result: { data: {} } });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
}

async function getUsers(req,res,next){

    try {

        let userData;
        if (req?.body?.user_id) {
            userData = __parse(await User.findOne({ _id: req.body.user_id }).select({ password: 0 }).populate('role'));
        }
        else {
            userData = __parse(await User.find({}).select({ password: 0 }).populate('role'));
        }

        res.status(200).json({ message: 'success', result: { data: userData  } });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
   


}

async function changeUserStatus(req,res,next){

    try {
        const { status, user_id } = req.body;
        const changedUserStatus = await User.findByIdAndUpdate(
            {
                _id: user_id
            },
            {
                status: status
            }
        );

        res.status(200).json({ message: 'success', result: { data: {} } });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });

    }
}

module.exports = {
    register,
    login,
    uploadFiles,
    saveUploadedFile,
    getUsers,
    changeUserStatus
}
