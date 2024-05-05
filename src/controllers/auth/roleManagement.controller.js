const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { roleManagementService, tokenService } = require("../../services");

const createRoleManagement = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const roleManagement = await roleManagementService.createRoleManagement(
    req.body,
    token
  );
  res.status(httpStatus.CREATED).send(roleManagement);
});

const getRoleManagements = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const filter = pick(req.query, ["user", "workspace_id", "tracker_id"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await roleManagementService.queryRoleManagement(
    filter,
    options,
    token
  );
  res.send(result);
});

const getRoleManagement = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token Not Found");
  }
  const roleManagement = await roleManagementService.getRoleManagementByUserId(
    req.params.userId
  );
  if (!roleManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role Management not found");
  }
  res.send(roleManagement);
});

const updateRoleManagement = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const roleManagement =
    await roleManagementService.updateRoleManagementByUserId(
      req.params.userId,
      req.body,
      token
    );
  res.send(roleManagement);
});

const deleteRoleManagement = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  await roleManagementService.deleteRoleManagementByUserId(
    req.params.userId,
    token
  );
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRoleManagement,
  getRoleManagements,
  getRoleManagement,
  updateRoleManagement,
  deleteRoleManagement,
};
