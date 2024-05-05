const httpStatus = require("http-status");
const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const { Team } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");

/**
 * Create a team
 * @param {Object} teamBody
 * @returns {Promise<Member>}
 */
const createTeam = async (teamBody, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  teamBody.members = [];
  const userEmails = teamBody.emails.split(",");
  for (i = 0; i < userEmails.length; i++) {
    const userDetails = await userService.getUserByEmail(userEmails[i]);
    if (!userDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    teamBody.members.push({ id: userDetails._id });
  }
  for (let i = 0; i < teamBody.members.length; i++) {
    const memberDetails = await userService.getUserById(teamBody.members[i].id);
    if (!memberDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "Member not found");
    }
    teamBody.members[i].name = memberDetails.name;
    teamBody.members[i].designation = memberDetails.designation;
    teamBody.members[i].email = memberDetails.email;
    teamBody.members[i].role = "view";
    teamBody.members[i].isEmailVerified = memberDetails.isEmailVerified;
    teamBody.members[i].status = memberDetails.status;
  }

  teamBody.created_by = user.id;
  return Team.create(teamBody);
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
const queryTeams = async (filter, options) => {
  if (filter.member_id) {
    const memberId = filter.member_id;
    const memberDetails = await userService.getUserById(memberId);
    delete filter.member_id;
    filter.members = { $elemMatch: { id: memberDetails._id } };
  }
  if (filter.workspace_id) {
    const workspaceId = filter.workspace_id;
    delete filter.workspace_id;
    filter["workspace.id"] = workspaceId;
  }
  if (filter.name) {
    filter.name = { $regex: filter.name, $options: "i" };
  }
  const team = await Team.paginate(filter, options);
  return team;
};

/**
 * Get team by id
 * @param {ObjectId} id
 * @returns {Promise<Team>}
 */
const getTeamById = async (id) => {
  return Team.findById(id);
};

/**
 * Get team by name
 * @param {string} name
 * @returns {Promise<Team>}
 */
const getTeamByName = async (name) => {
  return Team.findOne({ name });
};

/**
 * Update team by id
 * @param {ObjectId} teamId
 * @param {Object} updateBody
 * @returns {Promise<Team>}
 */
const updateTeamById = async (teamId, updateBody, token) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (team.created_by != user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }
  let availableMembers = [];
  for (let i = 0; i < team.members.length; i++) {
    availableMembers.push({ id: team.members[i].id });
  }

  if (updateBody.members) {
    if (updateBody.action === "add") {
      for (let i = 0; i < updateBody.members.length; i++) {
        availableMembers.push({ id: updateBody.members[i].id });
      }
    }

    if (updateBody.action === "delete") {
      for (let i = 0; i < updateBody.members.length; i++) {
        availableMembers = availableMembers.filter(
          (member) =>
            member.id.toString() !== updateBody.members[i].id.toString()
        );
      }
    }
  }

  updateBody.members = availableMembers;
  if (availableMembers.length > 0) {
    for (let i = 0; i < availableMembers.length; i++) {
      const memberDetails = await userService.getUserById(
        availableMembers[i].id
      );
      updateBody.members[i].name = memberDetails.name;
      updateBody.members[i].designation = memberDetails.designation;
      updateBody.members[i].email = memberDetails.email;
      updateBody.members[i].role = memberDetails.role;
      updateBody.members[i].isEmailVerified = memberDetails.isEmailVerified;
      updateBody.members[i].status = memberDetails.status;
    }
  }

  Object.assign(team, updateBody);
  await team.save();
  return team;
};

/**
 * Delete team by id
 * @param {ObjectId} teamId
 * @returns {Promise<Team>}
 */
const deleteTeamById = async (teamId) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
  }
  await team.remove();
  return team;
};

module.exports = {
  createTeam,
  queryTeams,
  getTeamById,
  getTeamByName,
  updateTeamById,
  deleteTeamById,
};
