const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");

const commentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  replies: [],
  tags: {
    type: mongoose.Schema.Types.Mixed,
  },
  tracker_id: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  commented_by: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  commented_at: {
    type: Date,
    default: Date.now,
  },
});

// add plugin that converts mongoose to json
commentSchema.plugin(toJSON);
commentSchema.plugin(paginate);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
