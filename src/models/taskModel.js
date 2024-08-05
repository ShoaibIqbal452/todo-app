// models/taskModel.js
import { ObjectId } from "mongodb";

export const taskSchema = {
  name: String,
  description: String,
  status: String,
  startDate: Date,
  dueDate: Date,
  doneDate: Date,
  projectId: ObjectId,
};
