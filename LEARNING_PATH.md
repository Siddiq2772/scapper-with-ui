# Learning Path: Mastering the SIH Explorer Project

To fully understand and maintain this project, these are the key technologies you need to learn. I've arranged them from "Foundational" to "Advanced" based on how they are used here.

---

## 1. Core Language: JavaScript (Node.js)
**Role**: Everything! It powers the server, the scraper, and the frontend logic.
*   **What to learn**:
    *   **Variables & Functions**: The basics (`const`, `let`, `function`, arrow functions `() => {}`).
    *   **Objects & Arrays**: How to store and filter data (used extensively in `app.js` and `scrape.js`).
    *   **Asynchronous Programming (Critical)**: You MUST understand `async`, `await`, and `Promises`. This is how Puppeteer waits for pages to load and how the database waits for queries.
*   **Where it's used**: Every file in this project (`.js` files).

## 2. Web Fundamentals: HTML & CSS
**Role**: The "Face" of the project.
*   **What to learn**:
    *   **HTML5**: Structure of a page (`<div>`, `<header>`, `<main>`).
    *   **CSS3**: Styling. Specifically:
        *   **Flexbox & Grid**: Used in `style.css` to align the cards nicely.
        *   **Variables**: (`var(--bg-color)`) for theming.
        *   **Transitions/Animations**: (`@keyframes`, `transition`) for the "wow" factor.
*   **Where it's used**: `public/index.html` and `public/style.css`.

## 3. Web Framework: Express.js
**Role**: The "Traffic Cop". It routes traffic from the frontend to the database.
*   **What to learn**:
    *   **Routing**: How `app.get('/api/categories')` knows what to do when that URL is visited.
    *   **Request & Response**: How to send JSON data back to the browser (`res.json()`).
*   **Where it's used**: `server.js`.

## 4. Web Scraping: Puppeteer
**Role**: The "Robot". It controls the Chrome browser.
*   **What to learn**:
    *   **Selectors**: How to find an element on a page (e.g., `#dataTablePS tbody tr`). This connects to CSS knowledge.
    *   **Browser Actions**: `page.goto()`, `page.click()`, `page.type()`.
    *   **Evaluation**: `page.evaluate()` runs code *inside* the browser page context.
*   **Where it's used**: `scrape.js`.

## 5. Database: SQL (SQLite)
**Role**: The "Memory".
*   **What to learn**:
    *   **Basic Queries**: `SELECT`, `INSERT`, `CREATE TABLE`.
    *   **Filtering**: `WHERE category = ? AND theme = ?`.
    *   **Distinct**: `SELECT DISTINCT` to get unique lists (used for categories/themes).
*   **Where it's used**: `scrape.js` (to save data) and `server.js` (to read data).

---

## 🚀 Recommended Learning Order

1.  **JavaScript Basics**: Build small scripts. Learn to loop through arrays.
2.  **Async/Await**: This is usually the hardest hurdle. Practice fetching data from public APIs.
3.  **HTML/CSS**: Build a static portfolio page.
4.  **Express**: Build a tiny server that says "Hello World" on `localhost`.
5.  **SQL**: Learn basic `SELECT * FROM table` commands.
6.  **Puppeteer**: Finally, try writing a script to take a screenshot of Google.com.

Once you grasp these, you will be able to read this project's code like a book!
