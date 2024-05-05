const express = require("express");
const authRoute = require("./auth/auth.route");
const userRoute = require("./user/user.route");
const docsRoute = require("./config/docs.route");
const workspaceRoute = require("./features/workspace.route");
const memberRoute = require("./user/member.route");
const invitationRoute = require("./features/invitation.route");
const trackerRoute = require("./features/tracker.route");
const teamRoute = require("./features/team.route");
const commentRoute = require("./features/comment.route");
const milestoneRoute = require("./features/milestone.route");
const roleManagement = require("./auth/roleManagement.route");
const subTask = require("./features/subTask.route");
const config = require("../../config/config");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/workspaces",
    route: workspaceRoute,
  },
  {
    path: "/invitations",
    route: invitationRoute,
  },
  {
    path: "/members",
    route: memberRoute,
  },
  {
    path: "/trackers",
    route: trackerRoute,
  },
  {
    path: "/teams",
    route: teamRoute,
  },
  {
    path: "/comments",
    route: commentRoute,
  },
  {
    path: "/milestones",
    route: milestoneRoute,
  },
  {
    path: "/roleManagements",
    route: roleManagement,
  },
  {
    path: "/subTask",
    route: subTask,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
