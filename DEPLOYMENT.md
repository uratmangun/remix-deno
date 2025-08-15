# Deployment Guide

This guide explains how to set up automated deployment for your Remix + Deno Deploy application using GitHub Actions.

## 🚀 Overview

The deployment workflow automatically deploys your application to two platforms:

1. **Cloudflare Pages** - Hosts the Remix frontend (static SPA)
2. **Deno Deploy** - Hosts the serverless functions (dynamic API endpoints)

## 📋 Prerequisites

Before setting up deployment, you'll need accounts on:

- [GitHub](https://github.com) (for repository and Actions)
- [Cloudflare](https://cloudflare.com) (for Pages hosting)
- [Deno Deploy](https://dash.deno.com) (for serverless functions)

## ⚙️ Setup Instructions

### 1. Cloudflare Pages Setup

1. **Get your Cloudflare Account ID:**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Copy your Account ID from the right sidebar

2. **Create a Cloudflare API Token:**
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Custom token" with these permissions:
     - **Account**: `Cloudflare Pages:Edit`
     - **Zone**: `Zone Settings:Read`, `Zone:Read` (if using custom domain)
   - Copy the generated token

### 2. Deno Deploy Setup

1. **Create a Deno Deploy project:**
   - Go to [Deno Deploy Dashboard](https://dash.deno.com/projects)
   - Click "New Project"
   - Choose "Empty Project"
   - Set project name (e.g., `my-remix-functions`)
   - Note the project name for later

2. **Generate Access Token:**
   - Go to [Account Settings](https://dash.deno.com/account#access-tokens)
   - Click "New Access Token"
   - Give it a descriptive name
   - Copy the generated token

### 3. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | `abc123def456ghi789jkl012mno345pqr678` |
| `DENO_DEPLOY_TOKEN` | Deno Deploy Access Token | `ddp_1234567890abcdef` |
| `DENO_DEPLOY_PROJECT` | Your Deno Deploy project name | `my-remix-functions` |
| `ADMIN_TOKEN` | GitHub Personal Access Token | `ghp_1234567890abcdef` |

### 4. GitHub Personal Access Token

Create a GitHub Personal Access Token for repository management:

1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Select these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. Copy the generated token and add it as `ADMIN_TOKEN` secret

## 🔄 Deployment Workflow

### Automatic Deployment

The deployment happens automatically when you:

- Push to `main` or `master` branch
- Modify files in `app/`, `functions/`, or configuration files
- Manually trigger via GitHub Actions tab

### Manual Deployment

To trigger deployment manually:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select "Deploy to Cloudflare Pages and Deno Deploy"
4. Click **Run workflow**

## 📊 Deployment Process

The workflow performs these steps:

### Cloudflare Pages Deployment
1. ✅ Checkout code
2. ✅ Setup Node.js and pnpm
3. ✅ Install dependencies
4. ✅ Build Remix SPA
5. ✅ Create/update Cloudflare Pages project
6. ✅ Deploy to Cloudflare Pages
7. ✅ Update repository homepage URL

### Deno Deploy Deployment
1. ✅ Setup Deno runtime
2. ✅ Type-check all functions
3. ✅ Test function router
4. ✅ Deploy to Deno Deploy
5. ✅ Create deployment status

## 🌐 Access Your Deployed Application

After successful deployment:

- **Frontend**: Available at your Cloudflare Pages URL (e.g., `https://remix-deno.pages.dev`)
- **Functions**: Available at your Deno Deploy URL (e.g., `https://my-remix-functions.deno.dev`)

### Function Endpoints

Your Deno functions will be available at:

- `https://your-project.deno.dev/` - Function index (lists all available functions)
- `https://your-project.deno.dev/hello` - Hello function
- `https://your-project.deno.dev/time` - Time function  
- `https://your-project.deno.dev/api` - API function

## 🔧 Troubleshooting

### Common Issues

**Cloudflare deployment fails:**
- Verify `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are correct
- Check API token permissions include `Cloudflare Pages:Edit`

**Deno Deploy fails:**
- Verify `DENO_DEPLOY_TOKEN` and `DENO_DEPLOY_PROJECT` are correct
- Ensure project name matches exactly (case-sensitive)
- Check that functions pass type checking

**GitHub integration fails:**
- Verify `ADMIN_TOKEN` has correct permissions
- Check token hasn't expired

### Logs and Debugging

View deployment logs:
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Expand job steps to see detailed logs

## 🔄 Adding New Functions

To add new serverless functions:

1. Create a new `.ts` file in the `functions/` directory
2. Export a default handler function
3. Commit and push - the function will be automatically deployed!

Example:
```typescript
// functions/weather.ts
export default function handler(req: Request): Response {
  return new Response(JSON.stringify({
    message: "Weather function",
    temperature: "22°C"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

The function will be available at: `https://your-project.deno.dev/weather`

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
