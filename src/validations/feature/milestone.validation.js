const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const typeValues = lang.milestones.types.map((type) => type.value);
const statusValues = lang.milestones.status.map((status) => status.value);

const createMilestone = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    teams: Joi.array(),
    trackerId: Joi.string(),
    types: Joi.string().valid(...typeValues),
    status: Joi.string().valid(...statusValues),
    value: Joi.string().optional(),
    start_date: Joi.date(),
    end_date: Joi.date(),
  }),
};

const getMilestones = {
  body: Joi.object().keys({
    name: Joi.string(),
    tracker_id: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMilestone = {
  params: Joi.object().keys({
    milestoneId: Joi.string().custom(objectId),
  }),
};

const updateMilestone = {
  params: Joi.object().keys({
    milestoneId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      description: Joi.string(),
      teams: Joi.array(),
      subTasks: Joi.array(),
      types: Joi.string().valid(...typeValues),
      status: Joi.string().valid(...statusValues),
      value: Joi.string().optional(),
      start_date: Joi.date(),
      end_date: Joi.date(),
    })
    .min(1),
};

const deleteMilestone = {
  params: Joi.object().keys({
    milestoneId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone,
};
