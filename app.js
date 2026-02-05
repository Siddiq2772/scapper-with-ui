const app = document.getElementById('grid');
const loading = document.getElementById('loading');
const breadcrumbs = document.getElementById('breadcrumbs');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');

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

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
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
        app.classList.remove('centered-grid');
        app.classList.add('grid-container');
        app.innerHTML = '<p>No items found.</p>';
        return;
    }

    if (items.length < 3) {
        app.classList.remove('grid-container');
        app.classList.add('centered-grid');
    } else {
        app.classList.remove('centered-grid');
        app.classList.add('grid-container');
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        // Add staggered animation delay
        card.style.animation = `fadeInDown 0.5s ease-out ${index * 0.05}s forwards`;
        card.style.opacity = '0'; // Start invisible for animation

        card.innerHTML = `
            <div class="card-title">${item}</div>
            <div class="card-meta">
                <span>Click to explore</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
        `;

        card.onclick = () => {
            if (type === 'category') loadThemes(item);
            else if (type === 'theme') loadOrganizations(selectedCategory, item);
            else if (type === 'organization') loadProblems(item);
        };

        app.appendChild(card);
    });
}

function renderProblems(items) {
    app.innerHTML = '';

    if (items.length === 0) {
        app.classList.remove('centered-grid');
        app.classList.add('grid-container');
        app.innerHTML = '<p>No problem statements found.</p>';
        return;
    }

    if (items.length < 3) {
        app.classList.remove('grid-container');
        app.classList.add('centered-grid');
    } else {
        app.classList.remove('centered-grid');
        app.classList.add('grid-container');
    }

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

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.style.animation = `fadeInDown 0.5s ease-out ${index * 0.05}s forwards`;
        card.style.opacity = '0';

        card.innerHTML = `
            <div>
                <span class="label">ID: ${item.id}</span>
                <div class="card-title" style="font-size: 1.15rem; color: var(--text-primary);">${title}</div>
            </div>
            <div class="problem-desc">${shortDesc}</div>
        `;

        card.onclick = () => {
            openModal(item);
        };

        app.appendChild(card);
    });
}

function openModal(item) {
    modalBody.innerHTML = `
        <div class="modal-header">
            <span class="modal-label">ID: ${item.id}</span>
            <div class="modal-title">${item.organization}</div>
            <div style="color: var(--text-secondary); margin-top: 0.5rem;">${item.category}</div>
        </div>
        
        <div class="modal-section">
            <div class="modal-section-title">THEME</div>
            <div class="modal-text">${item.theme || 'N/A'}</div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">SUBMISSIONS</div>
            <div class="modal-text">${item.submitted_idea_count || 'N/A'}</div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">DEADLINE</div>
            <div class="modal-text">${item.deadline || 'N/A'}</div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">PROBLEM STATEMENT</div>
            <div class="modal-text">${item.description}</div>
        </div>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto'; // Restore scrolling
}
