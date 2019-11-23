//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the starter-slack bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for slack.
const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

// Import the "stock" mongodb adapter.
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Import dotenv so we can read our secrets from .env
require('dotenv').config();

// Import our mongoose based database provider.
const mongoProvider = require ('./db/mongoDb')({
    mongoUri: process.env.SLACK_MONGO,
});

// Import our OAuth helpers and routes.
const authRouter = require('./routes/oAuth');

// Import the ESIJS package.
const esiJS = require('esijs');

const adapter = new SlackAdapter({
    // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
    // enable_incomplete: true,

    // parameters used to secure webhook endpoint
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,  

    // auth token for a single-team app
    botToken: process.env.BOT_TOKEN,

    // credentials used to set up oauth for multi-team apps
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot', 'commands', 'team:read', 'users:read', 'channels:write', 'chat:write:bot'], 
    redirectUri: process.env.REDIRECT_URI,
 
    // functions required for retrieving team-specific info
    // for use in multi-team apps
    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam,
});

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());

// Use the MongoDBStorage plugin for dialog stuff & default storage.
let storage = null;
if (process.env.BOT_MONGO) {
    storage = new MongoDbStorage({
        url : process.env.BOT_MONGO,
    });
}


const controller = new Botkit({
    webhook_uri: '/slack/receive',
    adapter: adapter,
    storage
});

controller.addPluginExtension('database', mongoProvider);

if (process.env.cms_uri) {
    controller.usePlugin(new BotkitCMSHelper({
        cms_uri: process.env.cms_uri,
        token: process.env.cms_token,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');
    controller.loadModules(__dirname + '/listeners');
    authRouter(controller);
    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});

async function getTokenForTeam(teamId) {
    try {
        const teamData = await controller.plugins.database.teams.get(teamId);
        if (!teamData) {
            console.log('team not found for id: ', teamId);
        } else {
            return teamData.bot.token;
        }
    } catch (err) {
        console.log(err);
    }
}

async function getBotUserByTeam(teamId) {
    try {
        const teamData = await controller.plugins.database.teams.get(teamId);
        if (!teamData) {
            console.log('team not found for id: ', teamId);
        } else {
            return teamData.bot.user_id;
        }
    } catch (err) {
        console.log(err);
    }
}

process.on('uncaughtException', err => {
    console.log('uncaught exception encountered, exiting process', err.stack);
    process.exit(1);
});
