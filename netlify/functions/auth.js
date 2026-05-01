const axios = require('axios');

exports.handler = async (event) => {
    const { code } = event.queryStringParameters;

    // These come from your Netlify Env Variables (Not the frontend!)
    const client_id = process.env.VITE_GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    try {
        const res = await axios.post('https://github.com/login/oauth/access_token', {
            client_id,
            client_secret,
            code
        }, {
            headers: { Accept: 'application/json' }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ token: res.data.access_token })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
