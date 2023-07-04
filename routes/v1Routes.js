/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();
const BlogsController = require('../src/controllers/v1/blogsController');
const UsersController = require('../src/controllers/v1/usersController');
const AuthMiddleware = require('../middlewares/auth');
const BlogsCategoryController = new require(
    '../src/controllers/v1/blogsCategoryController',
);
const BlogsTagController = new require('../src/controllers/v1/tagsController');

const users = new UsersController();
const blogs = new BlogsController();
const blogsCategory = new BlogsCategoryController();
const blogsTag = new BlogsTagController();
const auth = new AuthMiddleware();

// User Route
router
    .post('/user/signup/:role', users.userSignup)
    .post('/user/login', users.userLogin)
    .post('/user/change-password', auth.authCheck, auth.userAccess, users.changePassword)
    .put('/user/status-change', auth.authCheck, auth.userAccess, users.statusChange)
    .put('/user/logout', auth.authCheck, users.userLogout);

// Blog Route
router
    .post('/blog/create-blog', auth.authCheck, blogs.createBlog)
    .get('/blog/blog-list', blogs.GetAllBlogs)
    .get('/blog/list', auth.authCheck, blogs.GetAllBlogsForAdmin)
    .put('/blog/update-blog/:blogNo', auth.authCheck, blogs.UpdateBlog)
    .put('/blog/change-status/:blogNo', auth.authCheck, blogs.StatusChange)
    .delete('/blog/delete-blog/:blogNo', auth.authCheck, blogs.DeleteBlog)
    .get('/blog/blog-detail/:id', auth.authCheck, blogs.GetBlogDetails)
    .get('/blog/:permalink', blogs.GetBlogDetailsWithPermalink);

// Blogs Category Route
router
    .post('/category/create-blog-category', auth.authCheck, blogsCategory.createCategory)
    .put('/category/update-blog-category', auth.authCheck, blogsCategory.updateCategory)
    .put('/category/status-change-category/:categoryNo', auth.authCheck, blogsCategory.statusChange)
    .get('/category/get-all-category', blogsCategory.getAllCategory)
    .get('/category/category-details/:categoryNo', auth.authCheck, blogsCategory.getCategoryDetail)
    .get('/category/category-list', blogsCategory.getCategoryForFilter)
    .delete('/category/delete-blog-category/:categoryNo', auth.authCheck, blogsCategory.deleteCategory);

// Blogs Tag Route
router
    .post('/create-tag', blogsTag.createTags)
    .put('/update-tag', blogsTag.updateTags)
    .put('/status-change-tag', blogsTag.statusChange)
    .get('/get-tags', blogsTag.getAllTags)
    .get('/tag-details', blogsTag.getTagDetail)
    .delete('/delete-tag', blogsTag.deleteTag);
// router.get('/blog', blogs.GetBlogDetails);

module.exports = router;
