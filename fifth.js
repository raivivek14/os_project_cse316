// Detect deadlocks in the current resource configuration
        function detectDeadlocks() {
            const result = detectDeadlock(resources);
            displayResults(result);
        }

        // Display detection results
        function displayResults(result) {
            const container = document.getElementById('results-container');
            
            if (result.deadlockDetected) {
                container.innerHTML = `
                    <div class="bg-red-50 border-l-4 border-red-500 p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-red-700 font-medium">
                                    Deadlock Detected!
                                </p>
                                <p class="text-xs text-red-600 mt-1">
                                    A circular wait condition was found in the resource allocation graph.
                                </p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <p class="text-sm text-red-700 font-mono">
                                Cycle: ${result.cycle.join(' → ')}
                            </p>
                            <p class="text-sm text-red-700 mt-1">
                                Probability: ${(result.probability * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div class="mt-3 bg-white p-3 rounded-md border border-red-200">
                            <p class="text-sm font-medium text-gray-700">Recommendations:</p>
                            <ul class="list-disc pl-5 mt-1 text-xs text-gray-600 space-y-1">
                                <li>Implement resource ordering to prevent circular wait</li>
                                <li>Use timeouts for resource acquisition</li>
                                <li>Consider implementing a deadlock detection algorithm at runtime</li>
                                <li>Redesign the resource allocation strategy to avoid the detected cycle</li>
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="bg-green-50 border-l-4 border-green-500 p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-green-700 font-medium">
                                    No Deadlock Detected
                                </p>
                                <p class="text-xs text-green-600 mt-1">
                                    The current resource allocation pattern does not contain any cycles that could lead to deadlocks.
                                </p>
                            </div>
                        </div>
                        <div class="mt-3 bg-white p-3 rounded-md border border-green-200">

<p class="text-sm text-gray-700">
                                Your current resource allocation strategy appears safe. Continue monitoring for changes that might introduce deadlock conditions.
                            </p>
                        </div>
                    </div>
                `;
            }
        }

        // Deadlock detection algorithm
        function detectDeadlock(resources) {
            // Build adjacency list for the resource allocation graph
            const graph = {};
            
            // Initialize graph with all processes and resources
            resources.forEach(resource => {
                graph[resource.id] = [];
                resource.allocated.forEach(process => {
                    if (!graph[process]) graph[process] = [];
                });
                resource.requested.forEach(process => {
                    if (!graph[process]) graph[process] = [];
                });
            });
             // Add edges: Process -> Resource (request) and Resource -> Process (allocation)
            resources.forEach(resource => {
                // Process -> Resource (request)
                resource.requested.forEach(process => {
                    graph[process].push(resource.id);
                });
                
                // Resource -> Process (allocation)
                resource.allocated.forEach(process => {
                    graph[resource.id].push(process);
                });
            });
