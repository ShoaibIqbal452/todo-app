// swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
const __dirname = path.resolve();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Tasks & Projects API",
    version: "1.0.0",
    description: "A simple API for managing tasks and projects.",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development server",
    },
  ],
  components: {
    schemas: {
      Task: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The auto-generated id of the task",
          },
          name: {
            type: "string",
            description: "The name of the task",
          },
          description: {
            type: "string",
            description: "The description of the task",
          },
          status: {
            type: "string",
            description: "The status of the task",
          },
          startDate: {
            type: "string",
            format: "date-time",
            description: "The start date of the task",
          },
          dueDate: {
            type: "string",
            format: "date-time",
            description: "The due date of the task",
          },
          doneDate: {
            type: "string",
            format: "date-time",
            description: "The done date of the task",
          },
        },
        required: ["name", "status"],
      },
      Project: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The auto-generated id of the project",
          },
          name: {
            type: "string",
            description: "The name of the project",
          },
          description: {
            type: "string",
            description: "The description of the project",
          },
          startDate: {
            type: "string",
            format: "date-time",
            description: "The start date of the project",
          },
          dueDate: {
            type: "string",
            format: "date-time",
            description: "The due date of the project",
          },
        },
        required: ["name"],
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "src", "routes", "*.js")], // Ensure this path is correct
};
const specs = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
}

export default swaggerDocs;
