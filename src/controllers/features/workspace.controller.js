const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { workspaceService, tokenService } = require("../../services");

const createWorkspace = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const workspace = await workspaceService.createWorkspace(req.body, token);
  res.status(httpStatus.CREATED).send(workspace);
});

const getWorkspaces = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const filter = pick(req.query, ["name", "type", "status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await workspaceService.queryWorkspaces(filter, options, token);
  res.send(result);
});

const getWorkspace = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const workspace = await workspaceService.getWorkspaceById(
    req.params.workspaceId,
    token
  );
  if (!workspace) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }
  res.send(workspace);
});

const updateWorkspace = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const workspace = await workspaceService.updateWorkspaceById(
    req.params.workspaceId,
    req.body,
    token
  );
  res.send(workspace);
});

const deleteWorkspace = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  await workspaceService.deleteWorkspaceById(req.params.workspaceId, token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
