const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlogSchema = new Schema(
    {
        // _id: Schema.Types.ObjectId,
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'BlogCategory',
        },
        category_name: {
            type: String,
        },
        blog_name: {
            type: String,
        },
        permalink: {
            type: String,
        },
        blog_content: {
            type: String,
        },
        blog_description: {
            type: String,
        },
        blog_banner: {
            type: String,
        },
        blog_no: {
            type: String,
        },
        status: {
            type: Number,
        },
        tags: [{ type: Schema.Types.ObjectId, ref: 'BlogTags' }],
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Blogs', BlogSchema);
