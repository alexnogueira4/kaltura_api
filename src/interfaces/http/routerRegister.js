const { Router } = require('express');
const ValidatorMiddleware = require('src/interfaces/http/middlewares/ValidatorMiddleware');
const videosController = require('src/interfaces/http/presentation/videos/VideosController')

module.exports = {

    register: routes => {
        const router = Router();

        routes.forEach(route => {
            const { method, path, validation, handler } = route;
            const validate = ValidatorMiddleware.validate(validation);
            router[method](path, validate, handler);
        });

        return router;
    }

}