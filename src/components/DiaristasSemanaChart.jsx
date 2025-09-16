import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts'
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { WeekCalendarPicker } from './WeekCalendarPicker'

export function DiaristasSemanaChart() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const getWeekRangeText = (offset) => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff + offset * 7)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const fmt = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${fmt(monday)} - ${fmt(sunday)}`
  }

  const getWeekData = (offset) => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff + offset * 7)

    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const baseCounts = [8, 12, 6, 15, 10, 4, 2]

    return dayNames.map((dayName, index) => {
      const currentDay = new Date(monday)
      currentDay.setDate(monday.getDate() + index)
      return {
        day: dayName,
        cleaners: Math.max(1, baseCounts[index] + offset * 2 + Math.floor(Math.random() * 3 - 1)),
        date: formatDate(currentDay),
      }
    })
  }

  const navigateWeek = (direction) => {
    const newOffset = currentWeekOffset + direction
    if (newOffset >= -52 && newOffset <= 0) setCurrentWeekOffset(newOffset)
  }

  const data = useMemo(() => getWeekData(currentWeekOffset), [currentWeekOffset])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-end justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Diaristas por Dia da Semana
            </CardTitle>
            <CardDescription>{getWeekRangeText(currentWeekOffset)}</CardDescription>
          </div>
          <div className="flex items-center -space-x-1 -mr-2">
            <div className="scale-75">
              <WeekCalendarPicker currentWeekOffset={currentWeekOffset} onWeekSelect={setCurrentWeekOffset} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 scale-75"
              onClick={() => navigateWeek(-1)}
              disabled={currentWeekOffset <= -52}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 scale-75"
              onClick={() => navigateWeek(1)}
              disabled={currentWeekOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ChartContainer
            config={{
              cleaners: { label: 'Diaristas', color: 'hsl(var(--chart-2))' },
            }}
            className="h-full w-full"
          >
            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }} barCategoryGap="5%">
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                className="text-xs"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `${value} diarista${value === 1 ? '' : 's'}`,
                      'Total',
                    ]}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        const p = payload[0].payload
                        return `${p.day} • ${p.date}`
                      }
                      return ''
                    }}
                  />
                }
              />
              <Bar
                dataKey="cleaners"
                radius={[8, 8, 0, 0]}
                style={{ transition: 'filter 0.2s ease' }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={hoveredIndex === index ? 'var(--primary)' : 'var(--accent)'}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
                <LabelList dataKey="cleaners" position="top" className="text-xs font-medium" fill="var(--foreground)" offset={5} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default DiaristasSemanaChart
