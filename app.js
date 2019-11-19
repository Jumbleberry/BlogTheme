// core/server/web/api/canary/members/app.js
const debug = require('ghost-ignition').debug('web:canary:members:app');
const express = require('express');
const cors = require('cors');
const membersService = require('../../../../services/members');
const urlUtils = require('../../../../lib/url-utils');
const labs = require('../../../shared/middlewares/labs');
const shared = require('../../../shared');
const models = require('../../../../models');

module.exports = function setupMembersApiApp() {
    debug('Members API canary setup start');
    const apiApp = express();

    // Entire app is behind labs flag
    apiApp.use(labs.members);

    // Support CORS for requests from the frontend
    const siteUrl = new URL(urlUtils.getSiteUrl());
    apiApp.use(cors(siteUrl.origin));

    // NOTE: this is wrapped in a function to ensure we always go via the getter
    apiApp.post('/send-magic-link', function(req, res, next) {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', () => {
          body = JSON.parse(body);
          models.Member.add({
            email: body.email,
            name: null,
            note: null
          });
      });

      res.send('Created.');
    });
    apiApp.post('/create-stripe-checkout-session', (req, res, next) => membersService.api.middleware.createCheckoutSession(req, res, next));

    // API error handling
    apiApp.use(shared.middlewares.errorHandler.resourceNotFound);
    apiApp.use(shared.middlewares.errorHandler.handleJSONResponseV2);

    debug('Members API canary setup end');

    return apiApp;
};