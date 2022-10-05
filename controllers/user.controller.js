
const User = require('../models/user');
const Role = require('../models/role');
const UserPlans = require('../models/user_plans');
const Plan = require('../models/plans');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToFirebaseStorage,deleteFromStorage } = require('../shared/firebase/firebase.storage');
const { __parse } = require('../shared/helper');
const { mongoose } = require('../config/mongo.config');
const moment = require('moment');

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
                "$push": { files: [{ 'url': url, created_at: new Date() }] }
            }
        );

        res.status(200).json({ message: 'success', result: { data: {} } });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
}

async function getUsers(req,res,next){

    try {

        const { page, per_page = 10, ...whereFilter } = req.body;
        if (req?.body?.user_id) {
            const userData = __parse(await User.findOne({ _id: req.body.user_id }).select({ password: 0 }).populate('role'));
            res.status(200).json({ message: 'success', result: { data: userData } });
        }
        else {
            const totalRecord = await getUserInfo(null, null, whereFilter);
            console.log('totalRecord: ', totalRecord);
            const paginatedRecord = await getUserInfo(page, per_page, whereFilter);
            res.status(200).json(
                {
                    total: totalRecord[0]?.count,
                    pages:Math.ceil(totalRecord[0]?.count / per_page),
                    per_page,
                    result: { data: paginatedRecord }
                }
            );
        }

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

async function deleteFile(req,res,next){

    try {
        
        const { user_id, file_obj } = req.body;
        const { _id: fileId, url: fileUrl } = file_obj;
        const updatedUserModel = await User.findByIdAndUpdate(
            { _id: user_id },
            { $pull: { files: { _id: fileId } } },
            { new: true }
        );
        res.json({ message: "success" });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
}

async function getUserInfo(page , per_page , whereFilter) {

    let pagination = [];
    if (page && per_page) {
        const skip = (page - 1) * per_page;
        pagination = [
            { $skip: skip },
            { $limit: per_page }
        ]
    }

    return __parse(await User.aggregate([
        ...(whereFilter?.date ? [
            {
                $match: {
                    'files.created_at': {
                        $gt: new Date(new Date(whereFilter?.date).setUTCHours(0, 0, 0, 0)),
                        $lt: new Date(new Date(whereFilter?.date).setUTCHours(23, 0, 0, 0))
                    }
                }
            }
        ] : []),
        { $lookup: { from: 'roles', localField: 'role', foreignField: '_id', as: 'user_role' } },
        {
            $project: {
                "email": 1,
                "verified": 1,
                "user_role": { "$arrayElemAt": ["$user_role", 0] },
                "files": 1,
                "status": 1
            }
        },
       // { $unwind: "$user_role" },
        { $unwind: { path : "$files" , "preserveNullAndEmptyArrays": true } },
        {
            $match: {
                "status": { $eq: 1 },
                "user_role.name": { $ne: "Admin" }
            }
        },
        { $sort: { 'files.created_at': whereFilter?.order === "desc" ? 1 : -1 } },
        {$group: {_id: '$_id', email :{ $first:'$email' }, user_role : { $first :'$user_role' }, files: {$push: '$files'}}},
        ...((!page && !per_page) ? [{ $group: { _id: null, count: { $sum: 1 } } }] : []),
        ...pagination
    ]));
}

async function checkUserPlanExists(req,res,next) {
    
    try {
        
        const checkUserPlan = __parse(await User.aggregate([
            {
                $match: {
                    "_id": mongoose.Types.ObjectId( req.body.user_id ) 
                }
            },
            { $lookup: { from: 'user_plans', localField: '_id', foreignField: 'user_id', as: 'user_plans' } },
            {
                $match: {
                    "user_plans.is_expired": { $eq: false }
                }
            },
            { $unwind: { path : "$files" , "preserveNullAndEmptyArrays": true } },
            {$group: {_id: '$_id', files: {$push: '$files'} , user_plans :  { $first :'$user_plans' }}}
        ]));
        const singleUserPlan = checkUserPlan[0];
        if(!singleUserPlan?.user_plans || !singleUserPlan?.user_plans?.length){
            throw new Error('Your selected plan has expired or You have not selected any plan.');
        }
        const toCheckUserPlan = singleUserPlan?.user_plans[0];
        const currentDateTime = moment(new Date());
        const planCreatedDateTime = moment(new Date(toCheckUserPlan.created_at));  
        const diffInHours = currentDateTime.diff(planCreatedDateTime,'hours'); 

        if (diffInHours > 24) {
            await UserPlans.findByIdAndUpdate({ _id: toCheckUserPlan._id }, { is_expired: true });
            throw new Error('Your selected plan has expired. Please select another one to continue.');
        }
        
        const planInfo = __parse(await Plan.findOne({ _id: toCheckUserPlan.plan_id }));
        if (singleUserPlan?.files && (singleUserPlan?.files?.length > planInfo.limit)) {
            await UserPlans.findByIdAndUpdate({ _id: toCheckUserPlan._id }, { is_expired: true });
            throw new Error('Your selected plan limit has reached. Please select other one.');
        }
        res.status(200).json({ message :'success' , result : { data : 'valid plan exists' } });

    } catch (error) {
        res.status(401).json({ message: error?.message, data: {} });
    }
}

async function addOrUpgradeUserSubscriptionPlan(req, res, next) {

    try {
        
        const { user_id, plan_id } = req.body;
        const checkExisted = __parse(await Plan.findOne( { _id : plan_id } ) );
        if (!checkExisted) { 
            throw new Error('Selected Plan does`t exist. Please select other one');
        }

        const existedUserPlan = __parse(await UserPlans.find({ user_id: user_id }));
        if (existedUserPlan) {
            await UserPlans.deleteMany({ user_id: user_id });
        }
        const userPlanInfo = new UserPlans({ user_id: user_id, plan_id: plan_id, created_at: new Date() });
        const createdUserPlan = __parse(await userPlanInfo.save());
        res.status(200).json({ message: 'success', result: { date: createdUserPlan } });

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
    changeUserStatus,
    deleteFile,
    checkUserPlanExists,
    addOrUpgradeUserSubscriptionPlan
}
