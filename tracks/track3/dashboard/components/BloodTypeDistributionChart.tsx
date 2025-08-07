'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DashboardData } from '@/types'

interface BloodTypeDistributionChartProps {
  data: DashboardData | null
}

export default function BloodTypeDistributionChart({ data }: BloodTypeDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data?.metrics?.blood_type_distribution || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 400
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const radius = Math.min(width, height) / 2 - Math.max(...Object.values(margin))

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Convert backend data to chart format
    const distributionData = Object.entries(data.metrics.blood_type_distribution).map(([bloodType, count]) => ({
      bloodType,
      count: count as number,
      percentage: ((count as number) / Object.values(data.metrics.blood_type_distribution).reduce((a, b) => (a as number) + (b as number), 0)) * 100
    }))

    // Color scale for blood types - matches medical conventions
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .range(['#ef4444', '#dc2626', '#f97316', '#ea580c', '#8b5cf6', '#7c3aed', '#10b981', '#059669'])

    // Create pie generator
    const pie = d3.pie<any>()
      .value(d => d.count)
      .sort((a, b) => b.count - a.count) // Sort by count descending

    // Create arc generators
    const arc = d3.arc<any>()
      .innerRadius(radius * 0.4) // Donut chart
      .outerRadius(radius)

    const outerArc = d3.arc<any>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1)

    // Create pie slices
    const arcs = g.selectAll('.arc')
      .data(pie(distributionData))
      .enter().append('g')
      .attr('class', 'arc')

    // Add pie slices with animation
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.bloodType))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0.9)
      .style('cursor', 'pointer')
      .transition()
      .duration(1000)
      .attrTween('d', function(d: any) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return function(t: number) {
          return arc(interpolate(t))
        }
      })

    // Add labels with leader lines
    arcs.append('text')
      .attr('transform', function(d: any) {
        const pos = outerArc.centroid(d)
        pos[0] = radius * 1.3 * (d.endAngle + d.startAngle) / 2 < Math.PI ? 1 : -1
        return `translate(${pos})`
      })
      .attr('dy', '.35em')
      .style('text-anchor', function(d: any) {
        return (d.endAngle + d.startAngle) / 2 < Math.PI ? 'start' : 'end'
      })
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(d => `${d.data.bloodType}: ${d.data.count}`)
      .style('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 1)

    // Add polylines connecting labels to slices
    arcs.append('polyline')
      .attr('points', function(d: any) {
        const pos = outerArc.centroid(d)
        pos[0] = radius * 1.3 * (d.endAngle + d.startAngle) / 2 < Math.PI ? 1 : -1
        return [arc.centroid(d), outerArc.centroid(d), pos].join(',')
      })
      .style('fill', 'none')
      .style('stroke', '#9ca3af')
      .style('stroke-width', 1)
      .style('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 0.7)

    // Add center text showing total
    const total = Object.values(data.metrics.blood_type_distribution).reduce((a, b) => (a as number) + (b as number), 0)
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '28px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(total)
      .style('opacity', 0)
      .transition()
      .delay(1500)
      .duration(500)
      .style('opacity', 1)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '14px')
      .style('fill', '#6b7280')
      .text('Total Units')
      .style('opacity', 0)
      .transition()
      .delay(1500)
      .duration(500)
      .style('opacity', 1)

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'blood-distribution-tooltip')
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
    arcs.selectAll('path')
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .style('opacity', 1)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)')
        
        tooltip.style('visibility', 'visible')
          .html(`
            <div style="text-align: center;">
              <strong style="font-size: 14px; color: ${colorScale(d.data.bloodType)}">${d.data.bloodType}</strong><br/>
              <span style="font-size: 16px; font-weight: bold;">${d.data.count} units</span><br/>
              <span style="color: #ccc;">${d.data.percentage.toFixed(1)}% of total</span>
            </div>
          `)
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 0.9)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
        
        tooltip.style('visibility', 'hidden')
      })

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.blood-distribution-tooltip').remove()
    }
  }, [data])

  if (!data?.metrics?.blood_type_distribution) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Blood Type Distribution</h3>
        </div>
        <div className="card-content flex items-center justify-center h-64">
          <p className="text-gray-500">No distribution data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Blood Type Distribution</h3>
        <p className="text-sm text-gray-600">Current inventory breakdown by blood type</p>
      </div>
      <div className="card-content flex justify-center">
        <svg ref={svgRef} className="drop-shadow-sm"></svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
        {Object.entries(data.metrics.blood_type_distribution).map(([bloodType, count]) => (
          <div key={bloodType} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: d3.scaleOrdinal<string>()
                  .domain(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                  .range(['#ef4444', '#dc2626', '#f97316', '#ea580c', '#8b5cf6', '#7c3aed', '#10b981', '#059669'])(bloodType)
              }}
            />
            <span className="font-medium">{bloodType}</span>
            <span className="text-gray-500">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
