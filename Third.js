// Global state
        const resources = [];
        let chatMessages = [];

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Add sample resources
            resources.push(
                { id: "R1", allocated: ["P1"], requested: ["P2"] },
                { id: "R2", allocated: ["P2"], requested: ["P3"] },
                { id: "R3", allocated: ["P3"], requested: ["P1"] }
            );
            updateResourcesList();
            updateGraph();
        });

        // Add a new resource
        function addResource() {
            const id = document.getElementById('resource-id').value.trim();
            const allocatedTo = document.getElementById('allocated-to').value.trim();
            const requestedBy = document.getElementById('requested-by').value.trim();

            if (!id) {
                alert('Please enter a Resource ID');
                return;
            }

            const allocated = allocatedTo.split(',').map(p => p.trim()).filter(Boolean);
            const requested = requestedBy.split(',').map(p => p.trim()).filter(Boolean);

            resources.push({
                id,
                allocated,
                requested
            });

            // Clear inputs
            document.getElementById('resource-id').value = '';
            document.getElementById('allocated-to').value = '';
            document.getElementById('requested-by').value = '';

            updateResourcesList();
            updateGraph();
        }

        // Update the resources list UI
        function updateResourcesList() {
            const container = document.getElementById('resources-list');
            container.innerHTML = '';

            resources.forEach((resource, index) => {
                const resourceEl = document.createElement('div');
                resourceEl.className = 'bg-purple-50 rounded-lg p-3 flex justify-between items-center';
                resourceEl.innerHTML = `
                    <div>
                        <span class="font-medium">${resource.id}</span>
                        <div class="text-xs text-gray-600">
                            Allocated to: ${resource.allocated.join(', ') || 'None'}
                        </div>
                        <div class="text-xs text-gray-600">
                            Requested by: ${resource.requested.join(', ') || 'None'}
                        </div>
                    </div>
                    <button onclick="removeResource(${index})" class="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                `;
                container.appendChild(resourceEl);
            });
        }

        // Remove a resource
        function removeResource(index) {
            resources.splice(index, 1);
            updateResourcesList();
            updateGraph();
        }

        // Clear all resources
        function clearResources() {
            resources.length = 0;
            updateResourcesList();
            updateGraph();
            
            // Clear results
            document.getElementById('results-container').innerHTML = `
                <div class="text-center text-gray-500">
                    <p>No deadlock detection results yet</p>
                    <p class="text-sm">Add resources and run detection</p>
                </div>
            `;
        }

        // Update the resource allocation graph
        function updateGraph() {
            const svg = d3.select('#resource-graph');
            svg.selectAll('*').remove();

            if (resources.length === 0) {
                svg.append('text')
                    .attr('x', '50%')
                    .attr('y', '50%')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .text('No resources to display')
                    .attr('fill', '#9CA3AF');
                return;
            }

            const width = svg.node().getBoundingClientRect().width;
            const height = svg.node().getBoundingClientRect().height;

            // Extract all unique processes and resources
            const processes = new Set();
            const resourceIds = new Set();
            
            resources.forEach(resource => {
                resourceIds.add(resource.id);
                resource.allocated.forEach(p => processes.add(p));
                resource.requested.forEach(p => processes.add(p));
            });

            // Create nodes for processes and resources
            const nodes = [
                ...Array.from(processes).map(id => ({ id, type: 'process' })),
                ...Array.from(resourceIds).map(id => ({ id, type: 'resource' }))
            ];

            // Create links for allocations and requests
            const links = [];
            resources.forEach(resource => {
                // Allocated: Resource -> Process
                resource.allocated.forEach(process => {
                    links.push({
                        source: resource.id,
                        target: process,
                        type: 'allocated'
                    });
                });
                
                // Requested: Process -> Resource
                resource.requested.forEach(process => {
                    links.push({
                        source: process,
                        target: resource.id,
                        type: 'requested'
                    });
                });
            });
