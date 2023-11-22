const _ = require('lodash');
const express = require('express');

const router = express.Router();
const routerVersion1 = require('./v1/router-v1');

router.use(
    '/v1.[0-9]+.[0-9]+',
    (req, res, next) => {
        const apiUrls = _.split(_.get(req, 'baseUrl', null), '/');
        _.set(req, 'urlVersion', _.get(apiUrls, '[2]', null));
        next();
    },
    routerVersion1
);

module.exports = router;
