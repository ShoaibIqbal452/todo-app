import express from "express";
import * as taskController from "../controllers/tasksController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Manage tasks
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.post("/", taskController.createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get("/", taskController.listTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Edit a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.patch("/:id", taskController.editTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to delete
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete("/:id", taskController.deleteTask);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Mark a task as done, started or to-do 
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [to-do, started, done]
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Task not found
 */
router.patch("/:id/status", taskController.markTaskStatus);

/**
 * @swagger
 * /tasks/filter:
 *   get:
 *     summary: Filter tasks by status
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [to-do, done, started]
 *         description: The status to filter by
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid status
 */
router.get("/filter", taskController.filterTasksByStatus);

/**
 * @swagger
 * /tasks/search:
 *   get:
 *     summary: Search tasks by name
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name to search for
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Name query parameter is required
 */
router.get("/search", taskController.searchTasksByName);

/**
 * @swagger
 * /tasks/sort:
 *   get:
 *     summary: Sort tasks by date
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         required: true
 *         schema:
 *           type: string
 *           enum: [startDate, dueDate, doneDate]
 *         description: The date field to sort by
 *     responses:
 *       200:
 *         description: A list of sorted tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid sort field
 */
router.get("/sort", taskController.sortTasksByDates);

export default router;
