const cloudinary = require('cloudinary').v2;
const { writeErrorLog } = require('../../../middlewares/errorHandlers');

/**
 * Class cloudinary
 * created on 25-04-2023
 */
class cloudinaryController {
    /**
     * @param {*} file
     * @param {*} option
     */
    uploadImage = async (file, option) => {
        // Return "https" URLs by setting secure: true
        try {
            cloudinary.config({
                cloud_name: process.env.CLOUD_NAME,
                api_key: process.env.API_KEY,
                api_secret: process.env.API_SECRET,
            });
            // cloudinary.config({
            //     cloud_name: 'foloosi',
            //     api_key: '724539947133222',
            //     api_secret: 'ByPeu1fryhajcdv_F7keQw8pyUs',
            // });

            const uploadResponse = await cloudinary.uploader.upload(
                file,
                option,
            );

            return uploadResponse;
        } catch (err) {
            writeErrorLog(err);
        }
    };
}

module.exports = cloudinaryController;
