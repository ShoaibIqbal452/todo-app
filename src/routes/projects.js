import express from "express";
import * as projectController from "../controllers/projectsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Manage projects
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post("/", projectController.createProject);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", projectController.listProjects);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Edit a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.patch("/:id", projectController.editProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to delete
 *     responses:
 *       204:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.delete("/:id", projectController.deleteProject);

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}:
 *   patch:
 *     summary: Assign a task to a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     responses:
 *       200:
 *         description: Task assigned to project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task or project not found
 */
router.patch(
  "/:projectId/tasks/:taskId",
  projectController.assignTaskToProject,
);

/**
 * @swagger
 * /projects/filter:
 *   get:
 *     summary: Filter tasks by project name
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: projectName
 *         required: true
 *         schema:
 *           type: string
 *         description: The project name to filter by
 *     responses:
 *       200:
 *         description: A list of tasks for the filtered projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Project name query parameter is required
 */
router.get("/filter", projectController.filterTasksByProjectName);

/**
 * @swagger
 * /projects/sort:
 *   get:
 *     summary: Sort projects by date
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         required: true
 *         schema:
 *           type: string
 *           enum: [startDate, dueDate]
 *         description: The date field to sort by
 *     responses:
 *       200:
 *         description: A list of sorted projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid sort field
 */
router.get("/sort", projectController.sortProjectsByDate);

export default router;
