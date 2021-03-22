const kaltura = require('kaltura-client');
const config = new kaltura.Configuration();
const client = new kaltura.Client(config);
const { SECRET, KALTURA_SESSION_TYPE, KALTURA_EXPIRY, KALTURA_PRIVILEGES } = process.env

const UPLOAD_OPTIONS = {
    resume: false,
    finalChunk: true,
    resumeAt: -1,
}

config.serviceUrl = 'https://www.kaltura.com';

class KalturaClient {
    constructor({ kaltura_user_id, kaltura_partner_id }) {
        this.kaltura_user_id = kaltura_user_id
        this.kaltura_partner_id = kaltura_partner_id
    }

    async start() {
        return new Promise((resolve, reject) => {
            kaltura.services.session.start(
                SECRET,
                this.kaltura_user_id,
                KALTURA_SESSION_TYPE,
                this.kaltura_partner_id,
                KALTURA_EXPIRY,
                KALTURA_PRIVILEGES
            ).completion((success, ks) => {
                if (!success) reject(ks);
                client.setKs(ks);
                resolve()
            }).execute(client)
        })
    }

    async addToken() {
        return new Promise((resolve, reject) => {
            let uploadToken = new kaltura.objects.UploadToken();

            kaltura.services.uploadToken.add(uploadToken)
                .execute(client)
                .then(result => resolve(result.id))
                .catch(error => reject(error))
        })
    }

    async getById({ video_id } = {}) {
        return new Promise(async (resolve, reject) => {

            let { MediaEntryOrderBy } = kaltura.enums;
            let filter = new kaltura.objects.MediaEntryFilter({
                idEqual: video_id
            });

            let pager = new kaltura.objects.FilterPager();

            kaltura.services.media.listAction(filter, pager)
                .execute(client)
                .then(results => {
                    if (!results.objects.length) reject({ status_code: 'NOT_FOUND', details: 'Video not found' })

                    let serializedSearchResults = this.serializeSearchResults(results)
                    resolve(serializedSearchResults.results[0])
                }).catch(error => reject(error));
        });
    }

    async getAllVideos({ order, search, limit, page } = {}) {
        return new Promise(async (resolve, reject) => {

            let { MediaEntryOrderBy } = kaltura.enums;
            let filter = new kaltura.objects.MediaEntryFilter({
                freeText: search || null,
                order: !(order) || MediaEntryOrderBy[order]
            });

            let pager = new kaltura.objects.FilterPager({
                pageSize: limit,
                pageIndex: !(page && limit) || page
            });

            kaltura.services.media.listAction(filter, pager)
                .execute(client)
                .then(results => {
                    let serializedSearchResults = this.serializeSearchResults(results)
                    resolve(serializedSearchResults)
                }).catch(error => reject(error));
        });
    }

    async uploadVideo({ files }) {
        return new Promise(async (resolve, reject) => {
            const serializedUploadResults = [],
                errors = []

            files = Array.isArray(files) ? files : [files];

            await Promise.all(files.map(async currentFile => {
                const uploadTokenId = await this.addToken()
                await kaltura.services.uploadToken
                    .upload(uploadTokenId, currentFile.path, UPLOAD_OPTIONS.resume, UPLOAD_OPTIONS.finalChunk, UPLOAD_OPTIONS.resumeAt)
                    .execute(client)
                    .then(async uploadResult =>
                        serializedUploadResults.push(await this.createMediaAndAttachVideo({ uploadResult, file: currentFile }))
                    )
                    .catch(error => errors.push({ ...error, file: currentFile.name }));
            }))

            if (serializedUploadResults.length) resolve({ files: serializedUploadResults, errors })

            reject(errors)
        })
    }

    async createMediaAndAttachVideo({ uploadResult, file }) {
        return new Promise(async (resolve, reject) => {
            try {
                let media = await this.createMediaEntry(file)
                let attachedFilesToMedia = await this.attachFilesToMedia({ media, file: uploadResult });
                uploadResult = this.serializeResults(uploadResult)
                uploadResult.file = this.serializeAttachedFiles(attachedFilesToMedia)

                resolve(uploadResult)
            } catch (error) {
                reject(error)
            }
        })
    }

    async createMediaEntry(file) {
        return new Promise(async (resolve, reject) => {
            let entry = new kaltura.objects.MediaEntry({
                mediaType: kaltura.enums.MediaType.VIDEO,
                name: file.name,
                description: file.type
            });

            kaltura.services.media.add(entry)
                .execute(client)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    async attachFilesToMedia({ file, media }) {
        return new Promise(async (resolve, reject) => {
            let resource = new kaltura.objects.UploadedFileTokenResource();
            resource.token = file.id;

            kaltura.services.media.addContent(media.id, resource)
                .execute(client)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    async deleteMedia({ video_id }) {
        return new Promise(async (resolve, reject) => {

            kaltura.services.media.deleteAction(video_id)
                .execute(client)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

    serializeAttachedFiles({ id, name, description, status, downloadUrl, searchText, thumbnailUrl }) {
        return ({ id, name, description, status, downloadUrl, searchText, thumbnailUrl })
    }

    serializeResults({ id, fileName, uploadedFileSize, createdAt, updatedAt, status }) {
        return ({ id, fileName, uploadedFileSize, createdAt, updatedAt, status })
    }

    serializeSearchResults({ objects, totalCount }) {
        const results = objects.map(({
            dataUrl, width, height, msDuration, id, name, description, status,
            createdAt, updatedAt, downloadUrl, searchText, thumbnailUrl
        }) => ({
            dataUrl, width, height, msDuration, id, name, description, status,
            createdAt, updatedAt, downloadUrl, searchText, thumbnailUrl
        }))

        return ({
            results,
            total: totalCount
        })
    }
}

module.exports = KalturaClient