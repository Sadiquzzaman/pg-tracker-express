const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.teams.status.map((status) => status.value);
const actionValues = lang.teams.action.map((action) => action.value);

const createTeam = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    workspace: Joi.object().required(),
    emails: Joi.string().required(),
    status: Joi.string().valid(...statusValues),
  }),
};

const getTeams = {
  query: Joi.object().keys({
    name: Joi.string(),
    workspace_id: Joi.string(),
    member_id: Joi.string(),
    status: Joi.string().valid(...statusValues),
    isEmailVerified: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const updateTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      members: Joi.array(),
      label: Joi.string(),
      status: Joi.string().valid(...statusValues),
      action: Joi.string().valid(...actionValues),
    })
    .min(1),
};

const deleteTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
};
