const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const roleValues = lang.accessRoles.roles.map((role) => role.value);

const createRoleManagement = {
  body: Joi.array().items(
    Joi.object().keys({
      memberId: Joi.string().custom(objectId),
      teams: Joi.array().items(
        Joi.object().keys({
          id: Joi.string().custom(objectId),
          workspaceId: Joi.string().custom(objectId),
          role: Joi.string().valid(...roleValues),
        })
      ),
      trackers: Joi.object().keys({
        id: Joi.string().custom(objectId),
        role: Joi.string().valid(...roleValues),
      }),
      // tasks: Joi.array(),
    })
  ),
};

const getRoleManagements = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    workspaces: Joi.string().custom(objectId),
    trackers: Joi.string().custom(objectId),
    // tasks: Joi.string().custom(objectId),
    roles: Joi.string().valid(...roleValues),
  }),
};

const getRoleManagement = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateRoleManagement = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      teams: Joi.array().items(
        Joi.object().keys({
          id: Joi.string().custom(objectId),
          workspaceId: Joi.string().custom(objectId),
          role: Joi.string().valid(...roleValues),
        })
      ),
      trackers: Joi.object().keys({
        id: Joi.string().custom(objectId),
        role: Joi.string().valid(...roleValues),
      }),
    })
    .min(1),
};

const deleteRoleManagement = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createRoleManagement,
  getRoleManagements,
  getRoleManagement,
  updateRoleManagement,
  deleteRoleManagement,
};
