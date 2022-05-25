const { google } = require('googleapis');
require("dotenv").config();

const queryString = require("query-string");
const axios = require("axios");

const stringifiedParams = queryString.stringify({
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uri: process.env.GOOGLE_REDIRECT_URL,
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '), // space seperated string
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent',
});

const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;

async function getAccessTokenFromCode(code) {
  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
      grant_type: 'authorization_code',
      code,
    },
  });
  return data.access_token;
};

async function getGoogleUserInfo(access_token) {
  const { data } = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return data;
};

module.exports.googleLoginUrl = googleLoginUrl;
module.exports.getAccessTokenFromCode = getAccessTokenFromCode;
module.exports.getGoogleUserInfo = getGoogleUserInfo;