# How This Project Works: A Deep Dive (Simplified)

Welcome! This document explains exactly how this SIH 2025 Explorer project runs. We have designed it to be a **100% Static Application**, meaning it needs no running server, no database installation, and can be hosted anywhere (like GitHub Pages) or even run directly from your file explorer.

---

## 🎯 The Goal
The official Smart India Hackathon (SIH) website has a lot of data in a big table. It can be hard to browse quickly.
**Our Goal**: Create a tool that automatically reads all that data (scrapes it) and presents it in a beautiful, fast, and modern website that runs entirely in your browser.

---

## 🏗️ The Architecture (The Big Picture)

Think of this project like a pre-packed lunch box:

1.  **The Chef (The Scraper)**: Prepares the food (data) once.
2.  **The Container (data.js)**: Holds the prepared food.
3.  **The Eater (The Frontend)**: Consumes the food directly from the container.

**Key Difference from traditional apps**: There is no "Kitchen" (Server) actively cooking while you order. Everything is prepared beforehand.

---

## 🔍 Step 1: The Scraper (`scrape.js`)

This is the "robot" that does the hard work for us.

*   **Puppeteer**: We use a tool called Puppeteer. It is a "headless browser". Imagine a Chrome browser opening up, but without the window actually showing on your screen. It handles everything programmatically.
*   **The Process**:
    1.  **Launch**: The robot starts the browser.
    2.  **Navigate**: It goes to the SIH website.
    3.  **Extract**: It loops through the table pages, reading details like Organization, Category, Theme, ID, etc.
    4.  **Save as Script**: This is the clever part. Instead of saving to a database, it saves the data to a file `data.js` in a specific format:
        ```javascript
        window.SIH_DATA = [ { ... }, { ... } ];
        ```
    *Why do this?* By saving it as a JavaScript variable, we can load this file via a simple `<script>` tag. This avoids "CORS" errors that usually happen if you try to fetch a JSON file directly from your hard drive (`file://` protocol).

---

## 💾 Step 2: The Data (`data.js`)

This file is our "Database".
*   It is just a massive JavaScript array containing all 500+ problem statements.
*   It is loaded by `index.html` *before* our app logic runs.
*   This means when the app starts, the data is already in the browser's memory, making the app **instantly fast**.

---

## 🎨 Step 3: The Frontend (Root Directory)

This is what you see. It is a **Static Single Page Application (SPA)**. 

### 1. The Structure (`index.html`)
This is the skeleton. 
*   It imports `<script src="data.js"></script>` first.
*   Then it imports `<script src="app.js"></script>`.
*   This order ensures `SIH_DATA` is available when the app wakes up.

### 2. The Logic (`app.js`)
This is the conductor.
*   **No API Calls**: Unlike traditional apps, `app.js` doesn't ask a server for data. It just looks at `window.SIH_DATA`.
*   **Client-Side Filtering**: When you click "Software", the app filters the big array in your browser's memory.
    *   `allData.filter(item => item.category === 'Software')`
*   **Rendering**: It creates HTML cards dynamically based on your filters.

### 3. The Style (`style.css`)
*   **Glassmorphism**: We use semi-transparent backgrounds with `backdrop-filter: blur` to make cards look like frosted glass.
*   **Animations**: The "blobs" in the background move around using CSS keyframes.

---

## 🔄 The Full User Flow

1.  **Update Data**: You run `npm run scrape`. This updates `data.js`.
2.  **Open**: You double-click `index.html`.
3.  **Load**: 
    *   The browser reads `data.js` and creates the `window.SIH_DATA` variable with all 500+ records.
    *   `app.js` runs, sees the data, and shows the list of **Categories**.
4.  **Interact**: You click "Software".
5.  **Instant Filter**: `app.js` filters the in-memory array and updates the screen instantly. Zero network delay.
6.  **Deep Dive**: You click through to Theme -> Organization -> Problem.
7.  **Modal**: You click a problem. `app.js` fills the pop-up detailed view.

And that's it! A lightning-fast, server-less application.
