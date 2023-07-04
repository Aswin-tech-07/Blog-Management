const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogCategorySchema = new Schema(
    {
        category_name: {
            type: String,
            required: true,
        },
        category_seo_name: {
            type: String,
        },
        category_no: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
        },
        blogs: [{ type: Schema.Types.ObjectId, ref: 'Blogs' }],
    },
    {
        timestamps: true,
    },
);
const BlogCategory = mongoose.model('BlogCategory', BlogCategorySchema);
module.exports = BlogCategory;
