const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const request = require('request');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'credentials.json';
var event = {
    'summary': "MSsfdkskfskfL",
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
        'dateTime': '2018-06-21T16:57:00+06:00',
        'timeZone': 'America/Los_Angeles',
    },
    'end': {
        'dateTime': '2018-06-21T19:00:00+06:00',
        'timeZone': 'America/Los_Angeles',
    },
    'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=1'
    ],
    'attendees': [
        { 'email': "null" }
    ],
    'reminders': {
        'useDefault': false,
        'overrides': [
            { 'method': 'email', 'minutes': 5 },
            { 'method': 'popup', 'minutes': 5 },
        ],
    },
};
module.exports = {
    run: function (json) {
        try {
            const content = fs.readFileSync('client_secret.json');
            doEvents(content, json);
        }
        catch (err) {
            return console.log('Error loading client secret file:', err);
        }
    }
};
function doEvents(content, json) {
    authorize(JSON.parse(content), function listEvents(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        console.log(json);
        event.summary = json.description;
        event.attendees[0].email = json.email[0];
        console.log(event);
        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log(JSON.parse(event.config.data).summary);
            console.log('Event created: %s', event);
        });
    });
}
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    let token = {};
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    try {
        token = fs.readFileSync(TOKEN_PATH);
    }
    catch (err) {
        return getAccessToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
}
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err)
                return callback(err);
            oAuth2Client.setCredentials(token);
            try {
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
            }
            catch (err) {
                console.error(err);
            }
            callback(oAuth2Client);
        });
    });
}
//# sourceMappingURL=main.js.map