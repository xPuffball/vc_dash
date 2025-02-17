import React, { useState } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { COLORS } from '../data/mockData';

const VisualizationCard = ({
  data,
  type,
  title,
  onQuestionClick,
  relatedInsights,
  className = '',
  chartHeight = 300
}) => {
  const [showChat, setShowChat] = useState(false);
  const [followUp, setFollowUp] = useState('');

  // Provide extra margins so labels/legends aren't cut off
  const chartMargin = { top: 20, right: 20, bottom: 20, left: 20 };

  const renderChart = () => {
    switch (type) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                name="Total Investment"
              />
              <Line type="monotone" dataKey="series_a" stroke="#82ca9d" name="Series A" />
              <Line type="monotone" dataKey="series_b" stroke="#ffc658" name="Series B" />
              <Line type="monotone" dataKey="series_c" stroke="#ff7300" name="Series C" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'sector':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={chartMargin}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="sector"
                cx="50%"
                cy="50%"
                outerRadius={Math.min(chartHeight / 2, 100)}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (followUp.trim()) {
      onQuestionClick(followUp.trim());
      setFollowUp('');
    }
  };

  return (
    <Card
      /* 
         Let the entire card be horizontally resizable, 
         no scroll bars, and a minimum width. 
      */
      className={`relative bg-white shadow-lg ${className}`}
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        minWidth: '400px', // Adjust as needed
      }}
    >
      <CardContent className="p-4 flex flex-col">
        {/* Header (toggle chat with MessageSquare) */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{title}</h3>
          <MessageSquare
            className="text-gray-400 cursor-pointer hover:text-blue-600"
            size={20}
            onClick={() => setShowChat(!showChat)}
          />
        </div>

        {/* Chart area with fixed minHeight so Recharts knows how to size */}
        <div style={{ width: '100%', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Follow-up chat toggled by showChat; grows card vertically */}
        {showChat && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
              {relatedInsights.map((insight, idx) => (
                <Alert
                  key={idx}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => onQuestionClick(insight.question)}
                >
                  <div className="flex items-center justify-between">
                    <AlertDescription>{insight.text}</AlertDescription>
                    <ArrowRight size={16} className="text-blue-600" />
                  </div>
                </Alert>
              ))}

              {/* Follow-up question input */}
              <form onSubmit={handleFollowUpSubmit} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="Ask a follow-up question..."
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationCard;
