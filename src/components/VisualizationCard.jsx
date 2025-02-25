import React, { useState } from 'react';
import { MessageSquare, ArrowRight, X } from 'lucide-react';
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

// Default colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4CAF50'];

const VisualizationCard = ({
  data,
  type,
  title,
  onQuestionClick,
  onDelete,
  relatedInsights = [],
  className = '',
  chartHeight = 300,
  // New props for additional visualization types
  imageUrl,
  prompt,
  content,
  headers,
  rows,
  description
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
              {data[0]?.series_a !== undefined && (
                <Line type="monotone" dataKey="series_a" stroke="#82ca9d" name="Series A" />
              )}
              {data[0]?.series_b !== undefined && (
                <Line type="monotone" dataKey="series_b" stroke="#ffc658" name="Series B" />
              )}
              {data[0]?.series_c !== undefined && (
                <Line type="monotone" dataKey="series_c" stroke="#ff7300" name="Series C" />
              )}
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
      case 'image':
        return (
          <div className="flex items-center justify-center h-full overflow-hidden">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title || 'AI Generated Image'} 
                className="max-h-full max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-center p-4 bg-gray-100 rounded w-full h-full flex items-center justify-center">
                <div>
                  <p className="text-sm text-gray-600">Image unavailable</p>
                  {prompt && (
                    <p className="text-xs text-gray-500 mt-2">Prompt: {prompt}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'table':
        return (
          <div className="overflow-auto h-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {headers && headers.map((header, idx) => (
                    <th 
                      key={idx}
                      className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows && rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td 
                        key={cellIdx}
                        className="px-4 py-2 text-sm text-gray-800"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'text':
        return (
          <div className="overflow-auto h-full p-2">
            <div className="prose prose-sm">
              {content}
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="overflow-auto h-full p-2 bg-gray-50 rounded">
            <div className="text-sm">
              {description && (
                <>
                  <p className="font-medium">Description:</p>
                  <p className="text-gray-700 mb-2">{description}</p>
                </>
              )}
              {data && (
                <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
                  {typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
                </pre>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-gray-500">Unknown visualization type: {type}</p>
          </div>
        );
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
    <Card className={`relative bg-white shadow-lg ${className}`}>
      <CardContent className="p-4 flex flex-col">
        {/* Header with title, delete, and chat icons */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <MessageSquare
              className="text-gray-400 cursor-pointer hover:text-blue-600"
              size={20}
              onClick={() => setShowChat(!showChat)}
            />
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 flex items-center justify-center w-6 h-6"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div style={{ width: '100%', height: chartHeight }}>
          {renderChart()}
        </div>

        {/* Follow-up chat section */}
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