import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import taskRoutes from "./routes/tasks.js";
import projectRoutes from "./routes/projects.js";
import swaggerDocs from "./swagger.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const port = 3000;
const dbUrl = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "todoList";

app.use(bodyParser.json());

MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to database");
    const db = client.db(dbName);
    app.locals.db = db;
    app.use("/api/tasks", taskRoutes);
    app.use("/api/projects", projectRoutes);
    swaggerDocs(app, port);
    app.use(errorHandler);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => console.error(error));
