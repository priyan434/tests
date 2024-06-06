

# TaskManager Backend

This is the backend for the TaskManager application, built with Node.js and Express. It provides RESTful API endpoints for managing tasks.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)


## Installation

1. Clone the repository:

    
    git clone https://github.com/priyan434/tests.git
    cd tests-main
  

2. Install dependencies:

     
    npm install
    

3. Set up environment variables:

    Create a `.env` file in the root directory and add the necessary environment variables. Refer to the [Environment Variables](#environment-variables) section for more details.
   Environment Variables

The following environment variables need to be set in the `.env` file:

- `PORT`: The port number on which the server will run (default: 5000)
- `MONGODB_URI`: The connection string for the MongoDB database
- `JWT_SECRET`: Secret key for signing JWT tokens

Example `.env` file:
   ```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secret_key
```

5. Start the server:


    nodemon index.js or node index.js
    


 Usage

After starting the server, the backend API will be accessible at `http://localhost:5000` by default. You can use tools like Postman or Curl to interact with the API endpoints.

 API Endpoints

 Authentication

- POST /auth/register
  - Description: Register a new user
  - Request Body: `{ "username": "example", "password": "example" }`

- POST /auth/login**
  - Description: Log in an existing user
  - Request Body: `{ "username": "example", "password": "example" }`

 Tasks

- GET /tasks
  - Description: Get all tasks
  - Headers: `{ "x-auth-token": "Bearer <token>" }`

- POST /tasks
  - Description: Create a new task
  - Headers: `{ "x-auth-token":  <token> }`
  - Request Body: `{ "title": "New Task", "description": "Task details" }`

- GET /tasks/:id
  - Description: Get a task by ID
  - Headers: `{ "x-auth-token": <token> }`

- PUT /tasks/:id
  - Description: Update a task by ID
  - Headers: `{ "x-auth-token":  <token> }`
  - Request Body: `{ "title": "Updated Task", "description": "Updated details" }`

- DELETE /tasks/:id
  - Description: Delete a task by ID
  - Headers: `{ "x-auth-token":  <token> }`









