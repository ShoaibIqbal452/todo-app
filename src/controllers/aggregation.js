import { ObjectId } from 'mongodb';

/**
 * Get all projects that have a task with a due date set to today
 */
export const getProjectsWithTasksDueToday = async (db) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

  return await db.collection('projects').aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: 'tasks',
        foreignField: '_id',
        as: 'taskDetails'
      }
    },
    {
      $match: {
        'taskDetails.dueDate': { $gte: today, $lt: tomorrow }
      }
    }
  ]).toArray();
};

/**
 * Get all tasks that have a project with a due date set to today
 */
export const getTasksWithProjectsDueToday = async (db) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

  return await db.collection('tasks').aggregate([
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'projectDetails'
      }
    },
    {
      $match: {
        'projectDetails.dueDate': { $gte: today, $lt: tomorrow }
      }
    }
  ]).toArray();
};
