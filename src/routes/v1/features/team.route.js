const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const teamValidation = require("../../../validations/feature/team.validation");
const teamController = require("../../../controllers/features/team.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageTeams"),
    validate(teamValidation.createTeam),
    teamController.createTeam
  )
  .get(
    auth("getTeams"),
    validate(teamValidation.getTeams),
    teamController.getTeams
  );

router
  .route("/:teamId")
  .get(
    auth("getTeams"),
    validate(teamValidation.getTeam),
    teamController.getTeam
  )
  .patch(
    auth("manageTeams"),
    validate(teamValidation.updateTeam),
    teamController.updateTeam
  )
  .delete(
    auth("manageTeams"),
    validate(teamValidation.deleteTeam),
    teamController.deleteTeam
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management and retrieval
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a Team
 *     description: Only admins can create other Teams.
 *     tags: [Teams]
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
 *               status:
 *                  type: string
 *                  enum: [active, inactive]
 *             example:
 *               name:  Team 1
 *               workspace: {}
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all Teams
 *     description: Only admins can retrieve all Teams.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Team name
 *       - in: query
 *         name: workspace_id
 *         schema:
 *           type: string
 *         description: Team workspace id
 *       - in: query
 *         name: member_id
 *         schema:
 *           type: string
 *         description: Team member id
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Team status
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
 *         description: Maximum number of Teams
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
 *                     $ref: '#/components/schemas/Team'
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
 * /teams/{id}:
 *   get:
 *     summary: Get a Team
 *     description: Logged in users can fetch only their own Team information. Only admins can fetch other Teams.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a Team
 *     description: Logged in Team admins the Team information they have rights to.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             example:
 *               name: Team 002
 *               description: new trello Team/task . . .
 *               members: []
 *               status: active
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a Team
 *     description: Logged in Team admins can delete other Teams.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
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
