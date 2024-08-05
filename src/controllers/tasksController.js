import { ObjectId } from 'mongodb';

/**
 * Create a new task
 */
export const createTask = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const newTask = req.body;

    const result = await db.collection('tasks').insertOne(newTask);

    const createdTask = await db.collection('tasks').findOne({ _id: result.insertedId });
    res.status(201).json(createdTask);
  } catch (error) {
    next(error);
  }
};

/**
 * List all tasks
 */
export const listTasks = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const tasks = await db.collection('tasks').find().toArray();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit a task
 */
export const editTask = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const taskId = new ObjectId(req.params.id);
    const updateData = req.body;

    const result = await db.collection('tasks').updateOne(
      { _id: taskId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await db.collection('tasks').findOne({ _id: taskId });
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const taskId = new ObjectId(req.params.id);

    const result = await db.collection('tasks').deleteOne({ _id: taskId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).json({message: "Task Deleted"});
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a task as to-do or done
 */
/**
 * Mark a task as to-do, started, or done
 */
export const markTaskStatus = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const taskId = new ObjectId(req.params.id);
    const { status } = req.body;

    const task = await db.collection('tasks').findOne({ _id: taskId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    let updateData = { status };

    if (status === 'to-do') {
      // Reset start and done dates if marking as to-do
      updateData = {
        ...updateData,
        startDate: null,
        doneDate: null
      };
    } else if (status === 'started') {
      // Only allow marking as started if currently to-do
      if (task.status !== 'to-do') {
        return res.status(400).json({ error: 'Task can only be marked as started if it is currently to-do' });
      }
      updateData = {
        ...updateData,
        startDate: new Date(),
        doneDate: null
      };
    } else if (status === 'done') {
      // Only allow marking as done if currently started
      if (task.status !== 'started') {
        return res.status(400).json({ error: 'Task can only be marked as done if it is currently started' });
      }
      updateData = {
        ...updateData,
        doneDate: new Date()
      };
    } else {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.collection('tasks').updateOne(
      { _id: taskId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await db.collection('tasks').findOne({ _id: taskId });
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};


/**
 * Filter tasks by status
 */
export const filterTasksByStatus = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.query;

    const tasks = await db.collection('tasks').find({ status }).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Search tasks by name using regex
 */
export const searchTasksByName = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { name } = req.query;

    const tasks = await db.collection('tasks').find({ name: new RegExp(name, 'i') }).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Sort tasks by dates
 */
export const sortTasksByDates = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { sortBy } = req.query;

    const sortFields = {
      'startDate': 'startDate',
      'dueDate': 'dueDate',
      'doneDate': 'doneDate'
    };

    if (!sortFields[sortBy]) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }

    const tasks = await db.collection('tasks').find().sort({ [sortFields[sortBy]]: 1 }).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};
