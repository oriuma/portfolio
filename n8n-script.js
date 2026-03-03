document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const complexityFilter = document.getElementById('complexity-filter');
    const workflowsGrid = document.getElementById('workflows-grid');
    const emptyState = document.getElementById('empty-state');
    const workflowCount = document.getElementById('workflow-count');

    let currentFilters = {
        search: '',
        category: 'all',
        complexity: 'all'
    };

    // Initialize
    renderWorkflows(workflowsData);
    workflowCount.textContent = workflowsData.length;

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase();
        filterWorkflows();
    });

    categoryFilter.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        filterWorkflows();
    });

    complexityFilter.addEventListener('change', (e) => {
        currentFilters.complexity = e.target.value;
        filterWorkflows();
    });

    // Filter workflows
    function filterWorkflows() {
        const filtered = workflowsData.filter(workflow => {
            const matchesSearch = currentFilters.search === '' || 
                workflow.title.toLowerCase().includes(currentFilters.search) ||
                workflow.description.toLowerCase().includes(currentFilters.search);
            
            const matchesCategory = currentFilters.category === 'all' || 
                workflow.category === currentFilters.category;
            
            const matchesComplexity = currentFilters.complexity === 'all' || 
                workflow.complexity === currentFilters.complexity;

            return matchesSearch && matchesCategory && matchesComplexity;
        });

        renderWorkflows(filtered);
    }

    // Render workflows
    function renderWorkflows(workflows) {
        if (workflows.length === 0) {
            workflowsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        workflowsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        workflowsGrid.innerHTML = workflows.map(workflow => `
            <div class="workflow-card" onclick="window.location.href='${workflow.link}'">
                <div class="workflow-header">
                    <div class="workflow-icon">${workflow.icon}</div>
                    <div class="workflow-meta">
                        <span class="badge ${workflow.complexity}">${workflow.complexity}</span>
                    </div>
                </div>
                <div>
                    <h3 class="workflow-title">${workflow.title}</h3>
                    <p class="workflow-description">${workflow.description}</p>
                </div>
                <div class="workflow-footer">
                    <span class="workflow-category">${getCategoryName(workflow.category)}</span>
                    <div class="workflow-nodes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v6m0 6v6m-5.2-9l4.5 2.6m0 3.8l4.5 2.6m-9-4.4l4.5-2.6m0-3.8L5.8 15"/>
                        </svg>
                        ${workflow.nodes} nodes
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Get category display name
    function getCategoryName(category) {
        const names = {
            'ai': 'AI & LLM',
            'social': 'Social Media',
            'productivity': 'Productivity',
            'data': 'Data Processing',
            'automation': 'Business Automation'
        };
        return names[category] || category;
    }
});