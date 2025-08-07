'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DashboardData } from '@/types'

interface BloodInventoryChartProps {
  data: DashboardData | null
}

export default function BloodInventoryChart({ data }: BloodInventoryChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous chart

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Prepare data - handle both blood_types array and blood_type_distribution object
    let bloodTypes: any[] = []

    if (data.blood_types && Array.isArray(data.blood_types)) {
      // Use blood_types array if available
      bloodTypes = data.blood_types.map(bt => ({
        type: bt.type,
        current: bt.current_stock,
        safety: bt.safety_stock,
        reorder: bt.reorder_point,
        status: bt.status,
        trend: bt.trend || 'stable'
      }))
    } else if (data.metrics?.blood_type_distribution) {
      // Fallback to blood_type_distribution from metrics
      bloodTypes = Object.entries(data.metrics.blood_type_distribution).map(([type, count]) => ({
        type,
        current: count as number,
        safety: Math.floor((count as number) * 0.3), // 30% safety stock
        reorder: Math.floor((count as number) * 0.2), // 20% reorder point
        status: (count as number) < 5 ? 'critical' : (count as number) < 10 ? 'low' : 'adequate',
        trend: 'stable'
      }))
    }

    if (bloodTypes.length === 0) return

    // Color scale based on status
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['critical', 'low', 'adequate', 'optimal', 'excess'])
      .range(['#dc2626', '#f59e0b', '#10b981', '#059669', '#6366f1'])

    // Scales
    const xScale = d3.scaleBand()
      .domain(bloodTypes.map(d => d.type))
      .range([0, width])
      .padding(0.2)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bloodTypes, d => Math.max(d.current, d.safety)) || 100])
      .nice()
      .range([height, 0])

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', 'bold')

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Units in Stock')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Blood Type')

    // Add safety stock line
    g.selectAll('.safety-line')
      .data(bloodTypes)
      .enter()
      .append('line')
      .attr('class', 'safety-line')
      .attr('x1', d => (xScale(d.type) || 0))
      .attr('x2', d => (xScale(d.type) || 0) + xScale.bandwidth())
      .attr('y1', d => yScale(d.safety))
      .attr('y2', d => yScale(d.safety))
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    // Add reorder point line
    g.selectAll('.reorder-line')
      .data(bloodTypes)
      .enter()
      .append('line')
      .attr('class', 'reorder-line')
      .attr('x1', d => (xScale(d.type) || 0))
      .attr('x2', d => (xScale(d.type) || 0) + xScale.bandwidth())
      .attr('y1', d => yScale(d.reorder))
      .attr('y2', d => yScale(d.reorder))
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')

    // Add bars with animation
    const bars = g.selectAll('.bar')
      .data(bloodTypes)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.type) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => colorScale(d.status))
      .attr('rx', 4)
      .attr('ry', 4)

    // Animate bars
    bars.transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.current))
      .attr('height', d => height - yScale(d.current))

    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(bloodTypes)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => (xScale(d.type) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.current) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(d => d.current)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100 + 500)
      .style('opacity', 1)

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 20)`)

    const legendItems = [
      { label: 'Safety Stock', color: '#f59e0b', type: 'line' },
      { label: 'Reorder Point', color: '#dc2626', type: 'line' },
    ]

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`)

      if (item.type === 'line') {
        legendRow.append('line')
          .attr('x1', 0)
          .attr('x2', 15)
          .attr('y1', 5)
          .attr('y2', 5)
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', i === 0 ? '5,5' : '3,3')
      }

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 5)
        .attr('dy', '0.35em')
        .style('font-size', '11px')
        .style('fill', '#6b7280')
        .text(item.label)
    })

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    bars
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8)
        tooltip.style('visibility', 'visible')
          .html(`
            <strong>${d.type}</strong><br/>
            Current: ${d.current} units<br/>
            Safety: ${d.safety} units<br/>
            Reorder: ${d.reorder} units<br/>
            Status: ${d.status}
          `)
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1)
        tooltip.style('visibility', 'hidden')
      })

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip').remove()
    }
  }, [data])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Blood Inventory Levels</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-yellow-500" style={{ borderStyle: 'dashed' }}></div>
            <span>Safety Stock</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-red-500" style={{ borderStyle: 'dashed' }}></div>
            <span>Reorder Point</span>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  )
}
