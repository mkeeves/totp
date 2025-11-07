# TOTP Token Generator

A single-page static web application for generating Time-based One-Time Password (TOTP) tokens. Styled consistently with the mkeeves.com design system and ready for deployment on Cloudflare Pages or GitHub Pages.

## Features

- **Real-time TOTP Generation**: Automatically generates and updates TOTP tokens
- **Configurable Options**: 
  - 6 or 8 digit tokens
  - 30 or 60 second token periods
- **Secret Key Persistence**: Remembers the last entered secret key using localStorage
- **Dark Mode Support**: Toggle between light and dark themes
- **Security**: 
  - Subresource Integrity (SRI) hashes for CDN resources
  - Automated security scanning via GitHub Actions
  - Automated dependency update monitoring

## Security Practices

### Subresource Integrity (SRI)
The application uses SRI hashes to ensure the integrity of the CDN-loaded TOTP library. The hash is verified against the script tag in `index.html`.

### Automated Security Testing
- **GitHub Actions Workflow** (`.github/workflows/security.yml`): Runs `npm audit` on push and weekly to check for vulnerabilities
- **Dependabot** (`.github/dependabot.yml`): Automatically monitors and updates npm dependencies

### Dependency Update Monitoring
- **Update Check Workflow** (`.github/workflows/update-check.yml`): Weekly checks for new versions of `@otplib/preset-browser` and creates GitHub issues when updates are available

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/mkeeves/totp.git
   cd totp
   ```

2. Install dependencies (for version tracking):
   ```bash
   npm install
   ```

3. Open `index.html` in a web browser or use a local server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

4. Navigate to `http://localhost:8000` (or the port your server uses)

## Deployment

### Cloudflare Pages (Recommended)

#### Option A: Direct Upload via Wrangler CLI

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a Pages project in Cloudflare Dashboard:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → Create a project
   - Name it `totp` (or any name you prefer)
   - Don't connect a Git repository - we'll deploy manually

4. Deploy from local directory:
   ```bash
   wrangler pages deploy . --project-name=totp
   ```

5. For custom domain (`totp.mkeeves.com`):
   - In Cloudflare Pages project settings → Custom domains
   - Add `totp.mkeeves.com`
   - Update DNS in Cloudflare:
     - Type: `CNAME`
     - Name: `totp`
     - Target: Your Cloudflare Pages domain (shown in project settings)
     - Proxy status: Proxied (orange cloud)

#### Option B: Git Integration (if GitHub app works later)

1. Push the code to your GitHub repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → Create a project
3. Connect your GitHub repository (`mkeeves/totp`)
4. Configure build settings:
   - **Framework preset**: None (or Static HTML)
   - **Build command**: (leave empty - no build needed)
   - **Build output directory**: `/` (root)
   - **Root directory**: `/` (root)
5. Click "Save and Deploy"

### GitHub Pages (Alternative)

1. Push the code to your GitHub repository
2. Go to repository Settings → Pages
3. Select the `master` branch as the source
4. The site will be available at `https://<username>.github.io/totp/`
5. For custom domain (`totp.mkeeves.com`):
   - The `CNAME` file is already configured
   - Add a CNAME DNS record pointing `totp.mkeeves.com` to `<username>.github.io`
   - GitHub Pages will automatically detect and configure the custom domain

## Updating Dependencies

### Updating the CDN Library Version

When a new version of `@otplib/preset-browser` is available:

1. Check the GitHub issue created by the update-check workflow (if available)
2. Update the version in `index.html`:
   ```html
   <script src="https://unpkg.com/@otplib/preset-browser@VERSION/index.js" ...>
   ```
3. Calculate the new SRI hash:
   ```bash
   curl -s https://unpkg.com/@otplib/preset-browser@VERSION/index.js | openssl dgst -sha384 -binary | openssl base64 -A
   ```
4. Update the `integrity` attribute in `index.html`:
   ```html
   integrity="sha384-<NEW_HASH>"
   ```
5. Update the version in `package.json`:
   ```bash
   npm install --save-dev @otplib/preset-browser@VERSION
   ```
6. Test the application to ensure compatibility
7. Commit and push the changes

## Technology Stack

- **TOTP Library**: [@otplib/preset-browser](https://github.com/yeojz/otplib) v12.0.1
  - Requires `buffer.js` and `index.js` scripts (both loaded from CDN)
- **CDN**: unpkg.com
- **No Build Step**: Pure HTML, CSS, and JavaScript

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage API
- CSS custom properties (for dark mode)

## License

MIT

