'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DashboardData } from '@/types'

interface ComponentDistributionChartProps {
  data: DashboardData | null
}

export default function ComponentDistributionChart({ data }: ComponentDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data?.metrics?.component_distribution || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Prepare data from backend component_distribution
    const componentData = Object.entries(data.metrics.component_distribution).map(([component, count]) => ({
      component: component.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format names
      count: count as number,
      originalKey: component
    }))

    // Color scale for blood components
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['whole_blood', 'red_cells', 'plasma', 'platelets', 'cryoprecipitate'])
      .range(['#dc2626', '#ea580c', '#f59e0b', '#10b981', '#8b5cf6'])

    // Scales
    const xScale = d3.scaleBand()
      .domain(componentData.map(d => d.component))
      .range([0, width])
      .padding(0.3)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(componentData, d => d.count) || 100])
      .nice()
      .range([height, 0])

    // Add axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      
    xAxis.selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale))
      
    yAxis.selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6b7280')

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text('Units Available')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text('Blood Components')

    // Add bars with animation
    const bars = g.selectAll('.bar')
      .data(componentData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.component)!)
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => colorScale(d.originalKey))
      .attr('rx', 4)
      .attr('ry', 4)
      .style('opacity', 0.8)
      .style('cursor', 'pointer')

    // Animate bars
    bars.transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('y', d => yScale(d.count))
      .attr('height', d => height - yScale(d.count))

    // Add value labels on bars
    g.selectAll('.value-label')
      .data(componentData)
      .enter().append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.component)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(d => d.count)
      .style('opacity', 0)
      .transition()
      .delay(1200)
      .duration(500)
      .style('opacity', 1)

    // Add percentage labels
    const total = componentData.reduce((sum, d) => sum + d.count, 0)
    g.selectAll('.percentage-label')
      .data(componentData)
      .enter().append('text')
      .attr('class', 'percentage-label')
      .attr('x', d => xScale(d.component)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#6b7280')
      .text(d => `${((d.count / total) * 100).toFixed(1)}%`)
      .style('opacity', 0)
      .transition()
      .delay(1400)
      .duration(500)
      .style('opacity', 1)

    // Add grid lines
    g.selectAll('.grid-line')
      .data(yScale.ticks(5))
      .enter().append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2')
      .style('opacity', 0.5)

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'component-distribution-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')

    // Add hover effects
    bars
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .style('opacity', 1)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)')
        
        tooltip.style('visibility', 'visible')
          .html(`
            <div style="text-align: center;">
              <strong style="font-size: 14px; color: ${colorScale(d.originalKey)}">${d.component}</strong><br/>
              <span style="font-size: 16px; font-weight: bold;">${d.count} units</span><br/>
              <span style="color: #ccc;">${((d.count / total) * 100).toFixed(1)}% of total</span>
            </div>
          `)
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 0.8)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
        
        tooltip.style('visibility', 'hidden')
      })

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.component-distribution-tooltip').remove()
    }
  }, [data])

  if (!data?.metrics?.component_distribution) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Component Distribution</h3>
        </div>
        <div className="card-content flex items-center justify-center h-64">
          <p className="text-gray-500">No component data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Blood Component Distribution</h3>
        <p className="text-sm text-gray-600">Available units by component type</p>
      </div>
      <div className="card-content">
        <div className="flex justify-center">
          <svg ref={svgRef} className="drop-shadow-sm"></svg>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {Object.entries(data.metrics.component_distribution).map(([component, count]) => (
            <div key={component} className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {component.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
