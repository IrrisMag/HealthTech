'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { DashboardData } from '@/types'

interface ForecastingChartProps {
  data: DashboardData | null
}

export default function ForecastingChart({ data }: ForecastingChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedBloodType, setSelectedBloodType] = useState<string>('O+')

  useEffect(() => {
    if (!data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Filter data for selected blood type - handle both array and object formats
    let forecastData: any[] = []

    if (data.forecasts && Array.isArray(data.forecasts)) {
      forecastData = data.forecasts
        .filter(f => f.blood_type === selectedBloodType)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (data.forecasts && typeof data.forecasts === 'object') {
      // Handle object format from backend API
      const bloodTypeForecasts = (data.forecasts as any)[selectedBloodType]
      if (bloodTypeForecasts && Array.isArray(bloodTypeForecasts)) {
        forecastData = bloodTypeForecasts
          .map((f: any) => ({ ...f, blood_type: selectedBloodType }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
    }

    if (forecastData.length === 0) return

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d')
    const processedData = forecastData.map(d => ({
      ...d,
      parsedDate: parseDate(d.date) || new Date()
    }))

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.parsedDate) as [Date, Date])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([
        0,
        d3.max(processedData, d => Math.max(
          d.predicted_demand,
          d.confidence_interval_upper
        )) || 50
      ])
      .nice()
      .range([height, 0])

    // Line generators
    const line = d3.line<any>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.predicted_demand))
      .curve(d3.curveMonotoneX)

    const upperLine = d3.line<any>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.confidence_interval_upper))
      .curve(d3.curveMonotoneX)

    const lowerLine = d3.line<any>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.confidence_interval_lower))
      .curve(d3.curveMonotoneX)

    // Area generator for confidence interval
    const area = d3.area<any>()
      .x(d => xScale(d.parsedDate))
      .y0(d => yScale(d.confidence_interval_lower))
      .y1(d => yScale(d.confidence_interval_upper))
      .curve(d3.curveMonotoneX)

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%m/%d') as any)
        .ticks(5))
      .selectAll('text')
      .style('font-size', '11px')

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
      .text('Predicted Demand (Units)')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Date')

    // Add confidence interval area
    g.append('path')
      .datum(processedData)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.2)
      .attr('d', area)

    // Add confidence interval lines
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#93c5fd')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('d', upperLine)

    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#93c5fd')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('d', lowerLine)

    // Add main forecast line with animation
    const path = g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Animate the line
    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)

    // Add data points
    g.selectAll('.dot')
      .data(processedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.parsedDate))
      .attr('cy', d => yScale(d.predicted_demand))
      .attr('r', 0)
      .attr('fill', '#1d4ed8')
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('r', 4)

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'forecast-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    g.selectAll('.dot')
      .on('mouseover', function(event, d: any) {
        d3.select(this).attr('r', 6).attr('fill', '#1e40af')
        tooltip.style('visibility', 'visible')
          .html(`
            <strong>${selectedBloodType} - ${d.date}</strong><br/>
            Predicted: ${d.predicted_demand.toFixed(1)} units<br/>
            Range: ${d.confidence_interval_lower.toFixed(1)} - ${d.confidence_interval_upper.toFixed(1)}
          `)
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4).attr('fill', '#1d4ed8')
        tooltip.style('visibility', 'hidden')
      })

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 20)`)

    const legendItems = [
      { label: 'Forecast', color: '#2563eb', type: 'line' },
      { label: 'Confidence Interval', color: '#3b82f6', type: 'area' },
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
          .attr('stroke-width', 3)
      } else {
        legendRow.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 15)
          .attr('height', 10)
          .attr('fill', item.color)
          .attr('fill-opacity', 0.2)
      }

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 5)
        .attr('dy', '0.35em')
        .style('font-size', '11px')
        .style('fill', '#6b7280')
        .text(item.label)
    })

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.forecast-tooltip').remove()
    }
  }, [data, selectedBloodType])

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Demand Forecasting</h3>
        <select
          value={selectedBloodType}
          onChange={(e) => setSelectedBloodType(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {bloodTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="chart-container">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  )
}
