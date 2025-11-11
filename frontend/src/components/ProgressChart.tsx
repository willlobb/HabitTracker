import { ProgressData } from '../utils/progress';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProgressChartProps {
  data: ProgressData;
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.dailyData.map(day => ({
    date: format(new Date(day.date), 'MMM d'),
    completed: day.completed ? 1 : 0,
    value: day.value,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="completed" fill="#f59e0b">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.completed ? '#f59e0b' : '#e5e7eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

