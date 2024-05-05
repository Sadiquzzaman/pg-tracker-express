const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.members.status.map((status) => status.value);

const createMember = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    workspace_ids: Joi.array(),
    task_ids: Joi.array(),
    role_id: Joi.string(),
    status: Joi.string().valid(...statusValues),
  }),
};

const getMembers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    workspace_ids: Joi.array(),
    task_ids: Joi.array(),
    role_id: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMember = {
  params: Joi.object().keys({
    memberId: Joi.string().custom(objectId),
  }),
};

const updateMember = {
  params: Joi.object().keys({
    memberId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      workspace_ids: Joi.array(),
      task_ids: Joi.array(),
      role_id: Joi.string(),
      status: Joi.string().valid(...statusValues),
    })
    .min(1),
};

const deleteMember = {
  params: Joi.object().keys({
    memberId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
};
