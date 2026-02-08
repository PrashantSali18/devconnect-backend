import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevConnect API Documentation',
      version: '1.0.0',
      description: 'A comprehensive developer community platform API with real-time features, OAuth authentication, and social networking capabilities.',
      contact: {
        name: 'Prashant Sali',
        email: 'prashantsali502@gmail.com',
        url: 'https://github.com/PrashantSali18'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://your-api.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65c2a1b3f4e5d6a7b8c9d0e1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            bio: { type: 'string', example: 'Full Stack Developer' },
            skills: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js'] },
            profilePicture: { type: 'string', example: 'https://res.cloudinary.com/...' },
            githubUrl: { type: 'string', example: 'https://github.com/johndoe' },
            linkedinUrl: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
            location: { type: 'string', example: 'Pune, Maharashtra' },
            followers: { type: 'array', items: { type: 'string' } },
            following: { type: 'array', items: { type: 'string' } },
            isOnline: { type: 'boolean', example: true },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            content: { type: 'string', example: 'Just deployed my first MERN app! 🚀' },
            image: { type: 'string', example: 'https://res.cloudinary.com/...' },
            codeSnippet: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'console.log("Hello World");' },
                language: { type: 'string', enum: ['javascript', 'python', 'java'], example: 'javascript' }
              }
            },
            likes: { type: 'array', items: { type: 'string' } },
            comments: { type: 'array', items: { type: 'object' } },
            tags: { type: 'array', items: { type: 'string' }, example: ['react', 'nodejs'] },
            viewCount: { type: 'number', example: 42 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recipient: { type: 'string' },
            sender: { $ref: '#/components/schemas/User' },
            type: { type: 'string', enum: ['like', 'comment', 'follow', 'mention', 'message'] },
            message: { type: 'string', example: 'John Doe liked your post' },
            isRead: { type: 'boolean', example: false },
            link: { type: 'string', example: '/posts/123' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            errors: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Not authorized, no token' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Posts', description: 'Post management endpoints' },
      { name: 'Messages', description: 'Real-time messaging endpoints' },
      { name: 'Notifications', description: 'Notification endpoints' }
    ]
  },
  apis: ['./routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;