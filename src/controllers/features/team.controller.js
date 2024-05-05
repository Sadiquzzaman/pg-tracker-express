const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const {
  teamService,
  tokenService,
  wrokspaceService,
} = require("../../services");

const createTeam = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const team = await teamService.createTeam(req.body, token);

  const workspaceDetails = await wrokspaceService.getWorkspaceById(
    req.body.workspace.id,
    token
  );
  if (!workspaceDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  let availableTeams = [];
  if (workspaceDetails.teams) {
    for (let i = 0; i < workspaceDetails.teams.length; i++) {
      availableTeams.push({ id: workspaceDetails.teams[i]._id });
    }
  }

  team.workspace = {
    id: workspaceDetails.id,
    name: workspaceDetails.name,
    type: workspaceDetails.type,
    status: workspaceDetails.status,
  };
  availableTeams.push({
    id: team._id,
  });
  const workspaceBody = {
    name: team.workspace.name,
    type: team.workspace.type,
    status: team.workspace.status,
    teams: availableTeams,
  };

  wrokspaceService.updateWorkspaceById(team.workspace.id, workspaceBody, token);
  res.status(httpStatus.CREATED).send(team);
});

const getTeams = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "name",
    "workspace_id",
    "member_id",
    "status",
    "isEmailVerified",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await teamService.queryTeams(filter, options);
  res.send(result);
});

const getTeam = catchAsync(async (req, res) => {
  const team = await teamService.getTeamById(req.params.teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
  }
  res.send(team);
});

const updateTeam = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const team = await teamService.updateTeamById(
    req.params.teamId,
    req.body,
    token
  );

  const workspaceDetails = await wrokspaceService.getWorkspaceById(
    team.workspace.id,
    token
  );
  if (!workspaceDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  let availableTeams = [];
  if (workspaceDetails.teams) {
    for (let i = 0; i < workspaceDetails.teams.length; i++) {
      availableTeams.push({ id: workspaceDetails.teams[i]._id });
    }
  }

  let workspaceBody = {};
  workspaceBody.teams = availableTeams;

  wrokspaceService.updateWorkspaceById(team.workspace.id, workspaceBody, token);
  res.send(team);
});

const deleteTeam = catchAsync(async (req, res) => {
  await teamService.deleteTeamById(req.params.teamId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
};
