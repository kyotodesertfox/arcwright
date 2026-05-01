const axios = require('axios');

exports.handler = async (event) => {
    const { code } = event.queryStringParameters;

    // Use your Netlify Env Vars for these
    const owner = process.env.VITE_REPO_OWNER;
    const repo = process.env.VITE_REPO_NAME;

    try {
        // 1. Swap code for access token
        const res = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.VITE_GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { Accept: 'application/json' } });

        const token = res.data.access_token;

        // 2. Get the current user's login name
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const username = userRes.data.login;

        // 3. THE COLLABORATOR CHECK
        // This endpoint returns 204 if they are a collaborator, 404 if not.
        try {
            await axios.get(`https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If we reach here, they ARE a collaborator (204 response)
            return {
                statusCode: 200,
                body: JSON.stringify({ token })
            };
        } catch (collabErr) {
            // If they are NOT a collaborator, GitHub returns a 404
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Access Denied: You are not a collaborator on this project." })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Authentication failed." })
        };
    }
};
