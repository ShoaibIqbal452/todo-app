# To-Do List API

## Overview

This application provides a simple API for managing tasks and projects. It allows you to create, edit, delete, and manage tasks and projects. It also supports filtering tasks by status and project, and sorting tasks by date.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing tasks and projects.
- **Swagger**: API documentation tool.
- **Docker**: Containerization platform for running the application.
- **Docker Compose**: Tool for defining and running multi-container Docker applications.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. **Clone the Repository**

   Open a terminal and clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo

2. **Build and Run the Containers**

   Use Docker Compose to build and start the application:
   `docker-compose up --build`

   This command performs the following actions:

   - Builds the Node.js application image using the Dockerfile.
   - Pulls the latest MongoDB image from Docker Hub.
   - Starts both the Node.js application and MongoDB containers.

3. **Access the Application**

   The Node.js application will be accessible at http://localhost:3000.
   MongoDB will be running on port 27017.

4. **API Documentation**

   Swagger UI for API documentation is available at http://localhost:3000/api-docs.


### Development

For development purposes, the `docker-compose.yml` file is set to mount the project directory:

```
volumes:
  - .:/usr/src/app
  - /usr/src/app/node_modules
```

This setup allows you to make changes to your files locally and have them reflected in the Docker container without restarting the container.

### Running Tests

Unit testing for controllers is implemented using Jest and live in tests directory of src folder. To run the cd in the root folder and run `jest` and it will run all the test suites.


### Stopping the Containers

To stop and remove the containers, run: `docker-compose down`.

### Production Deployment

For deploying this application in a production environment, consider the following:

   - Optimize Dockerfile: Use a multi-stage Docker build to reduce the image size.
   - Environment Variables: Configure environment variables and secrets.
   - Monitoring and Logging: Set up monitoring and logging for the application.


### Troubleshooting

   - Application Not Starting: Check the logs of the container with docker-compose logs app.
   - Database Connection Issues: Ensure MongoDB is running and accessible at mongodb://mongo:27017/todoList.
