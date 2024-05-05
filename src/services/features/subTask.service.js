const httpStatus = require("http-status");
const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const teamService = require("./team.service");
const { SubTask } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");

/**
 * Create a sub task
 * @param {Object} subTaskBody
 * @returns {Promise<SubTask[]>}
 */
const createSubTask = async (
  subTaskBody,
  trackerDetails,
  milestoneDetails,
  token
) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }
  if (milestoneDetails) {
    if (
      milestoneDetails.tracker.type === "milestone" ||
      milestoneDetails.tracker.type === "both"
    ) {
      subTaskBody.milestone = milestoneDetails;
    } else {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "This Tracker is task based"
      );
    }
  }

  if (trackerDetails) {
    if (trackerDetails.type === "task" || trackerDetails.type === "both") {
      subTaskBody.tracker = trackerDetails;
    } else {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "This Tracker is milestone based"
      );
    }
  }

  if (subTaskBody.assignTo) {
    const teamDetails = await teamService.getTeamById(subTaskBody.assignTo);
    if (!teamDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "No Team Found");
    }
    delete subTaskBody.assignTo;
    subTaskBody.assign_to = teamDetails;
  }
  let subTasks = [];
  for (let i = 0; i < subTaskBody.subTask.length; i++) {
    subTaskBody.created_by = user.id;
    subTaskBody.name = subTaskBody.subTask[i].name;
    subTaskBody.description = subTaskBody.subTask[i].description;
    subTaskBody.status = subTaskBody.subTask[i].status;
    subTasks.push(await SubTask.create(subTaskBody));
  }
  return subTasks;
};

/**
 * Query for teams
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySubTasks = async (filter, options) => {
  if (filter.trackerId) {
    const trackerId = filter.trackerId;
    delete filter.trackerId;
    filter.tracker = { $elemMatch: { id: trackerId } };
  }

  if (filter.mileStoneId) {
    const milestoneId = filter.mileStoneId;
    delete filter.mileStoneId;
    filter.milestone = { $elemMatch: { id: milestoneId } };
  }

  if (filter.assignTo) {
    const teamId = filter.assignTo;
    delete filter.assignTo;
    filter.assign_to = { $elemMatch: { id: teamId } };
  }
  const subTasks = await SubTask.paginate(filter, options);
  return subTasks;
};

/**
 * Get team by id
 * @param {ObjectId} id
 * @returns {Promise<SubTask>}
 */
const getSubTaskById = async (id) => {
  const subtask = await SubTask.findById(id);
  if (!subtask) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub Task Not Found");
  }
  return subtask;
};

/**
 * Update team by id
 * @param {ObjectId} teamId
 * @param {Object} updateBody
 * @returns {Promise<SubTask[]>}
 */
const updateSubTaskById = async (updateBody, token) => {
  let subTasks = [];
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  for (let i = 0; i < updateBody.subTasks.length; i++) {
    const subtask = await getSubTaskById(updateBody.subTasks[i].subTaskId);
    if (!subtask) {
      throw new ApiError(httpStatus.NOT_FOUND, "Sub Task not found");
    }
    if (updateBody.subTasks[i].assignTo) {
      const team = await teamService.getTeamById(
        updateBody.subTasks[i].assignTo
      );
      if (!team) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
      }
      updateBody.subTasks[i].assign_to = team;
    }
    Object.assign(subtask, updateBody.subTasks[i]);
    await subtask.save();
    subTasks.push(subtask);
  }
  return subTasks;
};

/**
 * Delete team by id
 * @param {ObjectId} teamId
 * @returns {Promise<Team>}
 */
const deleteSubTaskById = async (subTaskId) => {
  const subTask = await getSubTaskById(subTaskId);
  if (!subTask) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub Task not found");
  }
  await subTask.remove();
  return subTask;
};

module.exports = {
  createSubTask,
  querySubTasks,
  getSubTaskById,
  updateSubTaskById,
  deleteSubTaskById,
};
