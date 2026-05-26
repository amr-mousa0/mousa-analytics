export default function handler(req, res) {
  const client_id = process.env.OAUTH_CLIENT_ID;
  if (!client_id) {
    return res.status(500).json({ error: "OAUTH_CLIENT_ID environment variable is missing on Vercel" });
  }

  // Generate a random state string to protect against CSRF
  const state = Math.random().toString(36).substring(2, 15);
  
  // Redirect user to GitHub's OAuth login page requesting repository access
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&state=${state}`;
  res.redirect(githubAuthUrl);
}
