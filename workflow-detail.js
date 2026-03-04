// Get workflow ID from URL
const urlParams = new URLSearchParams(window.location.search);
const workflowId = parseInt(urlParams.get('id'));

// Find workflow data
const workflow = workflowsData.find(w => w.id === workflowId);

// Workflow detailed data
const workflowDetails = {
    1: {
        features: [
            'Automated daily backlink monitoring using DataForSEO API',
            'Handles large datasets with pagination (up to 5,000 backlinks)',
            'Creates timestamped Google Sheets reports with detailed metrics',
            'Tracks Domain Rating, Spam Score, and Anchor Text',
            'Automated Gmail notifications with report links',
            'Filters backlinks lost in the last 24 hours',
            'Safety cap prevents excessive API calls'
        ],
        usecases: [
            'SEO specialists monitoring client backlink profiles',
            'Site owners protecting domain authority',
            'Detecting technical issues causing link drops',
            'Recovering high-value lost backlinks',
            'Proactive link-building campaign management',
            'Competitor backlink analysis'
        ],
        requirements: [
            'DataForSEO API credentials (login and password)',
            'Google Sheets OAuth2 connection',
            'Gmail OAuth2 connection',
            'n8n instance (self-hosted or cloud)',
            'Target domain to monitor'
        ],
        youtubeId: '' // Add YouTube video ID here when available
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
        ],
        youtubeId: ''
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
        
        // Load YouTube video if available
        if (details.youtubeId) {
            const videoContainer = document.getElementById('video-container');
            videoContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${details.youtubeId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    // Auto-load workflow JSON
    loadWorkflowJSON(workflowId);
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

// Auto-load workflow JSON from file
async function loadWorkflowJSON(id) {
    try {
        const response = await fetch(`workflow-${id}.json`);
        if (response.ok) {
            const workflowJSON = await response.json();
            renderWorkflowCanvas(workflowJSON);
        }
    } catch (error) {
        console.log('No workflow JSON file found:', error);
    }
}

// Canvas pan and zoom variables
let canvas = null;
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let touches = [];
let initialDistance = 0;
let initialScale = 1;

// Render workflow canvas with pan and zoom
function renderWorkflowCanvas(workflowJSON) {
    const container = document.getElementById('canvas-container');
    
    if (!workflowJSON || !workflowJSON.nodes) {
        return;
    }
    
    // Create canvas
    container.innerHTML = '<div id="workflow-canvas"></div>';
    canvas = document.getElementById('workflow-canvas');
    
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
    
    // Initialize pan and zoom
    initPanZoom();
    
    // Center the workflow
    centerWorkflow(nodes);
}

function centerWorkflow(nodes) {
    if (nodes.length === 0) return;
    
    // Calculate bounds
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));
    
    const workflowWidth = maxX - minX + 100;
    const workflowHeight = maxY - minY + 100;
    
    const container = document.getElementById('canvas-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate scale to fit
    const scaleX = containerWidth / workflowWidth;
    const scaleY = containerHeight / workflowHeight;
    scale = Math.min(scaleX, scaleY, 1) * 0.8; // 80% to add padding
    
    // Center position
    translateX = (containerWidth - (minX + maxX + 100) * scale) / 2;
    translateY = (containerHeight - (minY + maxY + 100) * scale) / 2;
    
    updateCanvasTransform();
}

function initPanZoom() {
    const container = document.getElementById('canvas-container');
    
    // Mouse events
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    
    // Touch events
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
}

function onMouseDown(e) {
    if (e.button !== 0) return; // Only left click
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    e.preventDefault();
}

function onMouseMove(e) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateCanvasTransform();
}

function onMouseUp() {
    isDragging = false;
}

function onWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale * delta;
    
    if (newScale < 0.1 || newScale > 3) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    translateX = mouseX - (mouseX - translateX) * delta;
    translateY = mouseY - (mouseY - translateY) * delta;
    scale = newScale;
    
    updateCanvasTransform();
}

function onTouchStart(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    
    if (touches.length === 2) {
        initialDistance = getDistance(touches[0], touches[1]);
        initialScale = scale;
    } else if (touches.length === 1) {
        isDragging = true;
        startX = touches[0].clientX - translateX;
        startY = touches[0].clientY - translateY;
    }
}

function onTouchMove(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    
    if (touches.length === 2) {
        // Pinch zoom
        const currentDistance = getDistance(touches[0], touches[1]);
        const newScale = initialScale * (currentDistance / initialDistance);
        
        if (newScale >= 0.1 && newScale <= 3) {
            const centerX = (touches[0].clientX + touches[1].clientX) / 2;
            const centerY = (touches[0].clientY + touches[1].clientY) / 2;
            
            const rect = canvas.getBoundingClientRect();
            const canvasCenterX = centerX - rect.left;
            const canvasCenterY = centerY - rect.top;
            
            const scaleRatio = newScale / scale;
            translateX = canvasCenterX - (canvasCenterX - translateX) * scaleRatio;
            translateY = canvasCenterY - (canvasCenterY - translateY) * scaleRatio;
            scale = newScale;
            
            updateCanvasTransform();
        }
    } else if (touches.length === 1 && isDragging) {
        // Pan
        translateX = touches[0].clientX - startX;
        translateY = touches[0].clientY - startY;
        updateCanvasTransform();
    }
}

function onTouchEnd(e) {
    touches = Array.from(e.touches);
    if (touches.length === 0) {
        isDragging = false;
    }
}

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateCanvasTransform() {
    if (canvas) {
        canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
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
        'n8n-nodes-base.scheduleTrigger': '⏰',
        'n8n-nodes-base.webhook': '🪝',
        'n8n-nodes-base.aggregate': '📦',
        'n8n-nodes-base.gmail': '📧',
        'n8n-nodes-dataforseo.dataForSeoBacklinksApi': '🔗'
    };
    
    return icons[nodeType] || '📦';
}