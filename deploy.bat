@echo off
echo 🚀 WhatsApp Gmail Bot - Deployment Helper
echo.

echo Step 1: Initialize Git Repository
git init
if %errorlevel% neq 0 (
    echo Git already initialized
)

echo.
echo Step 2: Add all files to Git
git add .

echo.
echo Step 3: Commit files
git commit -m "Deploy WhatsApp Gmail Bot to Render"

echo.
echo Step 4: Set up remote (you need to create GitHub repo first)
echo Please create a GitHub repository named 'whatsapp-gmail-bot'
echo Then run these commands:
echo.
echo git branch -M main
echo git remote add origin https://github.com/YOUR_USERNAME/whatsapp-gmail-bot.git
echo git push -u origin main
echo.

echo 📋 Next Steps:
echo 1. Create GitHub repository: whatsapp-gmail-bot
echo 2. Run the git commands shown above
echo 3. Go to render.com and deploy from GitHub
echo 4. Follow DEPLOYMENT.md for complete instructions
echo.

pause