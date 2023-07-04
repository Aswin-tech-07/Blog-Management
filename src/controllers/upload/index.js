const responseHandler = require('../../../middlewares/responseHandlers');
const { writeErrorLog } = require('../../../middlewares/errorHandlers');
require('dotenv').config();
let CommonController = new require('../CommonController');
CommonController = new CommonController();
const cloudinaryController = require('./cloudinaryController');
const fs = require('fs');

/**
 * Class Blogs
 * created on 23-03-2023
 */
class UploadController {
    /**
     * @desc blog image upload
     * @route POST /v1/blog/upload-blog-image
     * @param {*} req
     * @param {*} res
     */
    UploadImage = async (req, res) => {
        try {
            if (req.file && req.file.size > 0) {
                const cloudinary = new cloudinaryController();
                const uniqid = await CommonController.getUniqid();
                const cloudData = await cloudinary.uploadImage(req.file.path, {
                    folder: 'foloosi/blog',
                    public_id: 'FLBIMG' + uniqid,
                });
                this.removeFile(req.file.path);
                const responseData = {
                    message: 'Image added successfully',
                    data: {
                        img_url: cloudData.secure_url,
                    },
                };
                responseHandler(res, 200, responseData);
            } else {
                responseHandler(res, 400, {
                    message: 'Image file missing!',
                });
            }
        } catch (err) {
            writeErrorLog(err);
            responseHandler(res, 500, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };
    // Function to remove a file
    removeFile = async filePath => {
        fs.unlink(filePath, err => {
            if (err) {
                writeErrorLog(err);
            }
        });
    };
}
module.exports = UploadController;
