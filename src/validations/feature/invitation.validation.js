const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.invitations.status.map((status) => status.value);

const createInvitation = {
  body: Joi.object().keys({
    workspace_id: Joi.string().required(),
    tracker_id: Joi.string(),
    members: Joi.array(),
    teams: Joi.array(),
    invited_by: Joi.string(),
    status: Joi.string().valid(...statusValues),
  }),
};

const getInvitations = {
  query: Joi.object().keys({
    workspace_id: Joi.string(),
    // tracker_id: Joi.string(),
    member_id: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getInvitation = {
  params: Joi.object().keys({
    invitationId: Joi.string().custom(objectId),
  }),
};

const updateInvitation = {
  params: Joi.object().keys({
    invitationId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      workspace_id: Joi.string(),
      // tracker_id: Joi.string(),
      member_id: Joi.string(),
      invited_by: Joi.string(),
      status: Joi.string().valid(...statusValues),
    })
    .min(1),
};

const deleteInvitation = {
  params: Joi.object().keys({
    invitationId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createInvitation,
  getInvitations,
  getInvitation,
  updateInvitation,
  deleteInvitation,
};
