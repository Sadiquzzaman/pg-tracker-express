const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { commentService, tokenService } = require("../../services");

const createComment = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const comment = await commentService.createComment(req.body, token);
  res.status(httpStatus.CREATED).send(comment);
});

const getComments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["content", "tracker_id"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await commentService.queryComments(filter, options);
  res.send(result);
});

const getComment = catchAsync(async (req, res) => {
  const comment = await commentService.getCommentById(req.params.commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Comment not found");
  }
  res.send(comment);
});

const updateComment = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const comment = await commentService.updateCommentById(
    req.params.commentId,
    req.body,
    token
  );
  res.send(comment);
});

const deleteComment = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  await commentService.deleteCommentById(req.params.commentId, token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
};
