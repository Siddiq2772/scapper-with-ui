const app = document.getElementById('grid');
const loading = document.getElementById('loading');
const breadcrumbs = document.getElementById('breadcrumbs');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const cardCountElement = document.getElementById('card-count');

// State
let currentView = 'categories';
let selectedCategory = null;
let selectedTheme = null;
let selectedOrg = null;
let allData = []; // Store the full dataset

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();

    // Close modal on outside click
    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // Keydown events
    document.addEventListener('keydown', (e) => {
        // Close modal on Escape
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
            return;
        }

        // Navigate back on Backspace
        if (e.key === 'Backspace' && !modal.classList.contains('open')) {
            // Prevent browser back
            e.preventDefault();

            if (currentView === 'themes') {
                loadCategories();
            } else if (currentView === 'organizations') {
                loadThemes(selectedCategory);
            } else if (currentView === 'problems') {
                loadOrganizations(selectedCategory, selectedTheme);
            }
        }
    });
});

async function loadData() {
    showLoading();
    try {
        // await fetch('data.json') is replaced by direct access to window.SIH_DATA
        if (window.SIH_DATA) {
            allData = window.SIH_DATA;
            loadCategories();
        } else {
            // Fallback just in case, though likely not needed if data.js is loaded
            const res = await fetch('data.json');
            if (!res.ok) throw new Error("Failed to load data.json and window.SIH_DATA is missing");
            allData = await res.json();
            loadCategories();
        }
    } catch (err) {
        console.error(err);
        app.innerHTML = '<p>Error loading data. Make sure to run `npm run scrape` first.</p>';
    } finally {
        hideLoading();
    }
}

function showLoading() {
    app.innerHTML = '';
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}

function updateBreadcrumbs() {
    let html = `<span class="breadcrumb-item ${currentView === 'categories' ? 'active' : ''}" onclick="loadCategories()">Categories</span>`;

    if (selectedCategory) {
        html += ` <span class="breadcrumb-separator">/</span> <span class="breadcrumb-item ${currentView === 'themes' ? 'active' : ''}" onclick="loadThemes('${selectedCategory}')">${selectedCategory}</span>`;
    }

    if (selectedTheme) {
        html += ` <span class="breadcrumb-separator">/</span> <span class="breadcrumb-item ${currentView === 'organizations' ? 'active' : ''}" onclick="loadOrganizations('${selectedCategory}', '${selectedTheme}')">${selectedTheme}</span>`;
    }

    if (selectedOrg) {
        html += ` <span class="breadcrumb-separator">/</span> <span class="breadcrumb-item active">${selectedOrg}</span>`;
    }

    breadcrumbs.innerHTML = html;
}

function loadCategories() {
    currentView = 'categories';
    selectedCategory = null;
    selectedTheme = null;
    selectedOrg = null;
    updateBreadcrumbs();

    if (allData.length === 0) {
        app.innerHTML = '<p>No data available.</p>';
        return;
    }

    const categories = [...new Set(allData.map(item => item.category))].sort();
    renderCards(categories, 'category');
}

function loadThemes(category) {
    currentView = 'themes';
    selectedCategory = category;
    selectedTheme = null;
    selectedOrg = null;
    updateBreadcrumbs();

    const themes = [...new Set(
        allData
            .filter(item => item.category === category)
            .map(item => item.theme)
    )].sort();

    renderCards(themes, 'theme');
}

function loadOrganizations(category, theme) {
    currentView = 'organizations';
    selectedCategory = category;
    selectedTheme = theme;
    selectedOrg = null;
    updateBreadcrumbs();

    const organizations = [...new Set(
        allData
            .filter(item => item.category === category && item.theme === theme)
            .map(item => item.organization)
    )].sort();

    renderCards(organizations, 'organization');
}

function loadProblems(organization) {
    currentView = 'problems';
    selectedOrg = organization;
    updateBreadcrumbs();

    const problems = allData.filter(item =>
        item.category === selectedCategory &&
        item.theme === selectedTheme &&
        item.organization === organization
    );

    renderProblems(problems);
}

function renderCards(items, type) {
    app.innerHTML = '';

    if (items.length === 0) {
        app.classList.remove('centered-view');
        app.innerHTML = '<p>No items found.</p>';
        updateCardCount(0);
        return;
    }

    updateCardCount(items.length);

    if (items.length < 3) {
        app.classList.add('centered-view');
    } else {
        app.classList.remove('centered-view');
    }

    const template = document.getElementById('category-card-template');

    items.forEach((item, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        card.style.animation = `fadeInDown 0.4s ease-out ${index * 0.05}s forwards`;
        card.style.opacity = '0';

        card.querySelector('.card-title').textContent = item;

        let count = 0;
        if (type === 'category') {
            count = allData.filter(d => d.category === item).length;
        } else if (type === 'theme') {
            count = allData.filter(d => d.category === selectedCategory && d.theme === item).length;
        } else if (type === 'organization') {
            count = allData.filter(d => d.category === selectedCategory && d.theme === selectedTheme && d.organization === item).length;
        }

        const badge = card.querySelector('.card-count-badge');
        if (badge) {
            badge.textContent = `${count} problem${count === 1 ? '' : 's'}`;
        }

        card.onclick = () => {
            if (type === 'category') loadThemes(item);
            else if (type === 'theme') loadOrganizations(selectedCategory, item);
            else if (type === 'organization') loadProblems(item);
        };

        app.appendChild(clone);
    });
}

function renderProblems(items) {
    app.innerHTML = '';

    if (items.length === 0) {
        app.classList.remove('centered-view');
        app.innerHTML = '<p>No problem statements found.</p>';
        updateCardCount(0);
        return;
    }

    updateCardCount(items.length);

    if (items.length < 3) {
        app.classList.add('centered-view');
    } else {
        app.classList.remove('centered-view');
    }

    const template = document.getElementById('problem-card-template');

    items.forEach((item, index) => {
        // Parse the HTML description to extract specific fields for the card preview
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.description;

        const getValue = (label) => {
            // content might be in a table
            const rows = tempDiv.querySelectorAll('tr');
            for (let row of rows) {
                const cells = row.querySelectorAll('td, th');
                // Check if first cell contains the label
                if (cells.length > 1 && cells[0].textContent.trim().toLowerCase().includes(label.toLowerCase())) {
                    return cells[1].textContent.trim();
                }
            }
            return null;
        };

        const title = getValue('Problem Statement Title') || 'Problem Statement';
        let shortDesc = getValue('Description') || tempDiv.textContent.trim();

        // Clean up common prefixes in the description if present
        const prefixes = ['Problem Description', 'Background', 'Description'];
        prefixes.forEach(p => {
            if (shortDesc.startsWith(p)) {
                shortDesc = shortDesc.substring(p.length).trim();
            }
        });

        // Truncate for card view
        if (shortDesc.length > 150) {
            shortDesc = shortDesc.substring(0, 150) + '...';
        }

        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        card.style.animation = `fadeInDown 0.4s ease-out ${index * 0.05}s forwards`;
        card.style.opacity = '0';

        card.querySelector('.label').textContent = `ID: ${item.id}`;
        card.querySelector('.card-title').textContent = title;
        card.querySelector('.problem-desc').textContent = shortDesc;

        card.onclick = () => {
            openModal(item);
        };

        app.appendChild(clone);
    });
}

function openModal(item) {
    document.getElementById('modal-id').textContent = `ID: ${item.id}`;
    document.getElementById('modal-org').textContent = item.organization;
    document.getElementById('modal-cat').textContent = item.category;
    document.getElementById('modal-theme').textContent = item.theme || 'N/A';
    document.getElementById('modal-subs').textContent = item.submitted_idea_count || 'N/A';
    document.getElementById('modal-deadline').textContent = item.deadline || 'N/A';
    let formattedDesc = item.description;

    // Sometimes scraped text lacks bold tags. We can bold common headings.
    const headingsToBold = [
        "Description:", "Challenge:", "Usage:", "Users:", "Available Solutions \\(if Yes, reasons for not using them\\):", "Desired Outcome:",
        "Problem Description", "Background", "Expected Solution", "Expected Outcomes", "Impact \/ Why this problem needs to be solved", "Impact", "Relevant Stakeholders \/ Beneficiaries", "Supporting Data"
    ];

    headingsToBold.forEach(heading => {
        const regex = new RegExp(`(^|\\n|<br>|\\s)(?:<b.*?>)?(${heading})(?:<\\/b>)?(?!<\\/b>)`, 'gi');
        formattedDesc = formattedDesc.replace(regex, '<br><br><b style="color: var(--accent-color); font-size: 1.1em; display: inline-block; margin-top: 0px; margin-bottom: 0px;">$2</b>');
    });

    document.getElementById('modal-desc').innerHTML = formattedDesc;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function updateCardCount(count) {
    if (cardCountElement) {
        if (currentView === 'categories' && allData.length > 0) {
            // Check if we have the allData loaded, to show total problems
            let totalProblems = allData.length;
            cardCountElement.textContent = `Total Problems: ${totalProblems}`;
            cardCountElement.style.display = 'inline-block';
        } else if (count > 0) {
            let itemName = 'card';
            if (currentView === 'themes') itemName = count === 1 ? 'theme' : 'themes';
            else if (currentView === 'organizations') itemName = count === 1 ? 'organization' : 'organizations';
            else if (currentView === 'problems') itemName = count === 1 ? 'problem' : 'problems';

            cardCountElement.textContent = ` ${count} ${itemName}`;
            cardCountElement.style.display = 'inline-block';
        } else {
            cardCountElement.style.display = 'none';
        }
    }
}
