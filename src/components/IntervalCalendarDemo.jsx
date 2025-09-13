import React, { useState } from 'react'
import { IntervalCalendarPicker } from './WeekCalendarPicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function IntervalCalendarDemo() {
  const [selectedWeekMon, setSelectedWeekMon] = useState(null)
  const [selectedWeekSun, setSelectedWeekSun] = useState(null)
  const [selectedWeekWed, setSelectedWeekWed] = useState(null)

  const formatInterval = (interval) => {
    if (!interval) return 'Nenhuma semana selecionada'
    return `${format(interval.start, 'dd/MM/yyyy', { locale: ptBR })} até ${format(interval.end, 'dd/MM/yyyy', { locale: ptBR })} (7 dias)`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Demonstração do Calendário de Semanas</h1>
        <p className="text-muted-foreground">
          Teste diferentes configurações de início de semana
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Semana Segunda a Domingo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Segunda a Domingo
              <Badge variant="secondary">Padrão</Badge>
            </CardTitle>
            <CardDescription>
              Semana tradicional brasileira
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntervalCalendarPicker
              weekStartDay={1} // Segunda-feira
              onIntervalChange={setSelectedWeekMon}
              placeholder="Selecione uma semana"
            />
            <div className="text-sm text-muted-foreground">
              <strong>Selecionado:</strong> {formatInterval(selectedWeekMon)}
            </div>
          </CardContent>
        </Card>

        {/* Semana Domingo a Sábado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Domingo a Sábado
              <Badge variant="secondary">Internacional</Badge>
            </CardTitle>
            <CardDescription>
              Semana padrão internacional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntervalCalendarPicker
              weekStartDay={0} // Domingo
              onIntervalChange={setSelectedWeekSun}
              placeholder="Selecione uma semana"
            />
            <div className="text-sm text-muted-foreground">
              <strong>Selecionado:</strong> {formatInterval(selectedWeekSun)}
            </div>
          </CardContent>
        </Card>

        {/* Semana Quarta a Terça */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Quarta a Terça
              <Badge variant="secondary">Personalizada</Badge>
            </CardTitle>
            <CardDescription>
              Exemplo de configuração personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntervalCalendarPicker
              weekStartDay={3} // Quarta-feira
              onIntervalChange={setSelectedWeekWed}
              placeholder="Selecione uma semana"
            />
            <div className="text-sm text-muted-foreground">
              <strong>Selecionado:</strong> {formatInterval(selectedWeekWed)}
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Resumo das seleções */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Seleções</CardTitle>
          <CardDescription>
            Visualize todas as semanas selecionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Semanas Selecionadas:</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>Seg-Dom:</strong> {formatInterval(selectedWeekMon)}</li>
                <li><strong>Dom-Sáb:</strong> {formatInterval(selectedWeekSun)}</li>
                <li><strong>Qua-Ter:</strong> {formatInterval(selectedWeekWed)}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Características:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Semanas de 7 dias fixos</li>
                <li>✓ Dia de início personalizável</li>
                <li>✓ Navegação por meses</li>
                <li>✓ Feedback visual claro</li>
                <li>✓ Compatibilidade com design system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IntervalCalendarDemo