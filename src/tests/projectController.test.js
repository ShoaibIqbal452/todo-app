import { ObjectId } from 'mongodb';
import {jest} from '@jest/globals'
import {
  createProject,
  listProjects,
  editProject,
  deleteProject,
  assignTaskToProject,
  filterTasksByProjectName,
  sortProjectsByDate
} from '../controllers/projectsController.js';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createTask } from '../controllers/tasksController.js';

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
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
});

describe('createProject', () => {
  it('should create a project', async () => {
    const req = { body: { name: 'New Project' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await createProject(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Project' }));
  });
});

describe('listProjects', () => {
  it('should list all projects', async () => {
    const projects = [
      { name: 'Project 1' },
      { name: 'Project 2' }
    ];
    await db.collection('projects').insertMany(projects);

    const req = { app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await listProjects(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Project 1' }),
      expect.objectContaining({ name: 'Project 2' })
    ]));
  });
});

describe('editProject', () => {
  it('should edit a project', async () => {
    const project = { name: 'Project to Edit' };
    const result = await db.collection('projects').insertOne(project);
    const req = { params: { id: result.insertedId.toHexString() }, body: { name: 'Updated Project' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await editProject(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Project' }));
  });

  it('should return 404 if project not found', async () => {
    const req = { params: { id: new ObjectId().toHexString() }, body: { name: 'Updated Project' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await editProject(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Project not found' });
  });
});

describe('deleteProject', () => {
  it('should delete a project', async () => {
    const project = { name: 'Project to Delete' };
    const result = await db.collection('projects').insertOne(project);
    const req = { params: { id: result.insertedId.toHexString() }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await deleteProject(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ message: 'Project Deleted' });
  });

  it('should return 404 if project not found', async () => {
    const req = { params: { id: new ObjectId().toHexString() }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await deleteProject(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Project not found' });
  });
});

describe('assignTaskToProject', () => {
  it('should assign a task to a project', async () => {
    const project = { name: 'Test Project' };
    const task = { name: 'Test Task' };

    const projectResult = await db.collection('projects').insertOne(project);
    const taskResult = await db.collection('tasks').insertOne(task);

    const req = { params: { projectId: projectResult.insertedId.toHexString(), taskId: taskResult.insertedId.toHexString() }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await assignTaskToProject(req, res, next);

    const updatedProject = await db.collection('projects').findOne({ _id: projectResult.insertedId });
    const updatedTask = await db.collection('tasks').findOne({ _id: taskResult.insertedId });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Task assigned to project' });
    expect(updatedTask.projectId).toEqual(projectResult.insertedId);
  });

  it('should remove task from previous project when assigned to a new project', async () => {
    const project1 = { name: 'Project 1' };
    const project2 = { name: 'Project 2' };
    const task = { name: 'Task to Move', projectId: new ObjectId() };

    const project1Result = await db.collection('projects').insertOne(project1);
    const project2Result = await db.collection('projects').insertOne(project2);
    const taskResult = await db.collection('tasks').insertOne({ ...task, projectId: project1Result.insertedId });

    const req = { params: { projectId: project2Result.insertedId.toHexString(), taskId: taskResult.insertedId.toHexString() }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await assignTaskToProject(req, res, next);

    const updatedTask = await db.collection('tasks').findOne({ _id: taskResult.insertedId });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Task assigned to project' });
    expect(updatedTask.projectId).toEqual(project2Result.insertedId);
  });
});

describe('filterTasksByProjectName', () => {
    it('should filter tasks by project name', async () => {
      // Create a project
      const projectReq = { body: { name: 'Project 1' }, app: { locals: { db } } };
      const projectRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await createProject(projectReq, projectRes, jest.fn());
  
      // Create tasks
      const task1Req = { body: { name: 'Task 1', status: 'to-do' }, app: { locals: { db } } };
      const task1Res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await createTask(task1Req, task1Res, jest.fn());
  
      // Retrieve project and tasks
      const projectId = (await db.collection('projects').findOne({ name: 'Project 1' }))._id;
      const task1Id = (await db.collection('tasks').findOne({ name: 'Task 1' }))._id;
  
      // Assign tasks to the project
      await assignTaskToProject({ params: { projectId, taskId: task1Id }, app: { locals: { db } } }, { status: jest.fn().mockReturnThis(), json: jest.fn() }, jest.fn());
  
      // Filter tasks by project name
      const filterReq = { query: { projectName: 'Project 1' }, app: { locals: { db } } };
      const filterRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await filterTasksByProjectName(filterReq, filterRes, jest.fn());
  
      expect(filterRes.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'Task 1' }),
      ]));
    });
  });
  

describe('sortProjectsByDate', () => {
  it('should sort projects by start date', async () => {
    const projects = [
      { name: 'Project 1', startDate: new Date('2023-01-01') },
      { name: 'Project 2', startDate: new Date('2023-01-02') }
    ];
    await db.collection('projects').insertMany(projects);

    const req = { query: { sortBy: 'startDate' }, app: { locals: { db } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await sortProjectsByDate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Project 1' }),
      expect.objectContaining({ name: 'Project 2' })
    ]);
  });
});
