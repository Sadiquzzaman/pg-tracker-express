const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const trackerValidation = require("../../../validations/feature/tracker.validation");
const trackerController = require("../../../controllers/features/tracker.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageTrackers"),
    validate(trackerValidation.createTracker),
    trackerController.createTracker
  )
  .get(
    auth("getTrackres"),
    validate(trackerValidation.getTasks),
    trackerController.getTrackres
  );

router
  .route("/:trackerId")
  .get(
    auth("getTrackres"),
    validate(trackerValidation.getTracker),
    trackerController.getTracker
  )
  .patch(
    auth("manageTrackers"),
    validate(trackerValidation.updateTracker),
    trackerController.updateTracker
  )
  .delete(
    auth("manageTrackers"),
    validate(trackerValidation.deleteTracker),
    trackerController.deleteTracker
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Trackers
 *   description: Tracker management and retrieval
 */

/**
 * @swagger
 * /trackers:
 *   post:
 *     summary: Create a Tracker
 *     description: Only admins can create other Trackers.
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workspace
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               workspace:
 *                 type: object
 *               members:
 *                  type: array
 *               subtasks:
 *                  type: array
 *               comments:
 *                  type: array
 *               status:
 *                  type: string
 *                  enum: [active, inactive]
 *             example:
 *               name:  Tracker 1
 *               members: []
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tracker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all Trackers
 *     description: Only admins can retrieve all Trackers.
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tracker name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Tracker status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of Trackers
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tracker'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /trackers/{id}:
 *   get:
 *     summary: Get a Tracker
 *     description: Logged in users can fetch only their own Tracker information. Only admins can fetch other Trackers.
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracker id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tracker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a Tracker
 *     description: Logged in Tracker admins the Tracker information they have rights to.
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracker id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: array
 *               subtasks:
 *                 type: array
 *               comments:
 *                 type: array
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             example:
 *               name: Tracker 002
 *               description: new trello tracker/task . . .
 *               members: []
 *               comments: []
 *               subtasks: []
 *               status: active
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tracker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a Tracker
 *     description: Logged in Tracker admins can delete other Trackers.
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracker id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
