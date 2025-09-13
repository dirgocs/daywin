"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, addMonths, subMonths, addDays, isSameMonth, startOfWeek, addWeeks, isAfter, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "../../lib/utils"
import { Button } from "./button"

interface Interval {
  start: Date
  end: Date
  label: string
}

interface IntervalCalendarProps {
  className?: string
  weekStartDay?: number // 0 = domingo, 1 = segunda, 2 = terça, etc.
  selectedInterval?: { start: Date; end: Date }
  onIntervalSelect?: (interval: { start: Date; end: Date }) => void
  currentMonth?: Date
  onMonthChange?: (month: Date) => void
}

function IntervalCalendar({
  className,
  weekStartDay = 1, // Segunda-feira como padrão
  selectedInterval,
  onIntervalSelect,
  currentMonth = new Date(),
  onMonthChange,
  ...props
}: IntervalCalendarProps) {
  const [displayMonth, setDisplayMonth] = React.useState(currentMonth)

  // Calcular semanas fixas de 7 dias
  const calculateIntervals = (month: Date): Interval[] => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    const intervals: Interval[] = []
    
    // Encontrar a primeira semana que intersecta com o mês
    // Começamos algumas semanas antes do mês para capturar semanas que cruzam
    let currentWeekStart = startOfWeek(addDays(monthStart, -21), { weekStartsOn: weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
    let weekIndex = 1
    
    // Calcular semanas até algumas semanas após o fim do mês
    while (currentWeekStart.getTime() <= addDays(monthEnd, 21).getTime()) {
      const currentWeekEnd = addDays(currentWeekStart, 6) // 7 dias fixos
      
      // Verificar se esta semana intersecta com o mês atual
      const weekIntersectsMonth = 
        (currentWeekStart.getTime() <= monthEnd.getTime()) &&
        (currentWeekEnd.getTime() >= monthStart.getTime())
      
      if (weekIntersectsMonth) {
        intervals.push({
          start: currentWeekStart,
          end: currentWeekEnd,
          label: `Semana ${weekIndex}`
        })
        weekIndex++
      }
      
      // Avançar para a próxima semana
      currentWeekStart = addWeeks(currentWeekStart, 1)
      
      // Evitar loop infinito
      if (intervals.length > 10) {
        break
      }
    }
    
    return intervals
  }

  const intervals = calculateIntervals(displayMonth)

  const handlePreviousMonth = () => {
    const newMonth = subMonths(displayMonth, 1)
    setDisplayMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = addMonths(displayMonth, 1)
    setDisplayMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const isIntervalSelected = (interval: { start: Date; end: Date }) => {
    if (!selectedInterval) return false
    return (
      interval.start.getTime() === selectedInterval.start.getTime() &&
      interval.end.getTime() === selectedInterval.end.getTime()
    )
  }

  return (
    <div
      className={cn(
        "bg-background p-3 w-fit max-w-xs",
        className
      )}
      {...props}
    >
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        <h2 className="text-sm font-medium">
          {format(displayMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid de intervalos */}
      <div className="space-y-2">
        {intervals.map((interval) => {
          const isSelected = isIntervalSelected(interval)
          
          // Calcular quantos dias da semana estão no mês atual
          const monthStart = startOfMonth(displayMonth)
          const monthEnd = endOfMonth(displayMonth)
          const weekStartInMonth = interval.start.getTime() >= monthStart.getTime() ? interval.start : monthStart
          const weekEndInMonth = interval.end.getTime() <= monthEnd.getTime() ? interval.end : monthEnd
          const daysInCurrentMonth = Math.floor((weekEndInMonth.getTime() - weekStartInMonth.getTime()) / (24 * 60 * 60 * 1000)) + 1
          
          // Verificar se o intervalo cruza meses
          const crossesMonths = !isSameMonth(interval.start, interval.end)
          const startsInPreviousMonth = interval.start.getTime() < monthStart.getTime()
          const endsInNextMonth = interval.end.getTime() > monthEnd.getTime()
          
          // Verificar se a semana é futura (além da semana atual)
          const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
          const isFutureWeek = isAfter(interval.start, currentWeekEnd)
          
          return (
            <Button
              key={`${interval.start.getTime()}-${interval.end.getTime()}`}
              variant={isSelected ? "default" : "outline"}
              disabled={isFutureWeek}
              className={cn(
                "w-full justify-between text-left h-14 px-4 transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                isSelected && "bg-primary text-primary-foreground shadow-lg",
                !isSelected && !isFutureWeek && "hover:bg-accent hover:text-accent-foreground",
                crossesMonths && "border-dashed",
                isFutureWeek && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isFutureWeek && onIntervalSelect?.(interval)}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {interval.label}
                  {crossesMonths && (
                    <span className="ml-1 text-xs opacity-60">📅</span>
                  )}
                </span>
                <span className={cn(
                  "text-xs",
                  isSelected ? "opacity-90" : "opacity-70"
                )}>
                  {format(interval.start, "dd/MM", { locale: ptBR })} - {format(interval.end, "dd/MM", { locale: ptBR })}
                  {startsInPreviousMonth && (
                    <span className="ml-1 text-xs opacity-50">← continua</span>
                  )}
                  {endsInNextMonth && (
                    <span className="ml-1 text-xs opacity-50">continua →</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "opacity-90" : "opacity-60"
                )}>
                  {daysInCurrentMonth} dias
                  {crossesMonths && (
                    <span className="text-xs opacity-50"> (neste mês)</span>
                  )}
                </span>
                {isSelected && (
                  <span className="text-xs opacity-75">✓ Selecionado</span>
                )}
              </div>
            </Button>
          )
        })}
      </div>


    </div>
  )
}

export { IntervalCalendar }
export type { IntervalCalendarProps }