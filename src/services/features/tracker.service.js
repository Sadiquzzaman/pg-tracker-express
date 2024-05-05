const httpStatus = require("http-status");
const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const teamService = require("./team.service");
const milestoneService = require("./milestone.service");
const subTaskService = require("./subTask.service");
const commentService = require("./comment.service");
const { Tracker } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");
const { token } = require("morgan");

/**
 * Create a task
 * @param {Object} trackerBody
 * @returns {Promise<Member>}
 */
const createTracker = async (trackerBody, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  if (trackerBody.members) {
    for (let i = 0; i < trackerBody.members.length; i++) {
      const memberDetails = await userService.getUserById(
        trackerBody.members[i].id
      );
      if (!memberDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Member not found");
      }
      trackerBody.members[i].name = memberDetails.name;
      trackerBody.members[i].designation = memberDetails.designation;
      trackerBody.members[i].email = memberDetails.email;
      trackerBody.members[i].role = memberDetails.role;
    }
  }

  if (trackerBody.teams) {
    for (let i = 0; i < trackerBody.teams.length; i++) {
      const teamDetails = await teamService.getTeamById(
        trackerBody.teams[i].id
      );
      if (!teamDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
      }
      trackerBody.teams[i] = teamDetails;
    }
  }

  trackerBody.created_by = user.id;

  // if (trackerBody.start_date < new Date()) {
  //   throw new ApiError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     "Start Date must be equal or greater than " +
  //       new Date().toLocaleDateString("en-US")
  //   );
  // }

  if (trackerBody.end_date < trackerBody.start_date) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "End Date must be equal or greater than " +
        trackerBody.start_date.toLocaleDateString("en-US")
    );
  }

  return Tracker.create(trackerBody);
};

/**
 * Query for members
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTrackres = async (filter, options) => {
  if (filter.team_id) {
    const teamId = filter.team_id;
    const team = await teamService.getTeamById(teamId);
    delete filter.team_id;
    filter.teams = { $elemMatch: { _id: team._id } };
  }
  if (filter.member_id) {
    const memberId = filter.member_id;
    delete filter.member_id;
    filter.members = { $elemMatch: { id: memberId } };
  }
  if (filter.workspace_id) {
    const workspaceId = filter.workspace_id;
    delete filter.workspace_id;
    filter["workspace.id"] = workspaceId;
  }

  const tracker = await Tracker.paginate(filter, options);
  for (let i = 0; i < tracker.results.length; i++) {
    const trackerId = tracker.results[i].id;
    // tracker.results[i].milestones =
    //   await milestoneService.getMilestoneByTrackerId(trackerId);

    const days_left = calulateDaysLeft(tracker.results[i].end_date);
    const total_comments = await calculateTotalComments(trackerId);
    // todo: Total view count and substask count
    const total_views = 0;
    const total_subtask = await calculateTotalSubTasks(trackerId);
    const done_task = await calculateDoneTask(trackerId);
    const done_percentage = (done_task / total_subtask) * 100;
    const tracker_color = await calculateColor(
      trackerId,
      done_percentage,
      days_left
    );

    tracker.results[i].status_bar = {
      days_left,
      total_comments,
      total_views,
      total_subtask,
      done_percentage,
      tracker_color,
    };

    if (tracker.results[i].milestones.length > 0) {
      for (let j = 0; j < tracker.results[i].milestones.length; j++) {
        const milstoneId = tracker.results[i].milestones[j]._id;
        const milestoneColor = await calculateMilestoneColor(milstoneId);
        const updatedBody = {
          milestoneColor: milestoneColor,
        };

        await milestoneService.updateMilestoneStatusById(
          milstoneId,
          updatedBody
        );
      }
    }
  }
  return tracker;
};

/**
 * Get task by id
 * @param {ObjectId} id
 * @returns {Promise<Tracker>}
 */
const getTrackerById = async (id) => {
  const tracker = await Tracker.findById(id);
  if (!tracker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
  }
  return tracker;
};

/**
 * Get task by name
 * @param {string} name
 * @returns {Promise<Tracker>}
 */
const getTrackerByName = async (name) => {
  return Tracker.findOne({ name });
};

/**
 * Update task by id
 * @param {ObjectId} trackerId
 * @param {Object} updateBody
 * @returns {Promise<Tracker>}
 */
const updateTrackerById = async (trackerId, updateBody, token) => {
  const tracker = await getTrackerById(trackerId);
  if (!tracker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (updateBody.members) {
    for (let i = 0; i < updateBody.members.length; i++) {
      const memberDetails = await userService.getUserById(
        updateBody.members[i].id
      );
      updateBody.members[i].name = memberDetails.name;
      updateBody.members[i].designation = memberDetails.designation;
      updateBody.members[i].email = memberDetails.email;
      updateBody.members[i].role = memberDetails.role;
    }
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
    updateBody.type = "task";
  }

  if (updateBody.milestones) {
    for (let i = 0; i < updateBody.milestones.length; i++) {
      const milestoneDetails = await milestoneService.getMilestoneById(
        updateBody.milestones[i].id
      );
      if (!milestoneDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Milestone Not Found");
      }
      updateBody.milestones[i] = milestoneDetails;
    }
    updateBody.type = "milestone";
  }

  if (updateBody.teams) {
    for (let i = 0; i < updateBody.teams.length; i++) {
      const teamDetails = await teamService.getTeamById(updateBody.teams[i].id);
      if (!teamDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
      }
      updateBody.teams[i] = teamDetails;
    }
  }

  if (updateBody.start_date < new Date()) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "Start Date must be equal or greater than " +
        new Date().toLocaleDateString("en-US")
    );
  }

  if (updateBody.end_date < updateBody.start_date) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "End Date must be equal or greater than " +
        updateBody.start_date.toLocaleDateString("en-US")
    );
  }

  Object.assign(tracker, updateBody);
  await tracker.save();
  return tracker;
};

/**
 * Delete member by id
 * @param {ObjectId} trackerId
 * @returns {Promise<Tracker>}
 */
const deleteTrackerById = async (trackerId) => {
  const tracker = await getTrackerById(trackerId);
  if (!tracker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
  }
  await tracker.remove();
  return tracker;
};

/**
 * Calculate days left
 * @param {date} endDate
 * @returns {number}
 */
const calulateDaysLeft = (endDate) => {
  if (endDate == null) return 0;

  // Calculate the difference between the two dates in milliseconds
  const diffInMs = endDate - new Date();

  // if difference is zeor or negative
  if (diffInMs <= 0) return 0;

  // Convert the difference in milliseconds to days
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
};
1;

/**
 * Calculate total Comments
 * @param {ObjectId} trackerId
 * @returns {number}
 */
const calculateTotalComments = async (trackerId) => {
  const commentDetails = await commentService.getCommentByTrackerId(trackerId);

  // Count total replies
  let total_replies = 0;
  for (let i = 0; i < commentDetails.length; i++) {
    total_replies = total_replies + commentDetails[i].replies.length;
  }
  // Count total comment and replies
  const total_comments =
    (commentDetails.length != null ? commentDetails.length : 0) + total_replies;

  return total_comments;
};

const calculateTotalSubTasks = async (trackerId) => {
  const tracker = await getTrackerById(trackerId);
  let total_subtask = 0;
  if (tracker.subTasks.length > 0) {
    total_subtask = tracker.subTasks.length;
  }

  if (tracker.milestones && tracker.milestones.length > 0) {
    for (let i = 0; i < tracker.milestones.length; i++) {
      if (tracker.milestones[i].subTasks) {
        total_subtask = total_subtask + tracker.milestones[i].subTasks.length;
      }
    }
  }
  return total_subtask;
};

const calculateDoneTask = async (trackerId) => {
  const tracker = await getTrackerById(trackerId);
  let total_doneTask = 0;
  if (tracker.subTasks && tracker.subTasks.length > 0) {
    for (let i = 0; i < tracker.subTasks.length; i++) {
      if (tracker.subTasks[i].status === "done") {
        total_doneTask++;
      }
    }
  }

  if (tracker.milestones && tracker.milestones.length > 0) {
    for (let i = 0; i < tracker.milestones.length; i++) {
      if (
        tracker.milestones[i].subTasks &&
        tracker.milestones[i].subTasks.length > 0
      ) {
        for (let j = 0; j < tracker.milestones[i].subTasks.length; j++) {
          if (tracker.milestones[i].subTasks[j].status === "done") {
            total_doneTask++;
          }
        }
      }
    }
  }
  return total_doneTask;
};

const calculateMilestoneColor = async (milestoneId) => {
  const milestone = await milestoneService.getMilestoneById(milestoneId);
  let milestoneColor = "";
  let totalTask = 0;
  let doneTasks = 0;
  if (milestone.subTasks) {
    totalTask = milestone.subTasks.length;
    for (let i = 0; i < milestone.subTasks.length; i++) {
      if (milestone.subTasks[i].status === "done") {
        doneTasks++;
      }
    }
  }

  const totalInMonthsLeft = milestone.end_date - new Date();
  const totalDaysLeft = Math.ceil(totalInMonthsLeft / (1000 * 60 * 60 * 24));

  const totalInMonths = milestone.end_date - milestone.start_date;
  const totalDays = Math.ceil(totalInMonths / (1000 * 60 * 60 * 24));

  const taskDonePercentage = (doneTasks / totalTask) * 100;

  const elapseDaysPercentage = ((totalDays - totalDaysLeft) / totalDays) * 100;
  if (taskDonePercentage === 100) {
    milestoneColor = "Green";
  } else if (taskDonePercentage < elapseDaysPercentage) {
    milestoneColor = "Red";
  } else {
    milestoneColor = "Yellow";
  }

  return milestoneColor;
};

const calculateColor = async (trackerId, donePercentage, days_left) => {
  const tracker = await getTrackerById(trackerId);
  let trackerColor = "";
  const totalInMonths = tracker.end_date - tracker.start_date;

  const totalInDays = Math.ceil(totalInMonths / (1000 * 60 * 60 * 24));

  const elapseDaysPercentage = ((totalInDays - days_left) / totalInDays) * 100;
  if (donePercentage === 100) {
    trackerColor = "Green";
  } else if (donePercentage < elapseDaysPercentage) {
    trackerColor = "Red";
  } else {
    trackerColor = "Yellow";
  }

  return trackerColor;
};

/**
 * Calculate Tracker milestone percentage
 * @param {ObjectId} trackerId
 * @returns {Number} percentage
 */
const calculateTrackerMilestonePercentage = async (trackerId) => {
  const tracker = await getTrackerById(trackerId);
  if (!tracker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
  }
  const trackerStartDate = tracker.start_date;
  const trackerEndDate = tracker.end_date;
  const daysCount = Math.ceil(
    (trackerEndDate - trackerStartDate) / (1000 * 60 * 60 * 24)
  );

  if (tracker.milestones.length >= 0) {
    const milestoneCount = tracker.milestones.length;

    for (let i = 0; i < milestoneCount; i++) {
      let milestoneDaysCount = 0;
      let percentage = 0;
      if (i == 0) {
        milestoneDaysCount = Math.ceil(
          (tracker.milestones[i].end_date - trackerStartDate) /
            (1000 * 60 * 60 * 24)
        );
        tracker.milestones[i].percentage =
          (milestoneDaysCount * 100) / daysCount;
      } else if (i == milestoneCount - 1) {
        milestoneDaysCount = Math.ceil(
          (trackerEndDate - tracker.milestones[i].start_date) /
            (1000 * 60 * 60 * 24)
        );
        tracker.milestones[i].percentage += 100 - percentage;
      } else {
        milestoneDaysCount = Math.ceil(
          (tracker.milestones[i].end_date - tracker.milestones[i].start_date) /
            (1000 * 60 * 60 * 24)
        );
        tracker.milestones[i].percentage +=
          (milestoneDaysCount * 100) / daysCount;
      }
    }
    Object.assign(tracker, tracker.milestones);
    await tracker.save();
  }
  return tracker;
};

module.exports = {
  createTracker,
  queryTrackres,
  getTrackerById,
  getTrackerByName,
  updateTrackerById,
  deleteTrackerById,
  calculateTrackerMilestonePercentage,
  calculateTotalSubTasks,
  calculateDoneTask,
  calculateColor,
  calulateDaysLeft,
};
