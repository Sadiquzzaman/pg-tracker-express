const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");

const createComment = {
  body: Joi.object().keys({
    content: Joi.string().required(),
    replies: Joi.array(),
    tags: Joi.object(),
    tracker_id: Joi.object(),
  }),
};

const getComments = {
  query: Joi.object().keys({
    content: Joi.string(),
    tracker_id: Joi.string().required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
};

const updateComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      content: Joi.string().required(),
      tags: Joi.object(),
      replies: Joi.array(),
    })
    .min(1),
};

const deleteComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
};
