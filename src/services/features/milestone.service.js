const httpStatus = require("http-status");
const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const subTaskService = require("../features/subTask.service");
const teamService = require("../features/team.service");
const { Milestone } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");

/**
 * Create a milestone
 * @param {Object} milestoneBody
 * @param {Object} trackerDetails
 * @param {String} token
 * @returns {Promise<Milestone>}
 */
const createMilestone = async (milestoneBody, trackerDetails, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  if (!trackerDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
  }
  delete milestoneBody.trackerId;
  milestoneBody.tracker = {
    id: trackerDetails.id,
    name: trackerDetails.name,
    status: trackerDetails.status,
    start_date: trackerDetails.start_date,
    end_date: trackerDetails.end_date,
    type: trackerDetails.type,
  };
  if (milestoneBody.teams) {
    for (let i = 0; i < milestoneBody.teams.length; i++) {
      const team = await teamService.getTeamById(milestoneBody.teams[i].id);
      if (!team) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
      }
      milestoneBody.teams[i] = team;
    }
  }
  milestoneBody.created_by = user.id;

  if (
    milestoneBody.end_date.toLocaleDateString("en-US") <
    milestoneBody.start_date.toLocaleDateString("en-US")
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "End Date must be equal or greater than " +
        milestoneBody.start_date.toLocaleDateString("en-US")
    );
  }

  if (
    milestoneBody.start_date.toLocaleDateString("en-US") <
    trackerDetails.start_date.toLocaleDateString("en-US")
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "Start Date must be equal or greater than " +
        trackerDetails.start_date.toLocaleDateString("en-US")
    );
  }
  if (
    milestoneBody.start_date.toLocaleDateString("en-US") >
    trackerDetails.end_date.toLocaleDateString("en-US")
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "Start Date must be equal or lesser than " +
        trackerDetails.end_date.toLocaleDateString("en-US")
    );
  }

  if (
    milestoneBody.end_date.toLocaleDateString("en-US") <
    trackerDetails.start_date.toLocaleDateString("en-US")
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "End Date must be equal or greater than " +
        trackerDetails.start_date.toLocaleDateString("en-US")
    );
  }
  if (
    milestoneBody.end_date.toLocaleDateString("en-US") >
    trackerDetails.end_date.toLocaleDateString("en-US")
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "End Date must be equal or lesser than " +
        trackerDetails.end_date.toLocaleDateString("en-US")
    );
  }
  return Milestone.create(milestoneBody);
};

/**
 * Query for milestone
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMilestones = async (filter, options) => {
  if (filter.tracker_id) {
    const trackerId = filter.tracker_id;
    delete filter.tracker_id;
    filter["tracker.id"] = trackerId;
  }
  const milestone = await Milestone.paginate(filter, options);
  return milestone;
};

/**
 * Get milestone by id
 * @param {ObjectId} id
 * @returns {Promise<Milestone>}
 */
const getMilestoneById = async (id) => {
  return Milestone.findById(id);
};

/**
 * Get milestone by name
 * @param {string} name
 * @returns {Promise<Milestone>}
 */
const getMilestoneByName = async (name) => {
  return Milestone.findOne({ name });
};

/**
 * Update milestone by id
 * @param {ObjectId} milestoneId
 * @param {Object} updateBody
 * @returns {Promise<Milestone>}
 */
const updateMilestoneById = async (milestoneId, updateBody, token) => {
  const milestone = await getMilestoneById(milestoneId);
  if (!milestone) {
    throw new ApiError(httpStatus.NOT_FOUND, "Milestone not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (updateBody.subTasks) {
    for (let i = 0; i < updateBody.subTasks.length; i++) {
      const subTaskDetails = await subTaskService.getSubTaskById(
        updateBody.subTasks[i].id
      );
      if (!subTaskDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Sub Task Not Found");
      }
      updateBody.subTasks[i] = subTaskDetails;
    }
  }

  if (updateBody.teams) {
    for (let i = 0; i < updateBody.teams.length; i++) {
      const team = await teamService.getTeamById(updateBody.teams[i].id);
      if (!team) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
      }
      updateBody.teams[i] = team;
    }
  }

  // if (updateBody.end_date < updateBody.start_date) {
  //   throw new ApiError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     "End Date must be equal or greater than " +
  //       updateBody.start_date.toLocaleDateString("en-US")
  //   );
  // }

  // if (updateBody.start_date < trackerDetails.start_date) {
  //   throw new ApiError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     "Start Date must be equal or greater than " +
  //       trackerDetails.start_date.toLocaleDateString("en-US")
  //   );
  // }
  // if (updateBody.start_date > trackerDetails.end_date) {
  //   throw new ApiError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     "Start Date must be equal or lesser than " +
  //       trackerDetails.end_date.toLocaleDateString("en-US")
  //   );
  // }

  // if (updateBody.end_date < trackerDetails.start_date) {
  //   throw new ApiError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     "End Date must be equal or greater than " +
  //       trackerDetails.start_date.toLocaleDateString("en-US")
  //   );
  // }
  // if (updateBody.end_date > trackerDetails.end_date) {
  //   throw new ApiError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     "End Date must be equal or lesser than " +
  //       trackerDetails.end_date.toLocaleDateString("en-US")
  //   );
  // }

  Object.assign(milestone, updateBody);
  await milestone.save();
  return milestone;
};

const updateMilestoneStatusById = async (milestoneId, updateBody) => {
  const milestone = await getMilestoneById(milestoneId);
  if (!milestone) {
    throw new ApiError(httpStatus.NOT_FOUND, "Milestone not found");
  }

  milestone.color = updateBody.milestoneColor;
  Object.assign(milestone, updateBody);
  await milestone.save();
  return milestone;
};

/**
 * Delete milestone by id
 * @param {ObjectId} milestoneId
 * @returns {Promise<Milestone>}
 */
const deleteMilestoneById = async (milestoneId) => {
  const milestone = await getMilestoneById(milestoneId);
  if (!milestone) {
    throw new ApiError(httpStatus.NOT_FOUND, "Milestone not found");
  }
  await milestone.remove();
  return milestone;
};

/**
 * Get milestone by trackerId
 * @param {ObjectId} trackerId
 * @returns {Promise<Milestone>}
 */
const getMilestoneByTrackerId = async (trackerId) => {
  return Milestone.find({ "tracker.id": trackerId });
};

module.exports = {
  createMilestone,
  queryMilestones,
  getMilestoneById,
  getMilestoneByName,
  updateMilestoneById,
  deleteMilestoneById,
  getMilestoneByTrackerId,
  updateMilestoneStatusById,
};
