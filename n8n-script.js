const workflowsGrid = document.getElementById('workflows-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const complexityFilter = document.getElementById('complexity-filter');
const workflowCount = document.getElementById('workflow-count');
const emptyState = document.getElementById('empty-state');

let currentFilters = {
    search: '',
    category: 'all',
    complexity: 'all'
};

function renderWorkflows() {
    const filtered = workflowsData.filter(workflow => {
        const matchesSearch = workflow.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                            workflow.description.toLowerCase().includes(currentFilters.search.toLowerCase());
        const matchesCategory = currentFilters.category === 'all' || workflow.category === currentFilters.category;
        const matchesComplexity = currentFilters.complexity === 'all' || workflow.complexity === currentFilters.complexity;
        
        return matchesSearch && matchesCategory && matchesComplexity;
    });

    workflowCount.textContent = filtered.length;

    if (filtered.length === 0) {
        workflowsGrid.style.display = 'none';
        emptyState.style.display = 'flex';
    } else {
        workflowsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        workflowsGrid.innerHTML = filtered.map(workflow => `
            <a href="workflow-detail.html?id=${workflow.id}" class="workflow-card" style="text-decoration: none; color: inherit;">
                <div class="card-icon">${workflow.icon}</div>
                <div class="card-badge ${workflow.complexity}">${workflow.complexity}</div>
                <h3 class="card-title">${workflow.title}</h3>
                <p class="card-description">${workflow.description}</p>
                <div class="card-footer">
                    <span class="card-category">${workflow.category}</span>
                    <span class="card-nodes">${workflow.nodes} nodes</span>
                </div>
            </a>
        `).join('');
    }
}

searchInput.addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    renderWorkflows();
});

categoryFilter.addEventListener('change', (e) => {
    currentFilters.category = e.target.value;
    renderWorkflows();
});

complexityFilter.addEventListener('change', (e) => {
    currentFilters.complexity = e.target.value;
    renderWorkflows();
});

// Initial render
renderWorkflows();