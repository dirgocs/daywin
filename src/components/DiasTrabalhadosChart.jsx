import React, { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, LabelList, Cell } from 'recharts'
import { CalendarDays, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function DiasTrabalhadosChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const titleMonth = useMemo(() => {
    return currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }, [currentMonth])

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const params = { month: currentMonth.getMonth() + 1, year: currentMonth.getFullYear() }
    ;(async () => {
      try {
        const res = await window.electronAPI?.reports?.diasTrabalhadosPorDiarista?.(params)
        if (!isMounted) return
        if (res?.success) setData(res.data || [])
        else setData([])
      } catch {
        if (isMounted) setData([])
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [currentMonth])

  const navigateMonth = (direction) => {
    const next = new Date(currentMonth)
    next.setMonth(currentMonth.getMonth() + direction)
    const now = new Date()
    // bloquear meses futuros
    const notFuture = next <= new Date(now.getFullYear(), now.getMonth(), 1)
    if (notFuture) {
      setLoading(true)
      setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1))
    }
  }

  const isNextDisabled = useMemo(() => {
    const now = new Date()
    const nextMonthStart = new Date(currentMonth)
    nextMonthStart.setMonth(currentMonth.getMonth() + 1)
    return nextMonthStart > new Date(now.getFullYear(), now.getMonth(), 1)
  }, [currentMonth])

  const chartHeight = useMemo(() => Math.max(240, (data?.length || 0) * 36 + 60), [data])

  // Month picker (ano + 12 caixas)
  const MonthPicker = ({ value, onSelect }) => {
    const [year, setYear] = useState(value.getFullYear())
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthNow = now.getMonth()
    const months = Array.from({ length: 12 }, (_, i) => i)
    const monthLabel = (m) => new Date(2000, m, 1).toLocaleDateString('pt-BR', { month: 'short' })

    const isDisabled = (m) => year > currentYear || (year === currentYear && m > currentMonthNow)
    const isSelected = (m) => year === value.getFullYear() && m === value.getMonth()

    return (
      <div className="p-3 w-[360px]">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 hover:bg-muted"
            onClick={() => setYear((y) => Math.max(1900, y - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        
          <div className="text-sm font-medium text-foreground">{year}</div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 hover:bg-muted"
            onClick={() => setYear((y) => Math.min(currentYear, y + 1))}
            disabled={year >= currentYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {months.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                if (isDisabled(m)) return
                onSelect(new Date(year, m, 1))
              }}
              className={cn(
                'h-8 rounded-md border text-xs capitalize transition-colors',
                'border-muted bg-background text-foreground',
                'hover:bg-muted',
                isSelected(m) && 'bg-muted font-medium',
                isDisabled(m) && 'opacity-40 cursor-not-allowed hover:bg-background'
              )}
            >
              {monthLabel(m)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-end justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Dias Trabalhados por Diarista
            </CardTitle>
            <CardDescription>{titleMonth.charAt(0).toUpperCase() + titleMonth.slice(1)}</CardDescription>
          </div>
          <div className="flex items-center -space-x-1 -mr-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 scale-75">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={4} className="w-[360px] p-0">
                <MonthPicker
                  value={currentMonth}
                  onSelect={(date) => {
                    setLoading(true)
                    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 scale-75"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 scale-75"
              onClick={() => navigateMonth(1)}
              disabled={isNextDisabled}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            Sem dados para o mês atual
          </div>
        ) : (
        <div className="w-full" style={{ height: `${chartHeight}px` }}>
          <ChartContainer
            config={{ days: { label: 'Dias', color: 'hsl(var(--chart-3))' } }}
            className="h-full w-full"
          >
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 16, left: 8, bottom: 10 }} barCategoryGap="10%">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={160}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value} dia${value === 1 ? '' : 's'}`, 'Total']}
                    labelFormatter={(label) => label}
                  />
                }
              />
              <Bar dataKey="days" radius={[0, 8, 8, 0]} style={{ transition: 'filter 0.2s ease' }}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={hoveredIndex === index ? 'var(--primary)' : 'var(--accent)'}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
                <LabelList dataKey="days" position="right" className="text-xs font-medium" fill="var(--foreground)" offset={8} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DiasTrabalhadosChart
