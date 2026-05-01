const axios = require('axios');

exports.handler = async (event) => {
    const { code } = event.queryStringParameters;

    try {

        const res = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.VITE_GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: { Accept: 'application/json' }
        });

        if (res.data.error) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: res.data.error_description })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ token: res.data.access_token })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Authentication handshake failed" })
        };
    }
};
