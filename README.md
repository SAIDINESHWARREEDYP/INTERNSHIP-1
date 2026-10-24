# InternshipHub — Frontend Internship Project

A responsive internship task and project dashboard built with **HTML5, CSS3 and vanilla JavaScript (ES6+)**. It is designed as a portfolio-ready demonstration of the frontend concepts covered in a web development internship.

> This is a personal demo project, not an official ApexPlanet product. The initial tasks are sample data and are stored in the visitor's browser.

## Features

- Responsive dashboard for desktop, tablet and mobile
- Task creation, editing, deletion and completion
- Search tasks by title, description or category
- Filter tasks by status
- Summary cards and a weekly completion chart
- Progress indicators for learning/project tracks
- Light/dark theme preference
- Persistent tasks using `localStorage`
- Daily inspiration fetched asynchronously from the DummyJSON Quotes API, with offline fallback quotes
- Accessible form labels, keyboard dismissal for the modal, status announcements and reduced-motion support
- No framework, package manager or build step required

## Tech stack

- HTML5 semantic landmarks and form controls
- CSS3 custom properties, Grid, Flexbox, responsive media queries and dark theme
- JavaScript ES6+, event delegation, array methods, DOM updates, `async`/`await`, Fetch API and error handling
- Git and GitHub Pages for version control and static hosting

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a local HTTP server (recommended for testing API requests), run one of these from the project directory:

```bash
# Python 3
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push the project files to your GitHub repository's default branch.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your default branch (usually `main`) and folder `/ (root)`, then save.
5. Wait for GitHub Pages to finish publishing. The live URL is usually:

   `https://saidineshwarreedyp.github.io/INTERNSHIP/`

   Confirm the exact URL in **Settings → Pages** after deployment. A live URL cannot be guaranteed until GitHub Pages is enabled and the deployment succeeds.

## Add this project to your existing repository

If your existing repository already contains files you need to keep, **do not replace the repository blindly**. Copy the project files into a new folder such as `web-development-dashboard/`, or merge the files after checking for name conflicts.

To push from a local clone:

```bash
git clone https://github.com/SAIDINESHWARREEDYP/INTERNSHIP.git
cd INTERNSHIP

# Copy the project files into this directory (or a subfolder).
git add .
git commit -m "Add InternshipHub frontend dashboard"
git push origin main
```

If your default branch is not `main`, use that branch name. GitHub authentication may prompt you to sign in.

## Project structure

```text
INTERNSHIP/
├── index.html       # Semantic page structure and accessible controls
├── styles.css       # Responsive visual system and themes
├── app.js           # Task state, rendering, persistence and API integration
├── README.md        # Setup, features and deployment guide
├── LICENSE          # MIT license
└── .gitignore
```

## Testing checklist

- [ ] Open `index.html` in Chrome, Firefox or Edge.
- [ ] Add a task and refresh the page; confirm it persists.
- [ ] Edit a task, change its status, then delete it.
- [ ] Search and filter tasks.
- [ ] Toggle light/dark theme and refresh.
- [ ] Resize the browser to mobile width and test the navigation.
- [ ] Disconnect the network and check the quote fallback.
- [ ] Enable GitHub Pages and verify the deployed page and browser console.

## Limitations

- Data is saved to the current browser only; there is no backend, login or cross-device sync.
- Clearing browser site data removes locally saved tasks.
- The external quote API requires internet access; a fallback quote is shown if the request fails.
- Progress numbers are based on the task categories and completion state, not a connected project-management service.

## Internship alignment

This project demonstrates semantic HTML, responsive CSS layouts, JavaScript DOM manipulation, event handling, client-side validation, asynchronous API requests, error handling and source-control/deployment workflows described in a web development internship.

## Author

**Pulluru Sai Dineshwar Reddy**  
B.Tech Computer Science and Engineering  
Mohan Babu University

Only claim features and deployment experience you have personally tested and can explain during an interview.
