const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const multer  = require('multer')
const uploader = multer();
const fileUploads = uploader.fields([{ name: 'user_profile', maxCount: 1 }, { name: 'file0', maxCount: 1 }])


router.post('/register',userController.register);
router.post('/login',userController.login);
router.post('/uploads', fileUploads, userController.uploadFiles);
router.post('/save-upload',userController.saveUploadedFile);
router.post('/get-user-info',userController.getUsers);
router.post('/change-user-status', userController.changeUserStatus);
router.post('/delete-file',userController.deleteFile);

module.exports = router;
