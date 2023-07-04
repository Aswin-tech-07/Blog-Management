const blogCategoryModel = require('../../models/blogCategoryModel');
const blogsModel = require('../../models/blogsModel');
const responseHandler = require('../../../middlewares/responseHandlers');
const { writeErrorLog } = require('../../../middlewares/errorHandlers');
let CommonController = new require('../CommonController');
CommonController = new CommonController();

/**
 * Class BlogsCategory
 * created on 01-04-2023
 */
class BlogsCategoryController {
    /** api functions starts */

    /**
     * @desc create category
     * @route /v1/create-blog-category
     * @param {*} req
     * @param {*} res
     */
    createCategory = async (req, res) => {
        try {
            const postData = req.body || {};
            if (!postData) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields are missing',
                });
            }

            if (!postData.category_name) {
                responseHandler(res, 422, {
                    message: 'Category name should be mandatory',
                });
            }

            if (!postData.category_seo_name) {
                responseHandler(res, 422, {
                    message: 'Category Seo name should be mandatory',
                });
            }

            if (postData.category_name && postData.category_seo_name) {
                postData.status = 1;
                const uniqid = await CommonController.getUniqid();
                postData.category_no = 'FLSBLCTG' + uniqid;
                const blogCategory = new blogCategoryModel(postData);
                const savedCategory = await blogCategory.save();
                if (savedCategory) {
                    const responseData = {
                        message: 'Category added successfully',
                        data: savedCategory,
                    };
                    responseHandler(res, 201, responseData);
                } else {
                    responseHandler(res, 304, {
                        message: 'failed to create category',
                    });
                }
            } else {
                responseHandler(res, 403, {
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
     * @desc update category
     * @route /v1/update-blog-category
     * @param {*} req
     * @param {*} res
     */
    updateCategory = async (req, res) => {
        try {
            const postData = req.body || {};

            if (!postData) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields are missing',
                });
            }

            if (!postData.category_no) {
                responseHandler(res, 422, {
                    message: 'category id is mandatory',
                });
            } else {
                const category = await blogCategoryModel.findOne({
                    category_no: postData.category_no || '',
                });

                if (category) {
                    if (postData.category_no) {
                        const where = {
                            category_no: postData.category_no,
                        };

                        delete postData.category_no;

                        const savedCategory = await blogCategoryModel.updateOne(
                            where,
                            postData,
                            {
                                new: true,
                                upsert: false,
                            },
                        );
                        await blogsModel.updateMany(
                            {
                                category_id: category._id,
                            },
                            {
                                category_name: postData.category_name,
                            },
                        );
                        if (savedCategory.acknowledged) {
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
                    responseHandler(res, 403, {
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
     * @route /v1/status-change-category
     * @param {*} req
     * @param {*} res
     */
    statusChange = async (req, res) => {
        try {
            const categoryNo = req.params.categoryNo || '';
            if (!categoryNo) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields is missing',
                });
            }

            if (categoryNo) {
                const category = await blogCategoryModel.findOne({
                    category_no: categoryNo || '',
                });

                if (category) {
                    const savedCategory =
                        await blogCategoryModel.findOneAndUpdate(
                            {
                                category_no: categoryNo,
                            },
                            {
                                status: category.status ? 0 : 1,
                            },
                            {
                                new: true,
                                upsert: false,
                            },
                        );
                    if (savedCategory) {
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
                    responseHandler(res, 403, {
                        message: 'no data found',
                    });
                }
            } else {
                responseHandler(res, 403, {
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
     * @desc delete category
     * @route /v1/delete-blog-category
     * @param {*} req
     * @param {*} res
     */
    deleteCategory = async (req, res) => {
        try {
            const categoryNo = req.params.categoryNo || '';
            if (!categoryNo) {
                responseHandler(res, 422, {
                    message: 'Mandatory fields is missing',
                });
            }

            if (categoryNo) {
                const categoryExist = await blogCategoryModel.findOne({
                    category_no: categoryNo || '',
                });
                if (categoryExist) {
                    const result = await blogCategoryModel.deleteOne({
                        category_no: categoryNo || '',
                    });

                    if (result) {
                        await blogsModel.updateMany(
                            {
                                category_id: categoryExist._id,
                            },
                            {
                                $set: {
                                    category_id: '64533c6bcfb06405926cdf7e',
                                    category_name: 'General',
                                },
                            },
                        );
                        const responseData = {
                            message: 'Category Deleted successfully',
                            data: {},
                        };

                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 304, {
                            message: result || 'failed to delete category',
                        });
                    }
                } else {
                    responseHandler(res, 404, {
                        message: 'invalid id passed',
                    });
                }
            } else {
                responseHandler(res, 404, {
                    message: 'No Data Found',
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
     * @desc get all category
     * @route /v1/get-all-category
     * @param {*} req
     * @param {*} res
     */
    getAllCategory = async (req, res) => {
        try {
            const requestParam = req.query ? req.query : {};
            const searchQuery = requestParam.search;
            const condition = {};
            const page = parseInt(requestParam.page) || 1; // Current page number
            const limit = parseInt(requestParam.limit) || 10; // Number of results per page
            if (searchQuery) {
                condition.category_name = {
                    $regex: searchQuery,
                    $options: 'i',
                };
            }
            condition.category_no = {
                $ne: 'FLSBLCTG16831765559861753',
            };

            const count = await blogCategoryModel.countDocuments();
            const category = await blogCategoryModel
                .find(condition)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ date: -1 }) // Sort by descending order of date
                .exec();

            if (category) {
                const responseData = {
                    message: 'Category fetched successfully',
                    data: {
                        category_list: category,
                        totalPages: Math.ceil(count / limit),
                        currentPage: page,
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
     * @desc get category for filter
     * @param {*} req
     * @param {*} res
     */
    getCategoryForFilter = async (req, res) => {
        try {
            const category = await blogCategoryModel
                .find({
                    status: 1,
                })
                .select(['_id', 'category_name']);

            if (category) {
                // const dataOfFilter = await category.map(data => {
                //     const result = blogsModel.findOne({
                //         category_id: data._id,
                //     });
                //     if (result) {
                //         return data;
                //     }
                // });
                const responseDatas = [];
                for (const data of category) {
                    const result = await blogsModel.findOne({
                        category_id: data._id,
                    });
                    if (result) {
                        responseDatas.push(data);
                    }
                }
                const responseData = {
                    message: 'Category fetched successfully',
                    data: responseDatas,
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
     * @desc get category details
     * @route /v1/category-detail
     * @param {*} req
     * @param {*} res
     */
    getCategoryDetail = async (req, res) => {
        try {
            const categoryNo = req.params.categoryNo || '';
            if (categoryNo) {
                const categoryDetails = await blogCategoryModel.findOne(
                    {
                        category_no: categoryNo || '',
                    },
                    {
                        _id: 0,
                    },
                );
                const responseData = {
                    message: 'Category fetched successfully',
                    data: categoryDetails,
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

    /** api functions ends */

    /** internal funtions start */
    categoryLists = async () => {
        try {
            const categoryLists = await blogCategoryModel
                .find({ status: 1 })
                .select(['-_id', 'category_name', 'category_seo_name']);
            return categoryLists;
        } catch (err) {
            writeErrorLog(err);

            return '';
        }
    };
    /** internal funtions end */
}

module.exports = BlogsCategoryController;
