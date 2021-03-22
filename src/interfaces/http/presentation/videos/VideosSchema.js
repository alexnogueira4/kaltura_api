const joi = require('joi');
const REGEX_TO_AVOID_SPECIAL_CHARACTERS = require('src/common/RegexSpecialChars');
const Enum = require('src/common/Enum');
const kaltura = require('kaltura-client');
const MediaEntryOrderBy = kaltura.enums.MediaEntryOrderBy;

module.exports = ({

    create: joi.object().keys({
        files: joi.any().required(),
    }),

    update: joi.object().keys({
        files: joi.any().required(),
    }),

    query: joi.object().keys({
        search: joi.string().regex(REGEX_TO_AVOID_SPECIAL_CHARACTERS).allow(''),
        order: joi.string().valid(...Enum(MediaEntryOrderBy).keys()).allow(''),
        limit: joi.number().integer().min(1).allow('').options({ convert: true }),
        page: joi.number().integer().min(1).allow('').options({ convert: true }),
    }),

    params: joi.object().keys({
        video_id: joi.string().required()
    }),

    headers: joi.object().keys({
        kaltura_user_id: joi.string().required(),
        kaltura_partner_id: joi.string().required(),
    }).options({
        allowUnknown: true
    })

});
