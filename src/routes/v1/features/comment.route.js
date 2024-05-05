const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const commentValidation = require("../../../validations/feature/comment.validation");
const commentController = require("../../../controllers/features/comment.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageComments"),
    validate(commentValidation.createComment),
    commentController.createComment
  )
  .get(
    auth("getComments"),
    validate(commentValidation.getComments),
    commentController.getComments
  );

router
  .route("/:commentId")
  .get(
    auth("getComments"),
    validate(commentValidation.getComment),
    commentController.getComment
  )
  .patch(
    auth("manageComments"),
    validate(commentValidation.updateComment),
    commentController.updateComment
  )
  .delete(
    auth("manageComments"),
    validate(commentValidation.deleteComment),
    commentController.deleteComment
  );

module.exports = router;
