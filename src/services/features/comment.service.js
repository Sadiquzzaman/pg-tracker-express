const httpStatus = require("http-status");
const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const { Comment } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");

/**
 * Create a comment
 * @param {Object} commentBody
 * @returns {Promise<Comment>}
 */
const createComment = async (commentBody, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);

  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  commentBody.commented_by = {};
  commentBody.commented_by.id = user.id;
  commentBody.commented_by.name = user.name;
  commentBody.commented_by.designation = user.designation;

  return Comment.create(commentBody);
};

/**
 * Query for comments
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryComments = async (filter, options) => {
  if (filter.content) {
    filter.content = { $regex: filter.content };
  }
  if (filter.tracker_id) {
    filter.tracker_id = { id: filter.tracker_id };
  }
  const comment = await Comment.paginate(filter, options);
  return comment;
};

/**
 * Get comment by id
 * @param {ObjectId} id
 * @returns {Promise<Comment>}
 */
const getCommentById = async (id) => {
  return Comment.findById(id);
};

/**
 * Get comment by content
 * @param {string} content
 * @returns {Promise<Comment>}
 */
const getCommentByName = async (content) => {
  return Comment.findOne({ content });
};

/**
 * Update comment by id
 * @param {ObjectId} commentId
 * @param {Object} updateBody
 * @returns {Promise<Comment>}
 */
const updateCommentById = async (commentId, updateBody, token) => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Comment not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (updateBody.replies.length > 0) {
    for (let i = 0; i < updateBody.replies.length; i++) {
      if (Object.keys(updateBody.replies[i].replied_by).length == 1) {
        const reply_user = await userService.getUserById(
          updateBody.replies[i].replied_by.id
        );
        updateBody.replies[i].replied_by.name = reply_user.name;
        updateBody.replies[i].replied_by.designation = reply_user.designation;
      }
    }
  }

  Object.assign(comment, updateBody);
  await comment.save();
  return comment;
};

/**
 * Delete comment by id
 * @param {ObjectId} commnetId
 * @returns {Promise<Comment>}
 */
const deleteCommentById = async (commnetId, token) => {
  const comment = await getCommentById(commnetId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Comment not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user || comment.commented_by.id != user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  await comment.remove();
  return comment;
};

/**
 * Get milestone by trackerId
 * @param {ObjectId} trackerId
 * @returns {Promise<Comment>}
 */
const getCommentByTrackerId = async (trackerId) => {
  return Comment.find({ "tracker_id.id": trackerId });
};

module.exports = {
  createComment,
  queryComments,
  getCommentById,
  getCommentByName,
  updateCommentById,
  deleteCommentById,
  getCommentByTrackerId,
};
