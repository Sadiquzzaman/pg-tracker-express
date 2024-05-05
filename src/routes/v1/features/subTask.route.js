const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const subTaskValidation = require("../../../validations/feature/subTask.validation");
const subTaskController = require("../../../controllers/features/subTask.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageSubTask"),
    validate(subTaskValidation.createSubTask),
    subTaskController.createSubTask
  )
  .patch(
    auth("manageSubTask"),
    validate(subTaskValidation.updateSubTask),
    subTaskController.updateSubTask
  )
  .get(
    auth("getSubTask"),
    validate(subTaskValidation.getSubTasks),
    subTaskController.getSubTasks
  );

router
  .route("/:subTaskId")
  .get(
    auth("getSubTask"),
    validate(subTaskValidation.getSubTask),
    subTaskController.getSubTask
  )
  .delete(
    auth("manageSubTask"),
    validate(subTaskValidation.deleteSubTask),
    subTaskController.deleteSubTask
  );

module.exports = router;
