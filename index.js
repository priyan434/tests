const express = require("express");
const mongoose = require('mongoose');
const genAuthToken = require("./genAuthToken");
const User = require("./models/UserModel");

const bcrypt = require('bcrypt');
const cors = require('cors');
const { auth } = require("./middlewares/auth");
const Joi = require('joi');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    
   
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
});



// mongodb+srv://priyanr494:<password>@cluster0.2kvjaeb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// Create a MongoClient with a MongoClientOptions object to set the Stable API version




const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API for managing tasks',
      contact: {
        name: 'Developer',
      },
      servers: [{
        url: 'http://localhost:5000',
      }],
    },
    components: {
      securitySchemes: {
        xAuthToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
          description: 'Custom header for JWT',
        },
      },
    },
    security: [{
      xAuthToken: [],
    }],
  },
  apis: ['index.js'], 
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const taskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    due_date: Joi.date().iso()
});

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
app.post('/api/register', async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        const token = genAuthToken(user);
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
app.post('/api/login', async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

        const token = genAuthToken(user);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Add a new task
 *     tags: [Tasks]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
app.post('/api/tasks', auth, async (req, res) => {
    try {
        const { error } = taskSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { title, description, status, priority, due_date } = req.body;
        const user = await User.findById(req.user);
        if (!user) return res.status(400).json({ error: 'User not found' });

        const newTask = {
            title,
            description,
            status: status || 'pending',
            priority: priority || 'medium',
            due_date: due_date ? new Date(due_date) : null,
        };

        user.tasks.push(newTask);
        await user.save();
        res.status(201).json({ message: 'Task added successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, in-progress, completed]
 *                   priority:
 *                     type: string
 *                     enum: [low, medium, high]
 *                   due_date:
 *                     type: string
 *                     format: date
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/api/tasks', auth, async (req, res) => {
  try {
      const user = await User.findById(req.user);
      if (!user) return res.status(400).json({ error: 'User not found' });

      res.status(200).json(user.tasks);
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
app.get('/api/tasks/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const task = user.tasks.id(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
app.put('/api/tasks/:id', auth, async (req, res) => {
    try {
        const { error } = taskSchema.validate(req.body, { allowUnknown: true });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const task = user.tasks.id(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const { title, description, status, priority, due_date } = req.body;

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (due_date) task.due_date = new Date(due_date);

        await user.save();
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
app.delete('/api/tasks/:id',auth, async (req, res) => {
  try {
   const taskId=req.params.id
    const updatedUser = await User.findOneAndUpdate(
      { _id:req.user  },
      { $pull: { tasks: { _id:taskId } } },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User or task not found' });
    }

    
    await updatedUser.save();

    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
module.exports = app;
// http://localhost:5000/api-docs