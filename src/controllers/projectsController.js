import { ObjectId } from 'mongodb';

/**
 * Create a new project
 */
export const createProject = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const newProject = {
      ...req.body,
      tasks: [] // Initialize an empty array for tasks
    };

    const result = await db.collection('projects').insertOne(newProject);
    const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });
    res.status(201).json(createdProject);
  } catch (error) {
    next(error);
  }
};

/**
 * List all projects
 */
export const listProjects = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const projects = await db.collection('projects').find().toArray();
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit a project
 */
export const editProject = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const projectId = new ObjectId(req.params.id);
    const updateData = req.body;

    const result = await db.collection('projects').updateOne(
      { _id: projectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await db.collection('projects').findOne({ _id: projectId });
    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const projectId = new ObjectId(req.params.id);

    const result = await db.collection('projects').deleteOne({ _id: projectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(204).json({message: "Project Deleted"});
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a task to a project, removing it from any previous project.
 */
export const assignTaskToProject = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { projectId, taskId } = req.params;

    const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });

    if (!project || !task) {
      return res.status(404).json({ error: 'Project or task not found' });
    }

    // Remove task from any previous projects
    await db.collection('projects').updateMany(
      { tasks: new ObjectId(taskId) },
      { $pull: { tasks: new ObjectId(taskId) } }
    );

    // Add task to the new project
    await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      { $addToSet: { tasks: new ObjectId(taskId) } }
    );

    // Update task with the new project ID
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { projectId: new ObjectId(projectId) } }
    );

    res.status(200).json({ message: 'Task assigned to project' });
  } catch (error) {
    next(error);
  }
};

/**
 * Filter tasks by project name
 */
export const filterTasksByProjectName = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { projectName } = req.query;

    
    if (!projectName) {
      return res.status(400).json({ error: 'Project name query parameter is required' });
    }

    const projects = await db.collection('projects').find({ name: new RegExp(projectName, 'i') }).toArray();
    const taskIds = projects.flatMap(project => project.tasks || []);

    if (taskIds.length === 0) {
      return res.status(200).json([]);
    }

    const tasks = await db.collection('tasks').find({ _id: { $in: taskIds.map(id => new ObjectId(id)) } }).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Sort projects by date
 */
export const sortProjectsByDate = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { sortBy } = req.query;

    const sortFields = {
      'startDate': 'startDate',
      'dueDate': 'dueDate'
    };

    if (!sortFields[sortBy]) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }

    const projects = await db.collection('projects').find().sort({ [sortFields[sortBy]]: 1 }).toArray();
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};
