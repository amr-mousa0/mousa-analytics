export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return res.status(500).json({ error: "OAuth configuration (OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET) is missing on Vercel" });
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send(`OAuth Error: ${data.error_description || data.error}`);
    }

    const token = data.access_token;
    
    // Script to pass the retrieved GitHub access token back to the opening editor window
    const script = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Authorizing...</title>
      </head>
      <body>
        <p>Authorizing with GitHub... Please wait.</p>
        <script>
          (function() {
            const token = "${token}";
            const payload = JSON.stringify({ token, provider: 'github' });
            
            try {
              const opener = window.opener;
              if (opener) {
                opener.postMessage("authorizing:github", "*");
                opener.postMessage("authorization:github:success:" + payload, "*");
                window.close();
              } else {
                document.body.innerHTML = "<h3>Authentication Succeeded</h3><p>No opener window found. You can close this window now.</p>";
              }
            } catch (err) {
              document.body.innerHTML = "<h3>Communication Error</h3><p>" + err.message + "</p>";
            }
          })()
        </script>
      </body>
      </html>
    `;
    
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(script);
  } catch (error) {
    res.status(500).send(`Server/Network Error: ${error.message}`);
  }
}
