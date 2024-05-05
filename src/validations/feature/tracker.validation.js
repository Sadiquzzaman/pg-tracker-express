const Joi = require("joi");
const { objectId } = require("../custom/custom.validation");
const { lang } = require("../../config/lang");

const statusValues = lang.trackers.status.map((status) => status.value);

const createTracker = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    workspace: Joi.object().required(),
    teams: Joi.array(),
    members: Joi.array(),
    subtasks: Joi.array(),
    start_date: Joi.date(),
    end_date: Joi.date(),
    status: Joi.string().valid(...statusValues),
  }),
};

const getTrackres = {
  body: Joi.object().keys({
    name: Joi.string(),
    workspace_id: Joi.string(),
    member_id: Joi.string(),
    team_id: Joi.string(),
    subtask_id: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTracker = {
  params: Joi.object().keys({
    trackerId: Joi.string().custom(objectId),
  }),
};

const updateTracker = {
  params: Joi.object().keys({
    trackerId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      teams: Joi.array(),
      members: Joi.array(),
      milestones: Joi.array(),
      subTasks: Joi.array(),
      start_date: Joi.date(),
      end_date: Joi.date(),
      status: Joi.string().valid(...statusValues),
    })
    .min(1),
};

const deleteTracker = {
  params: Joi.object().keys({
    trackerId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTracker,
  getTrackres,
  getTracker,
  updateTracker,
  deleteTracker,
};
