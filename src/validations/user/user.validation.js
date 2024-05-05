const Joi = require("joi");
const { password, objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.users.status.map((status) => status.value);
const roleValues = lang.users.role_lang.map((role) => role.value);

const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    designation: Joi.string().required(),
    workspace_ids: Joi.array(),
    task_ids: Joi.array(),
    password: Joi.string().required().custom(password),
    role: Joi.string()
      .required()
      .valid(...roleValues),
    status: Joi.string().valid(...statusValues),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    workspace_id: Joi.string(),
    task_id: Joi.string() || null,
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      designation: Joi.string(),
      workspace_ids: Joi.array(),
      task_ids: Joi.array(),
      password: Joi.string().custom(password),
      role: Joi.string().valid(...roleValues),
      status: Joi.string().valid(...statusValues),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
