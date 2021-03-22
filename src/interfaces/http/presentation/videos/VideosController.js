const KalturaClient = require('../../../../../config/kalturaClient');
const AsyncMiddleware = require('../../middlewares/AsyncMiddleware');

const { StatusCodes } = require('http-status-codes');

module.exports = {

	get: AsyncMiddleware(async ctx => {
		const { kaltura_user_id, kaltura_partner_id } = ctx.headers
		const kalturaClient = new KalturaClient({ kaltura_user_id, kaltura_partner_id });

		try {
			await kalturaClient.start()
			let response = await kalturaClient.getById(ctx.params)
			ctx.res.status(StatusCodes.OK).json(response)
		} catch (error) {
			ctx.next({ details: error })
		}

	}),

	create: AsyncMiddleware(async ctx => {
		const { kaltura_user_id, kaltura_partner_id } = ctx.headers
		const kalturaClient = new KalturaClient({ kaltura_user_id, kaltura_partner_id });
		const { files } = ctx.body

		try {
			await kalturaClient.start()
			let uploadedFiles = await kalturaClient.uploadVideo({ files })

			ctx.res.status(StatusCodes.OK).json({
				status_code: StatusCodes.OK,
				message: "Video uploaded successfully",
				files: uploadedFiles.files,
				errors: uploadedFiles.errors
			});
		} catch (error) {
			ctx.next({ details: error })
		}
	}),

	getAll: AsyncMiddleware(async ctx => {

		const { kaltura_user_id, kaltura_partner_id } = ctx.headers
		const kalturaClient = new KalturaClient({ kaltura_user_id, kaltura_partner_id });

		try {
			await kalturaClient.start()
			let response = await kalturaClient.getAllVideos(ctx.query)

			ctx.res.status(StatusCodes.OK).json({
				status_code: StatusCodes.OK,
				...response
			})
		} catch (error) {
			ctx.next({ details: error })
		}
	}),

	delete: AsyncMiddleware(async ctx => {
		const { kaltura_user_id, kaltura_partner_id } = ctx.headers
		const kalturaClient = new KalturaClient({ kaltura_user_id, kaltura_partner_id });

		try {
			await kalturaClient.start()
			await kalturaClient.deleteMedia(ctx.params)

			ctx.res.status(StatusCodes.OK).json({
				status_code: StatusCodes.OK,
				result: "Media deleted successfully"
			})
		} catch (error) {
			ctx.next({ details: error })
		}
	}),
}
