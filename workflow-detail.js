// Get workflow ID from URL
const urlParams = new URLSearchParams(window.location.search);
const workflowId = parseInt(urlParams.get('id'));

// Find workflow data
const workflow = workflowsData.find(w => w.id === workflowId);

// Workflow detailed data
const workflowDetails = {
    1: {
        features: [
            'Generate content using OpenAI GPT-4',
            'Multiple content types: blog posts, social media, emails',
            'Automatic saving to Google Drive',
            'Custom prompt templates',
            'Batch processing support'
        ],
        usecases: [
            'Content marketing automation',
            'Social media post generation',
            'Email campaign creation',
            'Blog writing assistance'
        ],
        requirements: [
            'OpenAI API key',
            'Google Drive credentials',
            'n8n instance (self-hosted or cloud)'
        ]
    },
    2: {
        features: [
            'Schedule posts automatically',
            'Multiple account support',
            'Image upload capability',
            'Tweet threading',
            'Analytics tracking'
        ],
        usecases: [
            'Social media management',
            'Brand presence automation',
            'Content distribution',
            'Scheduled announcements'
        ],
        requirements: [
            'Twitter API credentials',
            'n8n instance',
            'Image hosting (optional)'
        ]
    },
    // Add more detailed info for other workflows
};

// Load workflow info
if (workflow) {
    document.getElementById('workflow-icon').textContent = workflow.icon;
    document.getElementById('workflow-title').textContent = workflow.title;
    document.getElementById('workflow-description').textContent = workflow.description;
    document.getElementById('workflow-category').textContent = workflow.category.toUpperCase();
    document.getElementById('workflow-complexity').textContent = workflow.complexity.toUpperCase();
    document.getElementById('workflow-complexity').classList.add(workflow.complexity);
    document.getElementById('workflow-nodes').textContent = `${workflow.nodes} nodes`;

    // Load detailed info if available
    const details = workflowDetails[workflowId];
    if (details) {
        document.getElementById('workflow-features').innerHTML = 
            details.features.map(f => `<li>${f}</li>`).join('');
        document.getElementById('workflow-usecases').innerHTML = 
            details.usecases.map(u => `<li>${u}</li>`).join('');
        document.getElementById('workflow-requirements').innerHTML = 
            details.requirements.map(r => `<li>${r}</li>`).join('');
    }
} else {
    document.getElementById('workflow-title').textContent = 'Workflow not found';
}

// Tab switching
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// JSON Editor functionality
let loadedWorkflowJSON = null;

document.getElementById('load-json-btn').addEventListener('click', () => {
    const jsonText = document.getElementById('json-editor').value.trim();
    const statusEl = document.getElementById('json-status');
    
    if (!jsonText) {
        statusEl.className = 'json-status error';
        statusEl.textContent = 'Please paste a workflow JSON first';
        return;
    }
    
    try {
        loadedWorkflowJSON = JSON.parse(jsonText);
        statusEl.className = 'json-status success';
        statusEl.textContent = '✓ Workflow loaded successfully! Switch to Visualization tab to see the canvas.';
        
        // Render workflow
        renderWorkflowCanvas(loadedWorkflowJSON);
    } catch (error) {
        statusEl.className = 'json-status error';
        statusEl.textContent = `⚠ Invalid JSON: ${error.message}`;
    }
});

document.getElementById('clear-json-btn').addEventListener('click', () => {
    document.getElementById('json-editor').value = '';
    document.getElementById('json-status').style.display = 'none';
    loadedWorkflowJSON = null;
    
    // Clear canvas
    const container = document.getElementById('canvas-container');
    container.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6M9 15h6"/>
            </svg>
            <h3>No workflow loaded</h3>
            <p>Paste your workflow JSON in the JSON Editor tab to visualize it</p>
        </div>
    `;
});

document.getElementById('copy-json-btn').addEventListener('click', () => {
    const jsonText = document.getElementById('json-editor').value;
    navigator.clipboard.writeText(jsonText).then(() => {
        const statusEl = document.getElementById('json-status');
        statusEl.className = 'json-status success';
        statusEl.textContent = '✓ JSON copied to clipboard!';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 2000);
    });
});

// Render workflow canvas
function renderWorkflowCanvas(workflowJSON) {
    const container = document.getElementById('canvas-container');
    
    if (!workflowJSON || !workflowJSON.nodes) {
        return;
    }
    
    // Create canvas
    container.innerHTML = '<div id="workflow-canvas"></div>';
    const canvas = document.getElementById('workflow-canvas');
    
    // Calculate positions if not provided
    const nodes = workflowJSON.nodes.map((node, index) => {
        const x = node.position?.[0] || (index * 200 + 100);
        const y = node.position?.[1] || (Math.floor(index / 5) * 200 + 100);
        return { ...node, x, y };
    });
    
    // Render connections first (so they appear behind nodes)
    if (workflowJSON.connections) {
        Object.keys(workflowJSON.connections).forEach(sourceNodeName => {
            const sourceNode = nodes.find(n => n.name === sourceNodeName);
            if (!sourceNode) return;
            
            const outputs = workflowJSON.connections[sourceNodeName];
            Object.keys(outputs).forEach(outputType => {
                outputs[outputType].forEach(connections => {
                    connections.forEach(conn => {
                        const targetNode = nodes.find(n => n.name === conn.node);
                        if (!targetNode) return;
                        
                        drawConnection(canvas, sourceNode, targetNode);
                    });
                });
            });
        });
    }
    
    // Render nodes
    nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        
        const icon = getNodeIcon(node.type);
        nodeEl.innerHTML = `
            <div class="node-icon">${icon}</div>
            <div class="node-name">${node.name}</div>
        `;
        
        canvas.appendChild(nodeEl);
    });
}

function drawConnection(canvas, sourceNode, targetNode) {
    const conn = document.createElement('div');
    conn.className = 'connection';
    
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    conn.style.left = `${sourceNode.x + 50}px`;
    conn.style.top = `${sourceNode.y + 50}px`;
    conn.style.width = `${length}px`;
    conn.style.transform = `rotate(${angle}deg)`;
    
    canvas.appendChild(conn);
}

function getNodeIcon(nodeType) {
    const icons = {
        'n8n-nodes-base.start': '▶️',
        'n8n-nodes-base.httpRequest': '🌐',
        'n8n-nodes-base.set': '✏️',
        'n8n-nodes-base.if': '🔀',
        'n8n-nodes-base.function': '⚙️',
        'n8n-nodes-base.merge': '🔗',
        'n8n-nodes-base.splitOut': '✂️',
        'n8n-nodes-base.filter': '🔍',
        'n8n-nodes-base.googleSheets': '📊',
        'n8n-nodes-base.telegram': '✈️',
        'n8n-nodes-base.schedule': '⏰',
        'n8n-nodes-base.webhook': '🪝'
    };
    
    return icons[nodeType] || '📦';
}