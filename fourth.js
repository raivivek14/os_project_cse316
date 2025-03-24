// Create a force simulation
            const simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(80))
                .force('charge', d3.forceManyBody().strength(-200))
                .force('center', d3.forceCenter(width / 2, height / 2));

            // Add arrowheads for directed edges
            svg.append('defs').selectAll('marker')
                .data(['allocated', 'requested'])
                .enter().append('marker')
                .attr('id', d => d)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 15)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', d => d === 'allocated' ? '#10B981' : '#EF4444');

            // Create the links
            const link = svg.append('g')
                .selectAll('line')
                .data(links)
                .enter().append('line')
                .attr('stroke-width', 2)
                .attr('stroke', d => d.type === 'allocated' ? '#10B981' : '#EF4444')
                .attr('stroke-dasharray', d => d.type === 'requested' ? '5,5' : '0')
                .attr('marker-end', d => `url(#${d.type})`);

            // Create the nodes
            const node = svg.append('g')
                .selectAll('g')
                .data(nodes)
                .enter().append('g')
                .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));

            // Add circles to nodes
            node.append('circle')
                .attr('r', 8)
                .attr('fill', d => d.type === 'process' ? '#3B82F6' : '#F59E0B');

            // Add labels to nodes
            node.append('text')
                .attr('dx', 12)
                .attr('dy', '.35em')
                .text(d => d.id)
                .attr('font-size', '12px');

            // Update positions on simulation tick
            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                node.attr('transform', d => `translate(${d.x},${d.y})`);
            });

            // Drag functions
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            // Add legend
            const legend = svg.append('g')
                .attr('transform', 'translate(10, 10)');

            // Process node
            legend.append('circle')
                .attr('r', 6)
                .attr('cx', 10)
                .attr('cy', 10)
                .attr('fill', '#3B82F6');
            
            legend.append('text')
                .attr('x', 20)
                .attr('y', 10)
                .attr('dy', '.35em')
                .text('Process')
                .attr('font-size', '10px');

            // Resource node
            legend.append('circle')
                .attr('r', 6)
                .attr('cx', 10)
                .attr('cy', 30)
                .attr('fill', '#F59E0B');
            
            legend.append('text')
                .attr('x', 20)
                .attr('y', 30)
                .attr('dy', '.35em')
                .text('Resource')
                .attr('font-size', '10px');
        }
