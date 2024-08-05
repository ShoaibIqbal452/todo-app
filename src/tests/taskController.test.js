import { ObjectId } from 'mongodb';
import {
  markTaskStatus,
  createTask,
  listTasks,
  editTask,
  deleteTask,
  filterTasksByStatus,
  searchTasksByName,
  sortTasksByDates
} from '../controllers/tasksController.js';
import {jest} from '@jest/globals'
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

let connection;
let db;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  connection = await MongoClient.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
  db = connection.db('todoList');
});

afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('tasks').deleteMany({});
});

describe('createTask', () => {
  it('should create a task', async () => {
    const req = { body: { name: 'New Task', status: 'to-do' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await createTask(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Task', status: 'to-do' }));
  });
});

describe('listTasks', () => {
  it('should list all tasks', async () => {
    const tasks = [
      { name: 'Task 1', status: 'to-do' },
      { name: 'Task 2', status: 'started' }
    ];
    await db.collection('tasks').insertMany(tasks);

    const req = { app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await listTasks(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Task 1' }),
      expect.objectContaining({ name: 'Task 2' })
    ]));
  });
});

describe('editTask', () => {
  it('should edit a task', async () => {
    const task = { name: 'Task to Edit', status: 'to-do' };
    const result = await db.collection('tasks').insertOne(task);
    const req = { params: { id: result.insertedId.toHexString() }, body: { name: 'Updated Task' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await editTask(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Task' }));
  });

  it('should return 404 if task not found', async () => {
    const req = { params: { id: new ObjectId().toHexString() }, body: { name: 'Updated Task' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await editTask(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });
});

describe('deleteTask', () => {
  it('should delete a task', async () => {
    const task = { name: 'Task to Delete', status: 'to-do' };
    const result = await db.collection('tasks').insertOne(task);
    const req = { params: { id: result.insertedId.toHexString() }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await deleteTask(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ message: 'Task Deleted' });
  });

  it('should return 404 if task not found', async () => {
    const req = { params: { id: new ObjectId().toHexString() }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await deleteTask(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });
});

describe('filterTasksByStatus', () => {
  it('should filter tasks by status', async () => {
    const tasks = [
      { name: 'Task 1', status: 'to-do' },
      { name: 'Task 2', status: 'started' }
    ];
    await db.collection('tasks').insertMany(tasks);

    const req = { query: { status: 'to-do' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await filterTasksByStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Task 1', status: 'to-do' })
    ]));
  });
});

describe('searchTasksByName', () => {
  it('should search tasks by name using regex', async () => {
    const tasks = [
      { name: 'Task One', status: 'to-do' },
      { name: 'Another Task', status: 'started' }
    ];
    await db.collection('tasks').insertMany(tasks);

    const req = { query: { name: 'Task' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await searchTasksByName(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Task One' }),
      expect.objectContaining({ name: 'Another Task' })
    ]));
  });
});

describe('sortTasksByDates', () => {
  it('should sort tasks by start date', async () => {
    const tasks = [
      { name: 'Task 1', status: 'to-do', startDate: new Date('2023-01-01') },
      { name: 'Task 2', status: 'started', startDate: new Date('2023-01-02') }
    ];
    await db.collection('tasks').insertMany(tasks);

    const req = { query: { sortBy: 'startDate' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await sortTasksByDates(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Task 1' }),
      expect.objectContaining({ name: 'Task 2' })
    ]);
  });
});
