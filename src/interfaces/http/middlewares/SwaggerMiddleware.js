const SwaggerUi = require('swagger-ui-express');
const { generateSwagger } = require('src/common/GenerateSwagger');
const VideosRoutes = require('src/interfaces/http/presentation/videos/VideosRoutes')
const pjson = require('package.json');

module.exports = () => {

    const routes = VideosRoutes;

    const options = {
        title: pjson.name,
        version: pjson.version,
        description: `Swagger documentation of ${pjson.name}`,
        schemes: 'http'
    };

    const swaggerDoc = generateSwagger(routes, options);

    return [SwaggerUi.serve, SwaggerUi.setup(swaggerDoc)];
};
