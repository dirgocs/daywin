import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IntervalCalendar } from '@/components/ui/interval-calendar'
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function IntervalCalendarPicker({ 
  onIntervalChange, 
  weekStartDay: initialWeekStartDay = 1, // Segunda-feira como padrão
  className,
  placeholder = "Selecione um período"
}) {
  const [selectedInterval, setSelectedInterval] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [weekStartDay, setWeekStartDay] = useState(initialWeekStartDay)
  
  const getIntervalRangeText = (interval) => {
    if (!interval) return placeholder
    return `${format(interval.start, 'dd/MM', { locale: ptBR })} - ${format(interval.end, 'dd/MM', { locale: ptBR })}`
  }
  
  const handleIntervalSelect = (interval) => {
    setSelectedInterval(interval)
    setIsOpen(false)
    if (onIntervalChange) {
      onIntervalChange(interval)
    }
  }

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-8 w-8",
              !selectedInterval && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium whitespace-nowrap">Seleção de Período</h3>
              <Select value={weekStartDay.toString()} onValueChange={(value) => setWeekStartDay(parseInt(value))}>
                <SelectTrigger className="w-auto h-6 text-xs px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Dom - Sáb</SelectItem>
                  <SelectItem value="1">Seg - Dom</SelectItem>
                  <SelectItem value="2">Ter - Seg</SelectItem>
                  <SelectItem value="3">Qua - Ter</SelectItem>
                  <SelectItem value="4">Qui - Qua</SelectItem>
                  <SelectItem value="5">Sex - Qui</SelectItem>
                  <SelectItem value="6">Sáb - Sex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <IntervalCalendar
            mode="single"
            selected={selectedInterval?.start}
            onSelect={handleIntervalSelect}
            initialFocus
            weekStartDay={weekStartDay}
            selectedInterval={selectedInterval}
            onIntervalSelect={handleIntervalSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Função utilitária para calcular o intervalo personalizado (mantida para compatibilidade)
export const calculateIntervalRange = (currentWeekOffset, intervalDays = 15, intervalStartDate = 1) => {
  if (currentWeekOffset === 0) {
    return 'intervalo atual';
  }
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calcular quantos intervalos cabem no mês
  const monthStart = startOfMonth(new Date(currentYear, currentMonth + currentWeekOffset));
  const monthEnd = endOfMonth(new Date(currentYear, currentMonth + currentWeekOffset));
  const daysInMonth = monthEnd.getDate();
  
  const intervalsInMonth = Math.ceil((daysInMonth - intervalStartDate + 1) / intervalDays);
  
  // Para simplificar, vamos mostrar o primeiro intervalo do mês
  const intervalStart = new Date(currentYear, currentMonth + currentWeekOffset, intervalStartDate);
  const intervalEnd = new Date(currentYear, currentMonth + currentWeekOffset, Math.min(intervalStartDate + intervalDays - 1, daysInMonth));
  
  return `${format(intervalStart, 'dd/MM', { locale: ptBR })} - ${format(intervalEnd, 'dd/MM', { locale: ptBR })}`;
};

export default IntervalCalendarPicker
export { IntervalCalendarPicker as WeekCalendarPicker }