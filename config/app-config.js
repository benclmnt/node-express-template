const mountPath = process.env.MOUNT_PATH || '';
module.exports = {
  port: process.env.PORT || 3010,
  mountPath,
  gevmeAPIUrl: process.env.GEVME_API_URL || 'https://dev.gev.me/apiv2/api',
  gevmeHostname: process.env.GEVME_HOSTNAME || 'https://dev.gev.me',
  clientId: process.env.GEVME_API_CLIENT_ID || 'a-1-AsE0JNfKG7nl',
  clientSecret:
    process.env.GEVME_API_CLIENT_SECRET ||
    '6NEQQdvX4B0PdVyivbbgQKJNUmG5YAENIlkjqVrU',
  cacheTTL: process.env.CACHE_TTL || 5, // in mins
};
