// Detect cycles using DFS
            const visited = new Set();
            const recursionStack = new Set();
            let cycle = [];
            
            function dfs(node, path = []) {
                visited.add(node);
                recursionStack.add(node);
                path.push(node);
                
                for (const neighbor of graph[node] || []) {
                    if (!visited.has(neighbor)) {
                        if (dfs(neighbor, [...path])) {
                            return true;
                        }
                    } else if (recursionStack.has(neighbor)) {
                        // Found a cycle
                        const cycleStart = path.indexOf(neighbor);
                        cycle = [...path.slice(cycleStart), neighbor];
                        return true;
                    }
                }
                
                recursionStack.delete(node);
                return false;
            }
            
            // Check for cycles starting from each node
            for (const node in graph) {
                if (!visited.has(node)) {
                    if (dfs(node)) {
                        break;
                    }
                }
            }
            
            // Calculate probability based on graph density and cycle length
            let probability = 0;
            if (cycle.length > 0) {
                // Simple heuristic: longer cycles might be less likely to cause actual deadlocks
                const edgeCount = Object.values(graph).reduce((sum, edges) => sum + edges.length, 0);
                const nodeCount = Object.keys(graph).length;
                const graphDensity = edgeCount / (nodeCount * (nodeCount - 1));
                
                // Higher density and shorter cycles indicate higher deadlock probability
                probability = graphDensity * (1 - (cycle.length / (2 * nodeCount)));
                probability = Math.min(Math.max(probability, 0.6), 0.95); // Keep between 60-95%
            }
            
            return {
                deadlockDetected: cycle.length > 0,
                cycle: cycle.length > 0 ? [...new Set(cycle)] : [],
                probability: cycle.length > 0 ? probability : 0
            };
        }

        // Send a message in the chat
        function sendMessage() {
            const input = document.getElementById('user-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message to chat
            addMessageToChat('user', message);
            input.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Process the message and respond
            setTimeout(() => {
                const response = processMessage(message);
                hideTypingIndicator();
                addMessageToChat('bot', response.message);
                
                // If deadlock detected from message, update results
                if (response.deadlockDetected) {
                    if (response.resources) {
                        // Update resources if extracted from message
                        resources.length = 0;
                        response.resources.forEach(r => resources.push(r));
                        updateResourcesList();
                        updateGraph();
                    }
                    
                    // Run detection
                    detectDeadlocks();
                }
            }, 1500);
        }

        // Add a message to the chat
        function addMessageToChat(role, content) {
            const chatContainer = document.getElementById('chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'flex items-start';
            
            if (role === 'user') {
                messageDiv.innerHTML = `
                    <div class="flex-grow"></div>
                    <div class="bg-blue-100 rounded-lg p-3 max-w-md ml-3">
                        <p class="text-sm">${content}</p>
                    </div>
                    <div class="flex-shrink-0 ml-3">
                        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="flex-shrink-0 mr-3">
                        <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </div>
                    </div>
                    <div class="bg-purple-100 rounded-lg p-3 max-w-md">
                        <p class="text-sm">${content}</p>
                    </div>
                `;
            }
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Show typing indicator
        function showTypingIndicator() {
            const chatContainer = document.getElementById('chat-messages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'flex items-start';
            typingDiv.innerHTML = `
                <div class="flex-shrink-0 mr-3">
                    <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </div>
                </div>
                <div class="bg-purple-100 rounded-lg p-3 max-w-md">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            
            chatContainer.appendChild(typingDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Hide typing indicator
        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Process message from user
        function processMessage(message) {
            // Simple rule-based detection from text description
            const deadlockPatterns = [
                /circular wait/i,
                /mutual exclusion/i,
                /hold and wait/i,
                /no preemption/i,
                /deadlock/i,
                /resource contention/i,
                /waiting for each other/i,
                /process .+ waiting for .+ while holding/i,
                /locked resource/i
            ];
            
            const resourcePatterns = [
                /resource (\w+) .+ allocated to (\w+)/i,
                /process (\w+) .+ holding (\w+)/i,
                /(\w+) is waiting for (\w+)/i,
                /(\w+) requests (\w+)/i
            ];
            
            // Check for deadlock patterns
            const deadlockDetected = deadlockPatterns.some(pattern => pattern.test(message));
            
            // Extract resources if possible
            let extractedResources = null;
            const resourceMap = {};
            
            // Very simple extraction logic
            const lines = message.split(/[.;\n]/);
            
            lines.forEach(line => {
                resourcePatterns.forEach(pattern => {
                    const match = line.match(pattern);
                    if (match) {
                        const [_, entity1, entity2] = match;
                        
                        // Determine if entity1 is a process or resource
                        const isEntity1Process = /^P/i.test(entity1);
                        const isEntity2Process = /^P/i.test(entity2);
                        
                        if (isEntity1Process && !isEntity2Process) {
                            // Process requesting resource
                            if (!resourceMap[entity2]) {
                                resourceMap[entity2] = { id: entity2, allocated: [], requested: [] };
                            }
                            if (!resourceMap[entity2].requested.includes(entity1)) {
                                resourceMap[entity2].requested.push(entity1);
                            }
                        } else if (!isEntity1Process && isEntity2Process) {
                            // Resource allocated to process
                            if (!resourceMap[entity1]) {
                                resourceMap[entity1] = { id: entity1, allocated: [], requested: [] };
                            }
                            if (!resourceMap[entity1].allocated.includes(entity2)) {
                                resourceMap[entity1].allocated.push(entity2);
                            }
                        }
                    }
                });
            });
            
            if (Object.keys(resourceMap).length > 0) {
                extractedResources = Object.values(resourceMap);
            }
            
            // Generate response based on analysis
            let response = "";
            
            if (deadlockDetected) {
                response = "Meow! I've detected potential deadlock conditions in your description. ";
                
                if (extractedResources) {
                    response += "I've extracted the following resource allocation pattern:\n\n";
                    extractedResources.forEach(resource => {
                        response += `- Resource ${resource.id} is allocated to: ${resource.allocated.join(", ") || "none"}\n`;
                        response += `  and requested by: ${resource.requested.join(", ") || "none"}\n`;
                    });
                    
                    const deadlockResult = detectDeadlock(extractedResources);
                    if (deadlockResult.deadlockDetected) {
                        response += `\nPurr-fect analysis confirms a potential deadlock with cycle: ${deadlockResult.cycle.join(" → ")}\n\n`;
                        response += "Recommendations to prevent this deadlock:\n";
                        response += "1. Implement resource ordering to prevent circular wait\n";
                        response += "2. Use timeouts for resource acquisition\n";
                        response += "3. Consider implementing deadlock detection at runtime\n";
                        response += "4. Redesign your resource allocation strategy";
                    }
                } else {
                    response += "To provide more specific advice, could you describe the resource allocation pattern in more detail? For example, which processes are holding which resources, and which resources are they waiting for?";
                }
            } else if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
                response = "Meow! Hello there! I'm CatBot, your AI assistant for deadlock detection. How can I help you today? You can describe your multi-threaded application or resource allocation scenario, and I'll help identify potential deadlocks.";
            } else if (message.toLowerCase().includes("help") || message.toLowerCase().includes("how")) {
                response = "Meow! I can help you detect deadlocks in your multi-threaded applications. Try describing a scenario like 'Process P1 holds resource R1 and is waiting for R2, while P2 holds R2 and is waiting for R1' or use the resource configuration panel to add resources manually.";
            } else {
                response = "Meow! I don't see any obvious deadlock conditions in your description. However, deadlocks can be subtle. ";
                
                if (extractedResources) {
                    response += "I've extracted the following resource allocation pattern:\n\n";
                    extractedResources.forEach(resource => {
                        response += `- Resource ${resource.id} is allocated to: ${resource.allocated.join(", ") || "none"}\n`;
                        response += `  and requested by: ${resource.requested.join(", ") || "none"}\n`;
                    });
                    
                    response += "\nTo prevent potential deadlocks, consider these best practices:\n";
                    response += "1. Implement resource ordering\n";
                    response += "2. Use timeouts for resource acquisition\n";
                    response += "3. Implement deadlock detection or prevention algorithms\n";
                    response += "4. Consider using higher-level concurrency primitives";
                } else {
                    response += "Could you provide more details about your resource allocation pattern? For example, which processes are holding which resources, and which resources are they waiting for?";
                }
            }
            
            return {
                message: response,
                deadlockDetected,
                resources: extractedResources
            };
        }
    </script>
</body>
</html>
