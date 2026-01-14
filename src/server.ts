import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { AuthModule } from './index';
import { logger } from './utils/logger';
import { errorHandler } from './errors/error-handler';
import { NotFoundError } from './errors/custom-errors';

import passport from 'passport';
import './config/passport';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3018;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// NoSQL injection prevention
// NoSQL injection prevention
app.use((req, res, next) => {
    const sanitizeOptions = { replaceWith: '_' };

    // Sanitize body
    if (req.body) {
        if (mongoSanitize.has(req.body)) {
            logger.warn(`Potential NoSQL injection attempt detected in body: ${req.path}`);
        }
        req.body = mongoSanitize.sanitize(req.body, sanitizeOptions);
    }

    // Sanitize params
    if (req.params) {
        if (mongoSanitize.has(req.params)) {
            logger.warn(`Potential NoSQL injection attempt detected in params: ${req.path}`);
        }
        req.params = mongoSanitize.sanitize(req.params, sanitizeOptions);
    }

    // Sanitize query
    if (req.query) {
        if (mongoSanitize.has(req.query)) {
            logger.warn(`Potential NoSQL injection attempt detected in query: ${req.path}`);
        }
        // Clone query to ensure it's a plain object and avoid getter issues
        const queryClone = { ...req.query };
        const sanitizedQuery = mongoSanitize.sanitize(queryClone, sanitizeOptions);

        // In Express 5, req.query is a getter, so we must mutate the object
        if (sanitizedQuery) {
            for (const key in req.query) {
                delete req.query[key];
            }
            Object.assign(req.query, sanitizedQuery);
        }
    }

    next();
});

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(passport.initialize());

const authConfig = {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
        accessTTL: process.env.JWT_ACCESS_TTL || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        refreshTTLms: parseInt(process.env.JWT_REFRESH_TTL_MS || '604800000')
    },
    sessionSecret: process.env.SESSION_SECRET || 'session-secret'
};

const authModule = AuthModule.init(authConfig);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

app.use('/api', authModule.router);

app.use((req, res, next) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

const start = async () => {
    try {
        // MongoDB connection options
        await mongoose.connect(authConfig.mongoUri, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info('💾 Database connected successfully');

        const server = app.listen(port, () => {
            logger.info(`🚀 Application is running on http://localhost:${port}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.REQUEST_LOG === 'true') {
                logger.info('📝 Request Logging is enabled');
            }
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await mongoose.connection.close();
                    logger.info('MongoDB connection closed');
                    process.exit(0);
                } catch (error) {
                    logger.error(`Error during shutdown: ${error}`);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error(`Error starting server: ${error}`);
        process.exit(1);
    }
};

start();
