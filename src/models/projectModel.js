import { ObjectId } from "mongodb";

export const projectSchema = {
  name: String,
  description: String,
  startDate: Date,
  dueDate: Date,
  tasks: [ObjectId]
};
