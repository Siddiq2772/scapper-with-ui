# SIH 2025 Problem Statement Explorer

This project is a static web application that scrapes, stores, and interactively displays problem statements from the **Smart India Hackathon (SIH)** website. It uses a Puppeteer scraper to generate a JavaScript dataset and a pure vanilla JS frontend for easy exploration.

🔗 **Live Demo:** [https://siddiq2772.github.io/scapper-with-ui/](https://siddiq2772.github.io/scapper-with-ui/)

## 🚀 Features

-   **Automated Scraper**: Extracts detailed data including Problem ID, Organization, Category, Theme, Submission Count, Deadline, and Descriptions.
-   **Static Architecture**: Data is stored in `data.js` as a global JavaScript object, allowing the app to run directly from local file paths without CORS issues.
-   **Modern UI**: A responsive Single Page Application (SPA) with glassmorphism design and smooth animations.
-   **Hierarchical Navigation**: Browse by **Category -> Theme -> Organization -> Problem Statement**.
-   **Instant Filtering**: Client-side filtering ensures immediate feedback without server round-trips.

## 🛠️ Tech Stack

-   **Scraping**: Node.js, Puppeteer
-   **Frontend**: HTML5, Vanilla CSS, JavaScript
-   **Data Storage**: JavaScript Object (Global Variable)

## 📦 Installation

1.  **Prerequisites**: Ensure you have Node.js installed.
2.  **Clone/Download** this repository.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```

## 🏃 Usage

### 1. Scrape the Data
To update the dataset, run the scraping script. This extracts data from the SIH website and saves it to `data.js`.

```bash
npm run scrape
```

### 2. Run the App
-   **Option A (Locally)**: Simply double-click `index.html` in your file explorer. No server required!
-   **Option B (Hosted)**: Upload the folder to GitHub Pages or any static host.

## 🌐 Deploy to GitHub Pages

1.  Push this repository to GitHub.
2.  Go to **Settings** > **Pages**.
3.  Under **Build and deployment**, select **Source** as `Deploy from a branch`.
4.  Select your branch and set the folder to `/` (root).

## 📂 Project Structure

-   `scrape.js`: Main scraping script using Puppeteer. Generates `data.js`.
-   `data.js`: The dataset used by the app (loaded as a script).
-   `index.html`: Main entry point.
-   `style.css`: Styling and animations.
-   `app.js`: Frontend logic.

## 📝 License
This project is for educational purposes. Data is sourced from the official SIH website.
