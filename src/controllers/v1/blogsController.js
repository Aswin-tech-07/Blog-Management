const BlogsModel = require('../../models/blogsModel');
const BlogTagsModel = require('../../models/blogTagsModel');
const BlogCategoryModel = require('../../models/blogCategoryModel');
const TagsController = require('./tagsController');
const BlogsCategoryController = require('./blogsCategoryController');
const responseHandler = require('../../../middlewares/responseHandlers');
const { writeErrorLog } = require('../../../middlewares/errorHandlers');
let CommonController = new require('../CommonController');
CommonController = new CommonController();
const mongoose = require('mongoose');

/**
 * Class Blogs
 * created on 23-03-2023
 */
class BlogsController {
    /** api functions starts */

    /**
     * @desc blog add
     * @route POST /v1/blog/create-blog
     * @param {*} req
     * @param {*} res
     */
    createBlog = async (req, res) => {
        try {
            const postData = req.body || {};
            if (postData) {
                if (
                    postData.blog_name &&
                    postData.blog_category &&
                    postData.tag_name &&
                    postData.permalink &&
                    postData.blog_description &&
                    postData.blog_content &&
                    postData.blog_banner
                ) {
                    postData.status = 1;
                    const uniqid = await CommonController.getUniqid();
                    postData.blog_no = 'FLSBL' + uniqid;
                    postData.category_id = postData.blog_category;
                    const categoryId = postData.category_id || '';
                    const isValidObjectId =
                        mongoose.Types.ObjectId.isValid(categoryId);
                    if (isValidObjectId) {
                        // getting category detail for verify and update blog id
                        const categoryData = await BlogCategoryModel.findById(
                            categoryId,
                        );
                        if (categoryData) {
                            postData.category_name =
                                categoryData.category_name || '';

                            const blogsOfCategory = categoryData.blogs || [];
                            const blog = new BlogsModel(postData);

                            // save blogs
                            const savedBlog = await blog.save();
                            if (savedBlog) {
                                blogsOfCategory.push(savedBlog._id);

                                // update blog id with category
                                await BlogCategoryModel.updateOne(
                                    {
                                        _id: postData.category_id,
                                    },
                                    {
                                        blogs: blogsOfCategory,
                                    },
                                );
                                const tags = postData.tag_name
                                    ? postData.tag_name.split(',')
                                    : [];
                                const tagsToInsert = [];
                                for (let i = 0; tags.length > i; i++) {
                                    let uniqid =
                                        await CommonController.getUniqid();
                                    uniqid = 'FLSBLTG' + uniqid;

                                    await tagsToInsert.push({
                                        tag_no: uniqid,
                                        tag_name: tags[i].trim(),
                                        blog: savedBlog._id,
                                        blog_name: savedBlog.blog_name,
                                        status: 1,
                                    });
                                }
                                const savedTags =
                                    await BlogTagsModel.insertMany(
                                        tagsToInsert,
                                    );
                                if (!savedTags) {
                                    const responseData = {
                                        message: 'Tags updated failed',
                                        data: {},
                                    };
                                    responseHandler(res, 400, responseData);
                                } else {
                                    const tagIds = savedTags.map(
                                        tag => tag._id,
                                    );

                                    const updateData =
                                        await BlogsModel.updateOne(
                                            { _id: savedBlog._id },
                                            {
                                                $push: {
                                                    tags: { $each: tagIds },
                                                },
                                            },
                                            { new: true },
                                        );

                                    if (updateData) {
                                        const responseData = {
                                            message: 'Blog added successfully',
                                            data: savedBlog,
                                        };
                                        responseHandler(res, 200, responseData);
                                    } else {
                                        responseHandler(res, 400, {
                                            message: 'failed to update blog',
                                        });
                                    }
                                }
                            } else {
                                responseHandler(res, 400, {
                                    message: 'failed to create blog',
                                });
                            }
                        } else {
                            responseHandler(res, 400, {
                                message: 'No category found',
                            });
                        }
                    } else {
                        responseHandler(res, 400, {
                            message: 'Invalid Category Id Passed',
                        });
                    }
                } else {
                    responseHandler(res, 400, {
                        message: 'Mandatory Fields are missing!',
                    });
                }
            } else {
                responseHandler(res, 400, {
                    message: 'Mandatory Fields are missing!',
                });
            }
        } catch (err) {
            // handle other errors
            writeErrorLog(err);
            responseHandler(res, 500, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc   blog list for promotion site
     * @route   GET /v1/blog/list
     * @param {*} req
     * @param {*} res
     */
    GetAllBlogsForAdmin = async (req, res) => {
        try {
            const Tags = new TagsController();
            const Blogs = new BlogsCategoryController();
            const requestParam = req.query ? req.query : {};
            const searchQuery = requestParam.search;
            // const statusFilter = requestParam.status || 1;
            const condition = {};
            let page = parseInt(requestParam.page) || 1; // Current page number
            let limit = parseInt(requestParam.limit) || 10; // Number of results per page

            if (searchQuery) {
                condition.blog_name = {
                    $regex: searchQuery,
                    $options: 'i',
                };
                page = 1;
                limit = 10;
            }

            // if (statusFilter) {
            //     condition.status = statusFilter;
            // }
            const count = await BlogsModel.countDocuments();
            // const blogs = await BlogsModel.find({ status: 1 })
            const blogs = await BlogsModel.find(condition)
                .select([
                    '-_id',
                    'blog_no',
                    'blog_name',
                    'permalink',
                    'category_name',
                    'blog_description',
                    'blog_banner',
                    'status',
                    'createdAt',
                ])
                .populate({
                    path: 'tags',
                    select: '-_id tag_name tag_no',
                    match: { status: 1 },
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ date: -1 }) // Sort by descending order of date
                .exec();
            if (blogs) {
                const responseData = {
                    message: 'Blogs successfully fetched',
                    data: {
                        blogList: blogs,
                        totalPages: Math.ceil(count / limit),
                        currentPage: page,
                        tags: await Tags.tagsList(),
                        categories: await Blogs.categoryLists(),
                    },
                };
                responseHandler(res, 200, responseData);
            } else {
                responseHandler(res, 400, {
                    message: 'failed to update blog',
                });
            }
        } catch (err) {
            writeErrorLog(err);
            responseHandler(res, 500, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc   blog list for promotion site
     * @route   GET /v1/blog/list
     * @param {*} req
     * @param {*} res
     */
    GetAllBlogs = async (req, res) => {
        try {
            const Tags = new TagsController();
            const Blogs = new BlogsCategoryController();
            const requestParam = req.query ? req.query : {};
            const searchQuery = requestParam.search;
            const statusFilter = requestParam.status || 1;
            const categoryName = requestParam.category_name;
            const condition = {};

            if (categoryName) {
                condition.category_name = {
                    $regex: categoryName,
                    $options: 'i',
                };
            }

            if (searchQuery) {
                condition.blog_name = {
                    $regex: searchQuery,
                    $options: 'i',
                };
            }

            if (statusFilter) {
                condition.status = statusFilter;
            }
            const blogs = await BlogsModel.find(condition)
                .select([
                    '-_id',
                    'blog_no',
                    'blog_name',
                    'permalink',
                    'category_name',
                    'blog_description',
                    'blog_banner',
                    'status',
                    'createdAt',
                ])
                .populate({
                    path: 'tags',
                    select: '-_id tag_name tag_no',
                    match: { status: 1 },
                });
            if (blogs) {
                const responseData = {
                    message: 'Blogs successfully fetched',
                    data: {
                        blogList: blogs,
                        total_count: blogs.length,
                        tags: await Tags.tagsList(),
                        categories: await Blogs.categoryLists(),
                    },
                };
                responseHandler(res, 201, responseData);
            } else {
                responseHandler(res, 404, {
                    message: 'failed to update blog',
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
     * @desc   blog detail for promotion site
     * @route GET /v1/blog/detail
     * @param {*} req
     * @param {*} res
     */
    GetBlogDetails = async (req, res) => {
        try {
            const blogNo = req.params.id || '';
            // const permalink = req.params.permalink || '';
            let condition = {};
            // if (permalink) {
            //     condition = {
            //         permalink: {
            //             $regex: permalink,
            //             $options: 'i',
            //         },
            //     };
            // } else
            if (blogNo) {
                condition = {
                    blog_no: blogNo,
                };
            }

            if (blogNo) {
                const blog = await BlogsModel.findOne(condition)
                    .select([
                        '-_id',
                        'category_id',
                        'blog_no',
                        'blog_name',
                        'permalink',
                        'category_name',
                        'blog_description',
                        'blog_banner',
                        'blog_content',
                        'status',
                        'createdAt',
                    ])
                    .populate({
                        path: 'tags',
                        select: '-_id tag_name tag_no',
                        match: { status: 1 },
                    });
                const tags = blog.tags;
                let StrTags = '';

                for (let i = 0; i < tags.length; i++) {
                    StrTags += await this.concatenateFunction(
                        i,
                        tags[i].tag_name,
                    );
                }
                const extendedObject = { ...blog.toObject(), tags: StrTags };
                if (blog) {
                    const responseData = {
                        message: 'blog fetched successfully',
                        data: {
                            blog: extendedObject,
                        },
                    };
                    responseHandler(res, 201, responseData);
                } else {
                    responseHandler(res, 304, {
                        message: 'no data found',
                    });
                }
            } else {
                responseHandler(res, 404, {
                    message: 'Required Fields are missing!',
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
     * @desc   blog detail for promotion site
     * @route GET /v1/blog
     * @param {*} req
     * @param {*} res
     */
    GetBlogDetailsWithPermalink = async (req, res) => {
        try {
            const permalink = req.params.permalink || '';
            if (permalink) {
                const blog = await BlogsModel.findOne({
                    permalink: {
                        $regex: permalink,
                        $options: 'i',
                    },
                    status: 1,
                })
                    .select([
                        '-_id',
                        'blog_no',
                        'blog_name',
                        'permalink',
                        'category_id',
                        'category_name',
                        'blog_description',
                        'blog_banner',
                        'blog_content',
                        'status',
                        'createdAt',
                    ])
                    .populate({
                        path: 'tags',
                        select: '-_id tag_name tag_no',
                        match: { status: 1 },
                    });
                if (blog) {
                    const responseData = {
                        message: 'blog fetched successfully',
                        data: {
                            blog: blog,
                        },
                    };
                    responseHandler(res, 201, responseData);
                } else {
                    responseHandler(res, 304, {
                        message: 'no data found',
                    });
                }
            } else {
                responseHandler(res, 401, {
                    message: 'Required Fields are missing!',
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
     * @desc   blog update for promotion site
     * @route GET /v1/blog
     * @param {*} req
     * @param {*} res
     */
    UpdateBlog = async (req, res) => {
        try {
            const postData = req.body || {};
            const blogNo = req.params.blogNo || '';
            if (postData && blogNo) {
                if (
                    postData.blog_name &&
                    postData.category_id &&
                    postData.category_name &&
                    postData.tag_name &&
                    postData.permalink &&
                    postData.blog_description &&
                    postData.blog_content
                ) {
                    const blog = await BlogsModel.findOneAndUpdate(
                        {
                            blog_no: blogNo,
                        },
                        {
                            $set: {
                                blog_name: postData.blog_name,
                                category_id: postData.category_id,
                                category_name: postData.category_name,
                                permalink: postData.permalink,
                                blog_description: postData.blog_description,
                                blog_content: postData.blog_content,
                                blog_banner: postData.blog_banner,
                                tag_name: postData.tag_name,
                            },
                        },
                        { new: true },
                    ).populate('tags');
                    if (blog) {
                        if (postData.tag_name) {
                            await BlogTagsModel.deleteMany({
                                blog: blog._id,
                            });
                            const tags = postData.tag_name
                                ? postData.tag_name.split(',')
                                : [];

                            const tagsToInsert = [];
                            for (let i = 0; tags.length > i; i++) {
                                let uniqid = await CommonController.getUniqid();
                                uniqid = 'FLSBLTG' + uniqid;

                                await tagsToInsert.push({
                                    tag_no: uniqid,
                                    tag_name: tags[i].trim(),
                                    blog: blog._id,
                                    blog_name: blog.blog_name,
                                    status: 1,
                                });
                            }
                            const savedTags = await BlogTagsModel.insertMany(
                                tagsToInsert,
                            );
                            const tagIds = savedTags.map(tag => tag._id);

                            await BlogsModel.updateOne(
                                { blog_no: blogNo },
                                {
                                    $push: {
                                        tags: { $each: tagIds },
                                    },
                                },
                                { new: true },
                            );
                        }
                        const responseData = {
                            message: 'Blog Updated successfully',
                            data: {},
                        };
                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 404, {
                            message: 'failed to create blog',
                        });
                    }
                } else {
                    responseHandler(res, 404, {
                        message: 'Mandatory Fields are missing!',
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
     * @desc   blog status change for promotion site
     * @route GET /v1/change-status
     * @param {*} req
     * @param {*} res
     */
    StatusChange = async (req, res) => {
        try {
            const blogNo = req.params.blogNo || '';

            if (blogNo) {
                const blog = await BlogsModel.findOne({
                    blog_no: blogNo || '',
                });

                if (blog) {
                    const savedBlog = await BlogsModel.findOneAndUpdate(
                        {
                            blog_no: blog.blog_no,
                        },
                        {
                            status: blog.status ? 0 : 1,
                        },
                        {
                            new: true,
                            upsert: false,
                        },
                    );
                    if (savedBlog) {
                        const responseData = {
                            message: 'status updated successfully',
                            data: {
                                status: savedBlog.status,
                            },
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
                    message: 'Mandatory field is missing',
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
     * @desc   blog delete for promotion site
     * @route GET /v1/delete-blog
     * @param {*} req
     * @param {*} res
     */
    DeleteBlog = async (req, res) => {
        try {
            const blogNo = req.params.blogNo || '';
            if (blogNo) {
                const blog = await BlogsModel.findOne({
                    blog_no: blogNo,
                }).select('tags');
                if (blog) {
                    const deleteStatus = await BlogsModel.deleteOne({
                        blog_no: blogNo,
                    });
                    const childResult = await BlogTagsModel.deleteMany({
                        _id: { $in: blog.tags },
                    });
                    const responseData = {
                        message: 'blog deleted successfully',
                        data: {
                            deleteStatus,
                            childResult,
                        },
                    };
                    responseHandler(res, 201, responseData);
                } else {
                    responseHandler(res, 304, {
                        message: 'failed to delete blog',
                    });
                }
            } else {
                responseHandler(res, 404, {
                    message: 'mandatory fields are missing',
                });
            }
        } catch (err) {
            writeErrorLog(err);
            responseHandler(res, 404, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc blog image upload
     * @route POST /v1/blog/upload-blog-image
     * @param {*} req
     * @param {*} res
     */
    UploadBlogImage = async (req, res) => {
        try {
            if (req.file && req.file.size > 0) {
                const cloudinary = new cloudinaryController();
                const uniqid = await CommonController.getUniqid();
                const cloudData = await cloudinary.uploadImage(req.file.path, {
                    folder: 'foloosi/blog',
                    public_id: 'FLBIMG' + uniqid,
                });

                const responseData = {
                    message: 'Blog Image added successfully',
                    data: {
                        img_url: cloudData.secure_url,
                    },
                };
                responseHandler(res, 201, responseData);
            } else {
                responseHandler(res, 415, {
                    message: 'Image file missing!',
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

    /**
     * @desc concatenate
     * @param {*} indexOfString
     * @param {*} value
     */
    concatenateFunction = async (indexOfString, value) => {
        if (indexOfString == 0) {
            return value;
        } else {
            return ',' + value;
        }
    };
    /** internal functions ends */
}

module.exports = BlogsController;
