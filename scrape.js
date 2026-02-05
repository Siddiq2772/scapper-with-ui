const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeSIHData() {
    console.log("Starting scraper...");

    // We will save to a JSON file in public folder instead of SQLite
    const outputPath = path.resolve(__dirname, 'public', 'data.json');

    const browser = await puppeteer.launch({
        headless: true,//if false then browser will open
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport for consistent results
    await page.setViewport({ width: 1280, height: 800 });

    let allData = [];
    const urls = ['https://www.sih.gov.in/sih2025PS', 'https://www.sih.gov.in/sih2024PS'];

    try {
        for (const url of urls) {
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for table
            await page.waitForSelector('#dataTablePS', { timeout: 30000 });
            console.log(`Table loaded for ${url}.`);

            // Change pagination to 100 to reduce page turns
            const selectSelector = 'select[name="dataTablePS_length"]';
            // Check if the dropdown exists before trying to select
            if (await page.$(selectSelector)) {
                await page.select(selectSelector, '100');
                // Wait for the table to refresh after changing page length
                await new Promise(r => setTimeout(r, 2000));
            }

            let hasNext = true;
            let pageNum = 1;

            while (hasNext) {
                console.log(`Scraping page ${pageNum} from ${url}...`);

                // Extract data from current page
                const pageData = await page.$$eval('#dataTablePS tbody tr', (rows) => {
                    return rows.map(row => {
                        const cleanText = (text) => text ? text.trim() : '';

                        // Selectors based on inspection
                        // Organization: 2nd column
                        // Category: 4th column
                        // ID: 5th column
                        // Count: 6th column
                        // Theme: 7th column
                        // Deadline: 8th column

                        const org = cleanText(row.querySelector('td:nth-child(2)')?.textContent);
                        const category = cleanText(row.querySelector('td:nth-child(4)')?.textContent);
                        const id = cleanText(row.querySelector('td:nth-child(5)')?.textContent);
                        const submissionCount = cleanText(row.querySelector('td:nth-child(6)')?.textContent);
                        const theme = cleanText(row.querySelector('td:nth-child(7)')?.textContent);
                        const deadline = cleanText(row.querySelector('td:nth-child(8)')?.textContent);

                        // Description is hidden in the DOM inside a modal structure within the 3rd column
                        let description = '';
                        const descContainer = row.querySelector('td:nth-child(3) .modal-body');
                        if (descContainer) {
                            description = descContainer.innerHTML.trim();// it is fetching html not the text
                        }

                        return { id, organization: org, category, description, theme, submitted_idea_count: submissionCount, deadline };
                    });
                });

                // Filter out empty rows or headers if any leaked
                const validData = pageData.filter(d => d.id && d.id !== '');
                allData = allData.concat(validData);

                console.log(`Extracted ${validData.length} rows from page ${pageNum} of ${url}.`);

                // Check for next button
                const nextButton = await page.$('#dataTablePS_next');
                if (!nextButton) {
                    hasNext = false;
                } else {
                    const className = await page.evaluate(el => el.className, nextButton);
                    if (className.includes('disabled')) {
                        hasNext = false;
                    } else {
                        await nextButton.click();
                        // Wait for table update. 
                        await new Promise(r => setTimeout(r, 1000));
                        pageNum++;
                    }
                }
            }
        }

        console.log("Scraping complete.");

        // Save to JS file for easy local opening (avoids CORS on file://)
        const outputJsPath = path.resolve(__dirname, 'data.js');
        const jsContent = `window.SIH_DATA = ${JSON.stringify(allData, null, 2)};`;
        fs.writeFileSync(outputJsPath, jsContent);
        console.log(`Saved ${allData.length} items to ${outputJsPath}`);

        return allData;

    } catch (error) {
        console.error("Error during scraping:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Execute if run directly
if (require.main === module) {
    scrapeSIHData().then(data => {
        console.log(`Successfully scraped ${data.length} items.`);
    }).catch(err => {
        console.error("Failed:", err);
    });
}

module.exports = scrapeSIHData;
