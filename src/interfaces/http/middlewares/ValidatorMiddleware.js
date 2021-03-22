const formidable = require('formidable');

module.exports = {

    validate: (validation, stripUnknown = false) => async (req, res, next) => {
        try {
            const schemaOptions = { abortEarly: false, convert: false, allowUnknown: false, stripUnknown };


            await Promise.all(Object.keys(validation).map(async validationKey => {
                let valueToValidate = req[validationKey];

                if (validationKey !== 'headers' && req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                    const form = formidable({ multiples: true });
                    valueToValidate = await new Promise((resolve, reject) => {
                        form.parse(req, async (err, fields, { files }) => {
                            if (err) reject(err)
                            resolve({ files })
                        })
                    })
                }
                
                const { error, value } = validation[validationKey].validate(valueToValidate, schemaOptions);

                if (error) throw error;

                req[validationKey] = value;
            }));

            return next();

        } catch (error) {
            next(error);
        }
    }
}
