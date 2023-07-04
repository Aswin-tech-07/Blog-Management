const blogTagsModel = require('../../models/blogTagsModel');
const responseHandler = require('../../../middlewares/responseHandlers');
const { writeErrorLog } = require('../../../middlewares/errorHandlers');
let CommonController = new require('../CommonController');
CommonController = new CommonController();

/**
 * Class Tags
 * created on 28-03-2023
 */
class TagsController {
    /** api functions starts */

    /**
     * @desc Create tag for blogs
     * @route /v1/create-tags
     * @param {*} req
     * @param {*} res
     */
    createTags = async (req, res) => {
        try {
            const postData = req.body || {};

            if (!postData) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields are missing',
                });
            } else if (!postData.blog_id) {
                responseHandler(res, 422, {
                    message: 'blog data should not be empty',
                });
            } else if (!postData.tag_name) {
                responseHandler(res, 422, {
                    message: 'Tag name should be mandatory',
                });
            } else if (postData.tag_name && postData.blog_id) {
                postData.status = 1;
                const uniqid = await CommonController.getUniqid();
                postData.tag_no = 'FLSBLTG' + uniqid;
                const blogTags = new blogTagsModel(postData);
                const savedTags = await blogTags.save();
                if (savedTags) {
                    const responseData = {
                        message: 'Category added successfully',
                        data: savedTags,
                    };
                    responseHandler(res, 201, responseData);
                } else {
                    responseHandler(res, 304, {
                        message: 'failed to create Tag',
                    });
                }
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc update tags
     * @route /v1/update-tags
     * @param {*} req
     * @param {*} res
     */
    updateTags = async (req, res) => {
        try {
            const postData = req.body || {};

            if (!postData) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields are missing',
                });
            } else if (!postData.tag_no) {
                responseHandler(res, 422, {
                    message: 'Tag id is mandatory',
                });
            } else {
                const tagExist = await blogTagsModel.exists({
                    tag_no: postData.tag_no || '',
                });

                if (tagExist) {
                    if (postData.tag_no) {
                        const where = {
                            tag_no: postData.tag_no,
                        };

                        delete postData.tag_no;

                        const savedTag = await blogTagsModel.updateOne(
                            where,
                            postData,
                            {
                                new: true,
                                upsert: false,
                            },
                        );
                        if (savedTag.acknowledged) {
                            const responseData = {
                                message: 'Category Updated successfully',
                                data: {},
                            };
                            responseHandler(res, 201, responseData);
                        } else {
                            responseHandler(res, 304, {
                                message: 'document remain same as before',
                            });
                        }
                    }
                } else {
                    responseHandler(res, 404, {
                        message: 'no data found',
                    });
                }
            }
        } catch (err) {
            writeErrorLog(err);
            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc status update
     * @route /v1/status-change-tag
     * @param {*} req
     * @param {*} res
     */
    statusChange = async (req, res) => {
        try {
            const postData = req.body || {};
            if (!postData.tag_no) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields is missing',
                });
            }

            if (postData.tag_no) {
                const tag = await blogTagsModel.findOne({
                    tag_no: postData.tag_no || '',
                });

                if (tag) {
                    const savedTag = await blogTagsModel.findOneAndUpdate(
                        {
                            tag_no: tag.tag_no,
                        },
                        {
                            status: tag.status ? 0 : 1,
                        },
                        {
                            new: true,
                            upsert: false,
                        },
                    );
                    if (savedTag) {
                        const responseData = {
                            message: 'status updated successfully',
                            data: {},
                        };
                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 304, {
                            message: 'failed to change status',
                        });
                    }
                } else {
                    responseHandler(res, 404, {
                        message: 'no data found',
                    });
                }
            } else {
                responseHandler(res, 404, {
                    message: 'no data found',
                });
            }
        } catch (err) {
            writeErrorLog(err);
            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc delete tag
     * @route /v1/delete-blog-tag
     * @param {*} req
     * @param {*} res
     */
    deleteTag = async (req, res) => {
        try {
            const postData = req.body || {};
            if (!postData.tag_no) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields is missing',
                });
            }

            if (postData.tag_no) {
                const tagExist = await blogTagsModel.exists({
                    tag_no: postData.tag_no || '',
                });

                if (tagExist) {
                    const result = await blogTagsModel.deleteOne({
                        tag_no: postData.tag_no || '',
                    });

                    if (result) {
                        const responseData = {
                            message: 'Tag Deleted successfully',
                            data: {},
                        };

                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 304, {
                            message: result || 'failed to delete Tag',
                        });
                    }
                } else {
                    responseHandler(res, 404, {
                        message: 'invalid id passed',
                    });
                }
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc get all Tag
     * @route /v1/get-tags
     * @param {*} req
     * @param {*} res
     */
    getAllTags = async (req, res) => {
        try {
            const requestParam = req.query ? req.query : {};
            const searchQuery = requestParam.search;
            const statusFilter = requestParam.status || 1;
            const condition = {};

            if (searchQuery) {
                condition.tag_name = {
                    $regex: searchQuery,
                    $options: 'i',
                };
            }

            if (statusFilter) {
                condition.status = statusFilter;
            }

            const tags = await blogTagsModel.find(condition);

            if (tags) {
                const responseData = {
                    message: 'Tag fetched successfully',
                    data: {
                        tag_list: tags,
                    },
                };

                responseHandler(res, 201, responseData);
            } else {
                const responseData = {
                    message: 'No data Found',
                    data: {},
                };

                responseHandler(res, 404, responseData);
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc get tag details
     * @route /v1/tag-details
     * @param {*} req
     * @param {*} res
     */
    getTagDetail = async (req, res) => {
        try {
            const requestParam = req.query ? req.query : {};
            const tagNo = requestParam.tag_no || '';
            if (tagNo) {
                const tagDetails = await blogTagsModel.findOne(
                    {
                        tag_no: tagNo || '',
                    },
                    {
                        _id: 0,
                    },
                );
                const responseData = {
                    message: 'Tag fetched successfully',
                    data: tagDetails,
                };

                responseHandler(res, 201, responseData);
            } else {
                responseHandler(res, 404, {
                    message: 'mandatory fields are missing',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };
    /** api functions ends   */

    /** internal funtions start */
    tagsList = async () => {
        try {
            const tagLists = await blogTagsModel
                .find({ status: 1 })
                .select(['-_id', 'tag_name', 'tag_no']);
            return tagLists;
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 500, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };
    /** internal functions ends */
}

module.exports = TagsController;
