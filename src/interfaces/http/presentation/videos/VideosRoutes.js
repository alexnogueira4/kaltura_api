const VideosSchema = require('src/interfaces/http/presentation/videos/VideosSchema')
const VideosController = require('src/interfaces/http/presentation/videos/VideosController')

module.exports = ([
    {
        method: 'get',
        path: '/videos',
        validation: {
            query: VideosSchema.query,
            headers: VideosSchema.headers,
        },
        handler: VideosController.getAll
    },
    {
        method: 'get',
        path: '/videos/:video_id',
        validation: {
            params: VideosSchema.params,
            headers: VideosSchema.headers,
        },
        handler: VideosController.get
    },
    {
        method: 'post',
        path: '/videos',
        validation: {
            body: VideosSchema.create,
            headers: VideosSchema.headers,
        },
        handler: VideosController.create,
    },
    {
        method: 'delete',
        path: '/videos/:video_id',
        validation: {
            params: VideosSchema.params,
            headers: VideosSchema.headers,
        },
        handler: VideosController.delete,
    }
]);