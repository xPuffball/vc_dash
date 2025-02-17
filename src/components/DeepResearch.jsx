import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import { mockTrendData, mockSectorData, COLORS } from '../data/mockData';

const DeepResearch = ({ isOpen, onClose, question, onAddToBoard }) => {
  const [analysisState, setAnalysisState] = useState('thinking');
  const [insights, setInsights] = useState([]);
  const [visualizations, setVisualizations] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setAnalysisState('thinking');
      // Simulate AI processing
      setTimeout(() => {
        const newInsights = [
          {
            id: Date.now(),
            type: 'insight',
            content:
              'Statistical analysis reveals strong positive correlation (0.85) between total investment and number of deals',
            confidence: 0.85,
            timestamp: new Date().toISOString()
          },
          {
            id: Date.now() + 1,
            type: 'insight',
            content:
              'Year-over-year growth shows acceleration in AI/ML sector investments',
            confidence: 0.92,
            relatedData: mockTrendData,
            timestamp: new Date().toISOString()
          }
        ];

        const newVisualizations = [
          {
            id: Date.now() + 2,
            type: 'visualization',
            visualType: 'trend',
            title: 'Investment Growth Trend',
            data: mockTrendData,
            timestamp: new Date().toISOString()
          },
          {
            id: Date.now() + 3,
            type: 'visualization',
            visualType: 'sector',
            title: 'Sector Distribution',
            data: mockSectorData,
            timestamp: new Date().toISOString()
          }
        ];

        setInsights(newInsights);
        setVisualizations(newVisualizations);
        setAnalysisState('complete');
      }, 1500);
    }
  }, [isOpen, question]);

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-2/3 max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Research Assistant</h3>
            <X className="cursor-pointer" onClick={onClose} />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">Analyzing:</p>
            <p className="font-medium">{question}</p>
          </div>

          {analysisState === 'thinking' ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent"></div>
              <span>Performing statistical analysis...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Insights Section */}
              <div>
                <h4 className="font-medium mb-3">Key Insights</h4>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <Alert>
                          <AlertDescription>{insight.content}</AlertDescription>
                        </Alert>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="mr-2">
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                          •
                          <span className="ml-2">
                            {new Date(insight.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onAddToBoard({
                            type: 'text',
                            content: insight.content,
                            position: { x: 100, y: 100 },
                            metadata: {
                              confidence: insight.confidence,
                              timestamp: insight.timestamp
                            }
                          })
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Add to Board
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visualizations Section */}
              <div>
                <h4 className="font-medium mb-3">Related Visualizations</h4>
                <div className="grid grid-cols-2 gap-4">
                  {visualizations.map((viz) => (
                    <div key={viz.id} className="border rounded-lg p-4">
                      <div className="mb-2 flex justify-between items-start">
                        <h5 className="font-medium">{viz.title}</h5>
                        <button
                          onClick={() =>
                            onAddToBoard({
                              type: viz.visualType,
                              title: viz.title,
                              data: viz.data,
                              position: { x: 100, y: 100 },
                              metadata: {
                                timestamp: viz.timestamp
                              }
                            })
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Add to Board
                        </button>
                      </div>
                      <div className="h-48">
                        {viz.visualType === 'trend' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={viz.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="total" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={viz.data}
                                dataKey="value"
                                nameKey="sector"
                                cx="50%"
                                cy="50%"
                                outerRadius={45}
                              >
                                {viz.data.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default DeepResearch;
