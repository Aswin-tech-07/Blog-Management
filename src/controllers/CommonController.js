/**
 * @desc common function
 */
class CommonController {
    getUniqid = async () => {
        // Generate a random number between 0 and 9999
        const randNum = Math.floor(Math.random() * 10000);

        // Get the current timestamp in milliseconds
        const timestamp = Date.now();

        // Concatenate the timestamp and random number
        const uniqid = `${timestamp}${randNum}`;

        return uniqid;
    };
}
module.exports = CommonController;
