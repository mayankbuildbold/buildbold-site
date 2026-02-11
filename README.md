# BOLD Website

Modern portfolio website with horizontal scrolling and Bauhaus design.

## 🌐 Live Site

Your site is deployed at: [Check Vercel Dashboard](https://vercel.com/dashboard)

## 📁 Project Structure

```
buildbold-site/
├── index.html              ← Homepage (horizontal scroll)
├── projects.html           ← Projects page (grid layout)
├── projects.json           ← ⭐ Edit this to update content!
├── load-projects.js        ← Loads projects automatically
├── Projects/               ← Upload project images here
│   └── Pacework Crew/
│       ├── 01.png
│       ├── 02.png
│       └── ...
├── logo.png
├── Favicon.png
├── Face.png
└── fonts/
    └── (font files)
```

## 📝 How to Update Projects

### Edit Project Content:
1. Click `projects.json`
2. Click pencil icon (Edit)
3. Change project details
4. Commit changes → Auto-deploys in 30 seconds!

### Add New Project:
1. Upload images to `Projects/YourProjectName/`
2. Edit `projects.json` and add:
```json
{
  "id": 7,
  "title": "Your Project Name",
  "category": "Branding",
  "description": "Short description",
  "client": "Client Name",
  "year": "2026",
  "location": "India",
  "scope": "What you did",
  "fullDescription": [
    "Paragraph 1",
    "Paragraph 2",
    "Paragraph 3"
  ],
  "mainImage": "/Projects/YourProjectName/01.png",
  "galleryImages": [
    "/Projects/YourProjectName/02.png",
    "/Projects/YourProjectName/03.png"
  ]
}
```
3. Commit → Done!

## 🎨 Categories

Use these exact category names for correct colors:
- `Branding` → Red accent
- `Design System` → Yellow accent
- `Architecture` → Blue accent
- `Execution` → Blue accent

## 🚀 Deployment

This site auto-deploys via Vercel:
- Push to GitHub → Auto-deploys
- Changes live in ~30 seconds
- No manual steps needed

## 💰 Cost

- Hosting: **$0** (Vercel free tier)
- SSL: **$0** (included)
- Bandwidth: **Unlimited**
- Custom domain: **$10-15/year** (optional)

## 📧 Contact

Email: info@buildbold.in
Website: buildbold.in

---

Built with ❤️ by BOLD
