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

  // Função dinâmica para calcular gastos dos últimos 6 meses
  const calculateLastSixMonthsData = async () => {
    try {
      setLoading(true);
      
      // Simular busca no banco de dados - substituir por chamada real
      const mockGastos = await fetchGastosFromDatabase();
      
      const now = new Date();
      const monthsData = [];
      
      for (let i = 6; i >= 1; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Buscar gastos reais deste mês
        const gastosDoMes = mockGastos[monthKey] || 0;
        
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

  // Função para buscar dados do banco - SUBSTITUIR por implementação real
  const fetchGastosFromDatabase = async () => {
    // TODO: Integrar com o banco de dados real via electron API
    // return await window.electronAPI?.gastos.getLastSixMonths() || {};
    
    // Por enquanto, simular dados variáveis baseados na data atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const mockData = {};
    for (let i = 6; i >= 1; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Valores que variam baseado no mês atual (dinâmico)
      const baseValue = Math.floor(Math.random() * 3000) + 1000;
      const seasonalMultiplier = (date.getMonth() % 3 + 1) * 0.8;
      mockData[monthKey] = Math.floor(baseValue * seasonalMultiplier);
    }
    
    console.log('Dados dinâmicos gerados:', mockData);
    return mockData;
  };

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
