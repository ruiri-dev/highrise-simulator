# Deployment Guide

Your Highrise Simulator is now ready to deploy! Follow these steps to get it running for anyone to access.

## ✅ What's Already Done

1. **Frontend deployed to Vercel**: https://highrise-simulator-oaayt37l7-ruijias-projects.vercel.app
2. **Code pushed to GitHub**: https://github.com/ruiri-dev/highrise-simulator

## 🚀 Deploy Backend to Render (Required for full functionality)

1. Go to [render.com](https://render.com) and sign up/login (it's free!)

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub account and authorize Render

4. Select the **"highrise-simulator"** repository

5. Render will automatically detect the `render.yaml` file

6. Click **"Apply"** to create the service

7. Wait for the deployment to complete (usually 2-3 minutes)

8. Copy the backend URL (it will look like: `https://highrise-backend-xxx.onrender.com`)

## 🔗 Connect Frontend to Backend

Once your backend is deployed, you need to update the frontend to use it:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)

2. Click on your **highrise-simulator** project

3. Go to **Settings** → **Environment Variables**

4. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com/api` (replace with your actual Render URL)

5. Click **Save**

6. Go to **Deployments** and click **"Redeploy"** on the latest deployment

## ✨ You're Done!

Your app will now be fully functional at:
- **Frontend**: https://highrise-simulator-oaayt37l7-ruijias-projects.vercel.app
- **Backend**: https://your-render-backend-url.onrender.com

Anyone can now access your Highrise Simulator from any computer!

## 📝 Notes

- The Render free tier may sleep after 15 minutes of inactivity. The first request might take 30-60 seconds to wake it up.
- All data is persisted in the SQLite database on Render
- To update the app, just push to GitHub and both Vercel and Render will auto-deploy

## 🐛 Troubleshooting

If the app doesn't work:
1. Check that the `VITE_API_URL` environment variable is set correctly in Vercel
2. Make sure your Render backend URL ends with `/api`
3. Check the Render logs for any errors
4. Redeploy both services after making changes
