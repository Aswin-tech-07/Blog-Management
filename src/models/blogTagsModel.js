const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlogTagSchema = new Schema(
    {
        // _id: Schema.Types.ObjectId,
        blog: {
            type: Schema.Types.ObjectId,
            ref: 'Blogs',
        },
        tag_no: {
            type: String,
        },
        tag_name: {
            type: String,
        },
        blog_name: {
            type: String,
        },
        status: {
            type: Number,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('BlogTags', BlogTagSchema);
