import React, { useState, useEffect } from 'react';
import { TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function GastosMensalChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Buscar gastos dos últimos 6 meses via IPC
  const calculateLastSixMonthsData = async () => {
    try {
      setLoading(true);
      const res = await window.electronAPI?.reports?.gastosMensais?.();
      const now = new Date();
      const monthsData = [];
      for (let i = 6; i >= 1; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = date.getMonth() + 1;
        const gastosDoMes = res?.success
          ? (res.data.find((d) => d.year === year && d.month === monthKey)?.value || 0)
          : 0;
        monthsData.push({
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1, 3),
          value: gastosDoMes,
          fullDate: date,
          monthYear: `${monthName} ${year}`
        });
      }
      
      setChartData(monthsData);
      
    } catch (error) {
      console.error('Erro ao buscar dados dos gastos:', error);
      // Fallback para dados de exemplo se der erro
      setChartData([
        { month: "Mar", value: 1200, monthYear: "Mar 2024" },
        { month: "Abr", value: 2800, monthYear: "Abr 2024" },
        { month: "Mai", value: 4500, monthYear: "Mai 2024" },
        { month: "Jun", value: 1800, monthYear: "Jun 2024" },
        { month: "Jul", value: 3200, monthYear: "Jul 2024" },
        { month: "Ago", value: 2100, monthYear: "Ago 2024" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // removeu mock local

  // Carregar dados ao montar o componente
  useEffect(() => {
    calculateLastSixMonthsData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gastos com Diárias Mensal
          </CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Gastos com Diárias Mensal
        </CardTitle>
        <CardDescription>
          Últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ChartContainer
            config={{
              value: {
                label: "Gastos",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full w-full"
          >
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
              barCategoryGap="5%"
            >
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                className="text-xs"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis hide />
              <ChartTooltip 
                cursor={false}
                content={<ChartTooltipContent 
                  formatter={(value, name, props) => [
                    `R$ ${value.toLocaleString('pt-BR')}`,
                    'Gastos'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.monthYear;
                    }
                    return label;
                  }}
                />}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                style={{ transition: 'filter 0.2s ease' }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={hoveredIndex === index ? 'var(--primary)' : 'var(--accent)'}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
                <LabelList 
                  dataKey="value"
                  position="top"
                  formatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                  className="text-xs font-medium"
                  fill="var(--foreground)"
                  offset={5}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
