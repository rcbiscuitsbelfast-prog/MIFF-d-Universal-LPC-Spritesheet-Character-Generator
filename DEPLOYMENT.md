# Deployment Guide

## Overview

This is a **static HTML/JavaScript application** that can be deployed to various platforms. The site requires no server-side processing - it's pure client-side JavaScript.

## Files for Deployment

The following files have been added to support deployment:

- `package.json` - Node.js package configuration (minimal, for deployment platforms)
- `server.js` - Simple static file server (used by Heroku/Koyeb)
- `Procfile` - Tells Heroku how to start the server
- `static.json` - Configuration for static hosting
- `app.json` - Heroku app configuration
- `.buildpacks` - Specifies Node.js buildpack
- `.slugignore` - Files to exclude from deployment (reduces slug size)

## Deployment Options

### Option 1: Heroku (Recommended)

```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Push to Heroku
git push heroku main

# Open the app
heroku open
```

### Option 2: Koyeb

Koyeb will automatically detect the Node.js app via `package.json` and use the `Procfile`.

1. Connect your Git repository to Koyeb
2. Koyeb will detect Node.js automatically
3. Deploy!

### Option 3: Netlify (Static Hosting)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

For Netlify, you can also:
1. Connect your Git repository
2. Set build command: `npm run generate` (optional, already done)
3. Set publish directory: `.` (root)

### Option 4: Vercel (Static Hosting)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 5: GitHub Pages (Easiest for Static Sites)

Already configured! Just push to your repository:
```bash
git push origin main
```

Access at: `https://[username].github.io/[repo-name]/`

### Option 6: Any Static Host

Simply upload these files to your web server:
- `index.html`
- `sources/` folder
- `spritesheets/` folder
- `sheet_definitions/` folder

That's it! No build process needed.

## Local Development

### Run Locally with Node.js Server

```bash
# Install dependencies (there are none, but this generates index.html)
npm install

# Start the server
npm start
```

Then open http://localhost:8080

### Run Locally with Python

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open http://localhost:8080

### Run Locally - Just Open the File

You can also just open `index.html` directly in your browser, though some browsers may have CORS restrictions.

## Build Process

The site uses a simple Node.js script to generate `index.html` from `sources/source_index.html`:

```bash
npm run generate
```

This has already been run, so `index.html` is up to date. The `package.json` includes this as a `postinstall` step, so it will run automatically during deployment.

## Environment Variables

None required! This is a pure static site.

## Troubleshooting

### Build Fails with "No buildpack groups passed detection"

**Solution:** The files added above (`package.json`, `Procfile`, etc.) fix this issue. Make sure they're committed:

```bash
git add package.json server.js Procfile static.json app.json .buildpacks
git commit -m "Add deployment configuration"
git push
```

### Site Loads But Images Don't Show

**Issue:** MIME types or CORS
**Solution:** The `server.js` includes proper MIME types. If using another server, ensure:
- `.png` files are served as `image/png`
- `.js` files are served as `application/javascript`
- `.css` files are served as `text/css`

### Export Features Don't Work

**Issue:** Browser security restrictions
**Solution:** The site must be served via HTTP/HTTPS (not `file://`). Use any of the deployment methods above or run a local server.

## Performance Notes

- The site includes **99,256 PNG files** in the `spritesheets/` directory
- Total size is relatively large (~several hundred MB)
- Consider using a CDN for faster global access
- The `.slugignore` file reduces deployment size by excluding documentation

## Support

For issues:
1. Check this guide first
2. Check the main README.md
3. Open an issue on GitHub

## Credits

See CREDITS.csv for full attribution of all LPC artwork.
