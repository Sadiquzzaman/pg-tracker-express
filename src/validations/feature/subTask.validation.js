const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.subTask.status.map((status) => status.value);

const createSubTask = {
  body: Joi.object().keys({
    trackerId: Joi.string(),
    mileStoneId: Joi.string(),
    assignTo: Joi.string(),
    subTask: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string(),
        status: Joi.string().valid(...statusValues),
      })
    ),
  }),
};

const getSubTasks = {
  query: Joi.object().keys({
    name: Joi.string(),
    trackerId: Joi.string(),
    mileStoneId: Joi.string(),
    assignTo: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSubTask = {
  params: Joi.object().keys({
    subTaskId: Joi.string().custom(objectId),
  }),
};

const updateSubTask = {
  body: Joi.object().keys({
    trackerId: Joi.string(),
    milestoneId: Joi.string(),
    subTasks: Joi.array().items(
      Joi.object()
        .keys({
          subTaskId: Joi.string(),
          name: Joi.string(),
          description: Joi.string(),
          assignTo: Joi.string(),
          status: Joi.string().valid(...statusValues),
        })
        .min(1)
    ),
  }),
};

const deleteSubTask = {
  params: Joi.object().keys({
    subTaskId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSubTask,
  getSubTasks,
  getSubTask,
  updateSubTask,
  deleteSubTask,
};
