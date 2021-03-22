const express = require('express');
const { Router } = express;
const cors = require('cors');
const helmet = require('helmet');
const methodOverride = require('method-override');
const VideosRoutes = require('src/interfaces/http/presentation/videos/VideosRoutes')
const routerRegister = require('src/interfaces/http/routerRegister')
const httpErrorMiddleware = require('src/interfaces/http/middlewares/HttpErrorMiddleware')
const swaggerMiddleware = require('src/interfaces/http/middlewares/SwaggerMiddleware')

module.exports = () => {
    const router = Router();

    router
        .use(express.json())
        .use(express.urlencoded({ extended: false }))
        .use(helmet())
        .use(methodOverride('X-HTTP-Method-Override'))
        .use(cors())
        .use('/api-docs', swaggerMiddleware())
        .use('/api', routerRegister.register(VideosRoutes))
        .use(httpErrorMiddleware);

    return router;
};