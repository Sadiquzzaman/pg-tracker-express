const httpStatus = require("http-status");
const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const teamService = require("./team.service");
const { Workspace } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");
const trackerService = require("./tracker.service");

/**
 * Create a workspace
 * @param {Object} workspaceBody
 * @param {string} token
 * @returns {Promise<Workspace>}
 */
const createWorkspace = async (workspaceBody, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // for (let i = 0; i < workspaceBody.members.length; i++) {
  //   const memberDetails = await userService.getUserById(
  //     workspaceBody.members[i].id
  //   );
  //   workspaceBody.members[i].name = memberDetails.name;
  //   workspaceBody.members[i].designation = memberDetails.designation;
  //   workspaceBody.members[i].email = memberDetails.email;
  //   workspaceBody.members[i].role = memberDetails.role;
  // }
  workspaceBody.created_by = user.id;
  return Workspace.create(workspaceBody);
};

/**
 * Query for workspaces
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} token
 * @returns {Promise<QueryResult>}
 */
const queryWorkspaces = async (filter, options, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (filter.name) {
    filter.name = { $regex: filter.name, $options: "i" };
  }
  // if User is a memeber or creator of the workspace
  filter.$or = [
    { members: { $elemMatch: { id: user.id } } },
    { created_by: user.id },
  ];
  const workspaces = await Workspace.paginate(filter, options);

  for (let i = 0; i < workspaces.results.length; i++) {
    let totalTracker = 0;
    let totalTeam = 0;
    let totalMember = 0;
    let members = [];
    for (let j = 0; j < workspaces.results[i].teams.length; j++) {
      for (let k = 0; k < workspaces.results[i].teams[j].members.length; k++) {
        const memberId =
          workspaces.results[i].teams[j].members[k].id.toString();
        members.push(memberId);
      }
    }
    const uniqueArray = [...new Set(members)];

    totalMember = uniqueArray.length;

    if (workspaces.results[i].trackers) {
      totalTracker = workspaces.results[i].trackers.length;
    }

    if (workspaces.results[i].teams) {
      totalTeam = workspaces.results[i].teams.length;
    }
    let totalSubtask = 0;
    let totalDoneTask = 0;
    let totalTrackerPercentage = 0;
    let workspaceProgress = 0;
    let done_percentage = 0;
    let totalRed = 0;
    let totalGreen = 0;
    let totalYellow = 0;
    let workSpaceColor = "Yellow";
    for (let j = 0; j < workspaces.results[i].trackers.length; j++) {
      totalSubtask = await trackerService.calculateTotalSubTasks(
        workspaces.results[i].trackers[j]._id
      );

      totalDoneTask = await trackerService.calculateDoneTask(
        workspaces.results[i].trackers[j]._id
      );
      const days_left = await trackerService.calulateDaysLeft(
        workspaces.results[i].trackers[j].end_date
      );

      if (totalSubtask > 0) {
        done_percentage = (totalDoneTask / totalSubtask) * 100;
      }

      const trackerColor = await trackerService.calculateColor(
        workspaces.results[i].trackers[j]._id,
        done_percentage,
        days_left
      );

      if (trackerColor === "Red") {
        totalRed++;
      } else if (trackerColor === "Green") {
        totalGreen++;
      } else if (trackerColor === "Yellow") {
        totalYellow++;
      }

      totalTrackerPercentage = totalTrackerPercentage + done_percentage;
      if (workspaces.results[i].trackers) {
        workspaceProgress =
          totalTrackerPercentage / workspaces.results[i].trackers.length;
      }
    }

    if (workspaceProgress === 100 && totalRed === 0 && totalYellow === 0) {
      workSpaceColor = "Green";
    } else if (totalRed > 0) {
      workSpaceColor === "Red";
    } else if (totalRed === 0 && totalYellow > 0 && workspaceProgress < 100) {
      workSpaceColor = "Yellow";
    }

    workspaces.results[i].status_bar = {
      totalTeam,
      totalTracker,
      workspaceProgress,
      workSpaceColor,
      totalMember,
    };
  }

  return workspaces;
};

/**
 * Get workspace by id
 * @param {ObjectId} id
 * @param {string} token
 * @returns {Promise<Workspace>}
 */
const getWorkspaceById = async (id, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // if User is a memeber or creator of the workspace
  const filter = { _id: id };
  filter.$or = [
    { members: { $elemMatch: { id: user.id } } },
    { created_by: user.id },
  ];
  const workSpace = await Workspace.findOne(filter);
  return workSpace;
};

/**
 * Get workspace by name
 * @param {string} name
 * @returns {Promise<Workspace>}
 */
const getWorkspaceByName = async (name) => {
  return Workspace.findOne({ name });
};

/**
 * Update workspace by id
 * @param {ObjectId} workspaceId
 * @param {Object} updateBody
 * @param {string} token
 * @returns {Promise<Workspace>}
 */
const updateWorkspaceById = async (workspaceId, updateBody, token) => {
  const workspace = await getWorkspaceById(workspaceId, token);
  if (!workspace) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (workspace.created_by != user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
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

  if (updateBody.teams) {
    for (let i = 0; i < updateBody.teams.length; i++) {
      const teamDetails = await teamService.getTeamById(updateBody.teams[i].id);
      if (!teamDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
      }
      updateBody.teams[i] = teamDetails;
    }
  }

  if (updateBody.trackers) {
    for (let i = 0; i < updateBody.trackers.length; i++) {
      const trackerDetails = await trackerService.getTrackerById(
        updateBody.trackers[i].id
      );
      if (!trackerDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tracker Not Found");
      }
      updateBody.trackers[i] = trackerDetails;
    }
  }

  Object.assign(workspace, updateBody);
  await workspace.save();
  return workspace;
};

/**
 * Delete workspace by id
 * @param {ObjectId} workspaceId
 * @param {string} token
 * @returns {Promise<Workspace>}
 */
const deleteWorkspaceById = async (workspaceId, token) => {
  const workspace = await getWorkspaceById(workspaceId, token);
  if (!workspace) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  await workspace.remove();
  return workspace;
};

module.exports = {
  createWorkspace,
  queryWorkspaces,
  getWorkspaceById,
  getWorkspaceByName,
  updateWorkspaceById,
  deleteWorkspaceById,
};
