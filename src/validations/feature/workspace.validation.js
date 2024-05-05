const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.workspaces.status.map((status) => status.value);

const createWorkspace = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string(),
    description: Joi.string(),
    members: Joi.array(),
    teams: Joi.array(),
    workspace: Joi.object(),
    status: Joi.string().valid(...statusValues),
  }),
};

const getWorkspaces = {
  query: Joi.object().keys({
    name: Joi.string(),
    type: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getWorkspace = {
  params: Joi.object().keys({
    workspaceId: Joi.string().custom(objectId),
  }),
};

const updateWorkspace = {
  params: Joi.object().keys({
    workspaceId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      type: Joi.string(),
      description: Joi.string(),
      members: Joi.array(),
      teams: Joi.array(),
      trackers: Joi.array(),
      status: Joi.string().valid(...statusValues),
    })
    .min(1),
};

const deleteWorkspace = {
  params: Joi.object().keys({
    workspaceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
