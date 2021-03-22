const swaggerJsdoc = require('swagger-jsdoc');
const j2s = require('joi-to-swagger');

const defaultOptions = {
    title: 'API swagger',
    version: 'v1',
    description: 'Auto generated api swagger',
    basePath: '/api',
    schemes: ['https']
};

const parseValidation = {
    body: (item) => {
        return [{
            in: item.type,
            required: true,
            name: item.type,
            schema: j2s(item.parameter).swagger
        }];
    },
    query: (item) => {
        const { properties, required } = j2s(item.parameter).swagger;
        return Object.keys(properties).map(propertyKey => {
            return {
                name: propertyKey,
                in: item.type,
                required: required && required.includes(propertyKey),
                type: properties[propertyKey].type
            };
        });
    },
    params: (item) => {
        const { properties, required } = j2s(item.parameter).swagger;
        return Object.keys(properties).map(propertyKey => {
            return {
                name: propertyKey,
                in: 'path',
                required: required && required.includes(propertyKey),
                type: properties[propertyKey].type
            };
        });
    },
    headers: (item) => {
        const { properties, required } = j2s(item.parameter).swagger;
        return Object.keys(properties).map(propertyKey => {
            return {
                name: propertyKey,
                in: 'header',
                required: required && required.includes(propertyKey),
                type: properties[propertyKey].type
            };
        });
    }
};

const parseParameters = arrParameters => {
    let parameters = [];

    arrParameters.forEach(item => {
        parameters = parameters.concat(parseValidation[item.type](item));
    });

    return parameters;
};

const generateSwagger = (routes, options = defaultOptions) => {
    try {
        const {
            title = defaultOptions.title,
            version = defaultOptions.version,
            description = defaultOptions.description,
            basePath = defaultOptions.basePath,
            schemes = defaultOptions.schemes
        } = options;
        const paths = {};

        routes.forEach(route => {
            let { method, path, description = '', validation, tags = [] } = route;
            const { body, headers, params, query } = validation;
            const arrParameters = [
                { type: 'body', parameter: body },
                { type: 'headers', parameter: headers },
                { type: 'params', parameter: params },
                { type: 'query', parameter: query }
            ].filter(item => item.parameter !== undefined);

            if (path.includes(':')) {
                const params = path.match(/:[-a-zA-Z0-9@:%._+~#=]+/g)
                params.forEach(param => {
                    path = path.replace(param, `{${param.replace(':', '')}}`);
                });
            }

            if (!Array.isArray(tags)) {
                tags = []
            }

            paths[path] = paths[path] || {};
            paths[path][method] = {
                consumes: ['application/json'],
                produces: ['application/json'],
                description,
                tags,
                parameters: parseParameters(arrParameters),
                responses: {}
            };
        });

        const swaggerDoc = {
            swaggerDefinition: {
                info: {
                    title, version, description
                },
                basePath,
                schemes,
                paths
            },
            apis: []
        };

        return swaggerJsdoc(swaggerDoc);
    } catch (error) {
        console.warn(error);
        const { title, version, description, basePath, schemes } = defaultOptions;
        return swaggerJsdoc({
            swaggerDefinition: {
                info: {
                    title, version, description
                },
                basePath,
                schemes
            },
            apis: []
        });
    }
};

module.exports = { generateSwagger }