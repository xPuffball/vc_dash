import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Legend,
  Treemap
} from 'recharts';

// Default colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4CAF50', '#FF5722', '#607D8B'];

// Custom Treemap content component
const CustomizedContent = (props) => {
  const { root, depth, x, y, width, height, index, colors, name, value } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor(index / 2) % colors.length] : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 - 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
        >
          {value}
        </text>
      ) : null}
    </g>
  );
};

const DeepResearch = ({ isOpen, onClose, question, onAddToBoard }) => {
  const [analysisState, setAnalysisState] = useState('idle');
  const [insights, setInsights] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [error, setError] = useState(null);

  // Your OpenAI API key - in a real app, this should be stored securely on the server
  const OPENAI_API_KEY = 'dummy';

  useEffect(() => {
    if (isOpen && question) {
      // Reset state
      setAnalysisState('thinking');
      setInsights([]);
      setVisualizations([]);
      setError(null);
      
      // Call OpenAI API
      fetchAnalysisFromOpenAI(question);
    }
  }, [isOpen, question]);

  // Map DeepResearch types to Dashboard types for compatibility
  const mapTypeForDashboard = (type) => {
    const typeMapping = {
      'lineChart': 'investmentTrend',
      'areaChart': 'investmentTrend',
      'barChart': 'investmentTrend',
      'pieChart': 'topSectors',
      'donutChart': 'topSectors',
      'treemap': 'topSectors',
      'scatterPlot': 'investmentTrend',
      'composedChart': 'dealVolumeAndSize',
      'radarChart': 'investmentTrend',
      'heatmap': 'dealSizeBreakdown',
      'table': 'table',
      'text': 'text',
      'sourceInfo': 'text',
      'comparison': 'dealVolumeAndSize'
    };
    return typeMapping[type] || 'investmentTrend'; // Default to investmentTrend if unknown
  };

  const fetchAnalysisFromOpenAI = async (query) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a sophisticated financial research assistant with access to the latest financial and investment data. Your job is to provide data-driven insights and visualizations based on questions about investments, markets, and financial trends.

              You have the flexibility to generate DIVERSE types of visualizations beyond basic charts. Choose the most appropriate visualization type for the specific data and question.

              When generating visualizations, use REAL data with sources. Your responses should include citation sources and links to where the data came from (e.g., "Source: S&P Global Market Intelligence, Q4 2024").

              Provide your response in the following JSON format:
              {
                "insights": [
                  {
                    "content": "Detailed insight text based on data analysis",
                    "confidence": 0.xx (a number between 0.6 and 0.98),
                    "source": "Source of this information, e.g., 'Federal Reserve Economic Data, February 2025'"
                  }
                ],
                "visualizations": [
                  {
                    "visualType": "[SELECT THE MOST APPROPRIATE TYPE FROM THE LIST BELOW]",
                    "title": "Title of the visualization",
                    "description": "Brief description of what this visualization shows and why it's relevant",
                    "source": "Source of the data, including publication date",
                    "sourceUrl": "URL to the data source if available",
                    "data": [...appropriate data format for the selected visualization type...]
                  }
                ]
              }
              
              AVAILABLE VISUALIZATION TYPES:
              1. "lineChart" - For showing trends over time. 
                 Data format: [{"year": "2020", "total": 450, "category1": 200, "category2": 250}, ...]
              
              2. "areaChart" - For showing cumulative values or ranges over time.
                 Data format: [{"year": "2020", "total": 450, "category1": 200, "category2": 250}, ...]
              
              3. "barChart" - For comparing values across categories.
                 Data format: [{"category": "Tech", "value": 450}, {"category": "Healthcare", "value": 300}, ...]
                 For grouped bars: [{"category": "2020", "group1": 200, "group2": 300}, ...]
              
              4. "pieChart" - For showing proportions of a whole.
                 Data format: [{"sector": "Tech", "value": 35}, {"sector": "Healthcare", "value": 25}, ...]
              
              5. "donutChart" - Similar to pie chart, but with a hole in the middle and better for multiple categories.
                 Data format: [{"name": "Tech", "value": 35}, {"name": "Healthcare", "value": 25}, ...]
              
              6. "treemap" - For showing hierarchical data using nested rectangles.
                 Data format: [{"name": "Tech", "value": 35, "children": [{"name": "Software", "value": 20}, {"name": "Hardware", "value": 15}]}, ...]
              
              7. "scatterPlot" - For showing correlation between two variables.
                 Data format: [{"x": 10, "y": 25, "name": "Company A"}, {"x": 15, "y": 30, "name": "Company B"}, ...]
              
              8. "composedChart" - For combining different chart types (line, bar, area) in one visualization.
                 Data format: [{"year": "2020", "line": 450, "bar": 200, "area": 250}, ...]
              
              9. "radarChart" - For showing multivariate data on a two-dimensional chart.
                 Data format: [{"subject": "Growth", "A": 80, "B": 90, "fullMark": 100}, {"subject": "Risk", "A": 40, "B": 30, "fullMark": 100}, ...]
              
              10. "heatmap" - For showing intensity of values across two categories.
                 Data format: [{"x": "2020", "y": "Q1", "value": 50}, {"x": "2020", "y": "Q2", "value": 70}, ...]
              
              11. "table" - For displaying structured data in rows and columns.
                 Data format: {"headers": ["Column1", "Column2"], "rows": [["Row1Val1", "Row1Val2"], ["Row2Val1", "Row2Val2"]]}
              
              12. "text" - For text-based insights or explanations.
                 Data format: {"content": "Text with <strong>HTML formatting</strong> if needed"}
              
              13. "comparison" - For side-by-side comparisons.
                 Data format: {"categories": ["Metric1", "Metric2"], "item1": {"name": "A", "values": [10, 20]}, "item2": {"name": "B", "values": [15, 25]}}
              
              14. "sourceInfo" - For methodology details and source information.
                 Data format: {"content": "Detailed information about data sources and methodology"}

              Use real, current (as of February 2025) financial data. Include at least 1-2 insights and 2-3 relevant visualizations with proper citations.
              
              For each query, select the MOST APPROPRIATE visualization types that best represent the data and answer the question.
              
              Always ensure your data is properly sourced and cited. Include a sourceInfo visualization that explains data sources and methodology used.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      processOpenAIResponse(data);
    } catch (err) {
      console.error('Error fetching from OpenAI:', err);
      setError('Failed to get analysis. Please try again later.');
      setAnalysisState('error');
    }
  };

  const processOpenAIResponse = (response) => {
    try {
      // Extract the assistant's message content
      const content = response.choices[0].message.content;
      
      // Parse the JSON from the response
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.log('Raw content received:', content);
        
        // Attempt to find and extract JSON from the content
        // Sometimes GPT models wrap JSON in markdown code blocks or add explanatory text
        const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/) || 
                          content.match(/({[\s\S]*})/);
        
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedData = JSON.parse(jsonMatch[1].trim());
          } catch (e) {
            throw new Error('Could not parse JSON from the response');
          }
        } else {
          throw new Error('No valid JSON found in the response');
        }
      }
      
      // Validate that we have the expected structure
      if (!parsedData.insights || !Array.isArray(parsedData.insights) || 
          !parsedData.visualizations || !Array.isArray(parsedData.visualizations)) {
        throw new Error('Response lacks required fields: insights and visualizations arrays');
      }
      
      // Process insights
      const newInsights = parsedData.insights.map((insight, index) => ({
        id: Date.now() + index,
        type: 'insight',
        content: insight.content || "No content provided",
        confidence: insight.confidence || 0.8,
        source: insight.source || "AI analysis",
        timestamp: new Date().toISOString()
      }));
      
      // Process visualizations
      const newVisualizations = parsedData.visualizations.map((viz, index) => {
        // Create a base visualization object
        const baseViz = {
          id: Date.now() + newInsights.length + index,
          type: 'visualization',
          visualType: viz.visualType || 'text',
          title: viz.title || "Untitled Visualization",
          timestamp: new Date().toISOString(),
          description: viz.description || "",
          source: viz.source || "AI generated data",
          sourceUrl: viz.sourceUrl || ""
        };
        
        // Add type-specific properties
        if (viz.visualType === 'table') {
          return {
            ...baseViz,
            headers: viz.data?.headers || [],
            rows: viz.data?.rows || []
          };
        } else if (viz.visualType === 'text' || viz.visualType === 'sourceInfo') {
          return {
            ...baseViz,
            content: viz.content || viz.data?.content || ''
          };
        } else {
          // For all chart types
          return {
            ...baseViz,
            data: viz.data || []
          };
        }
      });
  
      setInsights(newInsights);
      setVisualizations(newVisualizations);
      setAnalysisState('complete');
    } catch (err) {
      console.error('Error processing OpenAI response:', err);
      console.log('Response data:', response);
      setError(`Failed to process AI response: ${err.message}`);
      setAnalysisState('error');
    }
  };

  // Create sample relatedInsights for visualizations
  const generateRelatedInsights = (visualType, title) => {
    // Common follow-up questions based on visualization type
    const commonQuestions = {
      trend: [
        { text: "What factors influenced this trend?", question: `What factors influenced the trend in ${title}?` },
        { text: "Forecast: How might this trend continue?", question: `Based on ${title}, what's the forecast for the next 2 years?` }
      ],
      comparison: [
        { text: "Why are these items different?", question: `Why are there differences in ${title}?` },
        { text: "Which factors explain the gap?", question: `What factors explain the gaps shown in ${title}?` }
      ],
      distribution: [
        { text: "Why is this distribution occurring?", question: `Why is the distribution in ${title} occurring?` },
        { text: "Which segments are growing fastest?", question: `Which segments in ${title} are growing the fastest?` }
      ],
      correlation: [
        { text: "Is there causation behind this correlation?", question: `Is there causation behind the correlation in ${title}?` },
        { text: "What other factors might be at play?", question: `What other factors might influence the relationship shown in ${title}?` }
      ],
      data: [
        { text: "What patterns exist in this data?", question: `What patterns exist in ${title}?` },
        { text: "What insights can we draw from this?", question: `What insights can we draw from ${title}?` }
      ],
      information: [
        { text: "Tell me more about this information", question: `Tell me more about ${title}` },
        { text: "How reliable is this data?", question: `How reliable and current is the data in ${title}?` }
      ]
    };
    
    // Map visualization types to question categories
    const typeToQuestionMap = {
      'lineChart': commonQuestions.trend,
      'areaChart': commonQuestions.trend,
      'barChart': commonQuestions.comparison,
      'pieChart': commonQuestions.distribution,
      'donutChart': commonQuestions.distribution,
      'treemap': commonQuestions.distribution,
      'scatterPlot': commonQuestions.correlation,
      'composedChart': commonQuestions.comparison,
      'radarChart': commonQuestions.comparison,
      'heatmap': commonQuestions.correlation,
      'table': commonQuestions.data,
      'text': commonQuestions.information,
      'comparison': commonQuestions.comparison,
      'sourceInfo': commonQuestions.information
    };
    
    return typeToQuestionMap[visualType] || commonQuestions.data;
  };

  // Render the appropriate chart based on visualization type
  const renderVisualization = (viz) => {
    switch (viz.visualType) {
      case 'lineChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Dynamically render lines based on data properties */}
              {Object.keys(viz.data[0] || {}).filter(key => key !== 'year').map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'areaChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(viz.data[0] || {}).filter(key => key !== 'year').map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'barChart':
        // Check if we have grouped bars or simple bars
        const hasMultipleDataKeys = viz.data[0] && 
          Object.keys(viz.data[0]).filter(key => key !== 'name' && key !== 'category').length > 1;
            
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.data[0]?.hasOwnProperty('category') ? 'category' : 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {hasMultipleDataKeys ? (
                // Multiple data keys = grouped bars
                Object.keys(viz.data[0] || {})
                  .filter(key => key !== 'name' && key !== 'category')
                  .map((key, index) => (
                    <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
                  ))
              ) : (
                // Single data key = simple bars
                <Bar 
                  dataKey={Object.keys(viz.data[0] || {}).find(key => key !== 'name' && key !== 'category') || 'value'} 
                  fill="#8884d8" 
                >
                  {viz.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pieChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={viz.data}
                dataKey="value"
                nameKey={viz.data[0]?.hasOwnProperty('sector') ? 'sector' : 'name'}
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {viz.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'donutChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={viz.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                label
              >
                {viz.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={viz.data}
              dataKey="value"
              nameKey="name"
              ratio={4/3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent colors={COLORS} />}
            />
          </ResponsiveContainer>
        );
        
      case 'scatterPlot':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="x" />
              <YAxis type="number" dataKey="y" name="y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Values" data={viz.data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'composedChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={viz.data}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="year" scale="band" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Check for different data types and render appropriate components */}
              {viz.data[0]?.hasOwnProperty('bar') && 
                <Bar dataKey="bar" barSize={20} fill="#413ea0" />}
              {viz.data[0]?.hasOwnProperty('line') && 
                <Line type="monotone" dataKey="line" stroke="#ff7300" />}
              {viz.data[0]?.hasOwnProperty('area') && 
                <Area type="monotone" dataKey="area" fill="#8884d8" stroke="#8884d8" />}
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'radarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={60} data={viz.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {/* Get all possible data keys except 'subject' and 'fullMark' */}
              {Object.keys(viz.data[0] || {})
                .filter(key => key !== 'subject' && key !== 'fullMark')
                .map((key, index) => (
                  <Radar 
                    key={key}
                    name={key} 
                    dataKey={key} 
                    stroke={COLORS[index % COLORS.length]} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={0.6} 
                  />
                ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'heatmap':
        // Custom heat map rendering
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-1"></th>
                    {/* Extract unique x values */}
                    {[...new Set(viz.data.map(item => item.x))].map(x => (
                      <th key={x} className="p-1 text-xs text-center">{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Group by y value */}
                  {[...new Set(viz.data.map(item => item.y))].map(y => (
                    <tr key={y}>
                      <td className="p-1 text-xs font-medium">{y}</td>
                      {[...new Set(viz.data.map(item => item.x))].map(x => {
                        // Find matching data point
                        const cell = viz.data.find(item => item.x === x && item.y === y);
                        // Calculate color intensity based on value
                        const intensity = cell ? Math.min(Math.max(cell.value / 100, 0), 1) : 0;
                        const bgColor = `rgba(0, 136, 254, ${intensity})`;
                        // Determine text color based on background intensity
                        const textColor = intensity > 0.5 ? 'white' : 'black';
                        
                        return (
                          <td 
                            key={`${x}-${y}`} 
                            className="p-2 text-xs text-center" 
                            style={{ backgroundColor: bgColor, color: textColor }}
                          >
                            {cell ? cell.value : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div className="overflow-auto h-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {viz.headers.map((header, idx) => (
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
                {viz.rows.map((row, rowIdx) => (
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
      case 'sourceInfo':
        return (
          <div className="overflow-auto h-full p-2">
            <div 
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: viz.content }}
            />
          </div>
        );
        
      case 'comparison':
        // Custom comparison chart
        return (
          <div className="w-full h-full overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600">Metric</th>
                  {viz.data.item1 && <th className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600">{viz.data.item1.name}</th>}
                  {viz.data.item2 && <th className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600">{viz.data.item2.name}</th>}
                  {viz.data.item3 && <th className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600">{viz.data.item3.name}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viz.data.categories.map((category, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">{category}</td>
                    {viz.data.item1 && <td className="px-4 py-2 text-sm text-gray-800">{viz.data.item1.values[idx]}</td>}
                    {viz.data.item2 && <td className="px-4 py-2 text-sm text-gray-800">{viz.data.item2.values[idx]}</td>}
                    {viz.data.item3 && <td className="px-4 py-2 text-sm text-gray-800">{viz.data.item3.values[idx]}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-gray-500">Unknown visualization type: {viz.visualType}</p>
          </div>
        );
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              <span>Gathering current financial data and insights...</span>
            </div>
          ) : analysisState === 'error' ? (
            <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Insights Section */}
              {insights.length > 0 && (
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
                          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-2">
                                Confidence: {(insight.confidence * 100).toFixed(0)}%
                              </span>
                              •
                              <span className="ml-2">
                                {new Date(insight.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {insight.source && (
                              <div className="text-blue-600 text-xs italic">
                                Source: {insight.source}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onAddToBoard({
                              type: 'text',
                              content: `${insight.content}\n\nSource: ${insight.source || "AI analysis"}`,
                              title: 'Research Insight',
                              position: { x: 100, y: 100 }
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Add to Board
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visualizations Section */}
              {visualizations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Data Visualizations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visualizations.map((viz) => (
                      <div key={viz.id} className="border rounded-lg p-4">
                        <div className="mb-2 flex justify-between items-start">
                          <h5 className="font-medium">{viz.title}</h5>
                          <button
                            onClick={() => {
                              // Create a dashboard-compatible object
                              const mappedType = mapTypeForDashboard(viz.visualType);
                              
                              // Create the board item with the appropriate structure
                              const boardItem = {
                                type: mappedType,
                                title: viz.title,
                                position: { x: 100, y: 100 },
                                // Add description and source information
                                description: viz.description,
                                source: viz.source,
                                sourceUrl: viz.sourceUrl,
                                // Add related insights for better user experience
                                relatedInsights: generateRelatedInsights(viz.visualType, viz.title)
                              };
                              
                              // Add appropriate data based on type
                              if (viz.visualType === 'table') {
                                boardItem.headers = viz.headers;
                                boardItem.rows = viz.rows;
                              } else if (viz.visualType === 'text' || viz.visualType === 'sourceInfo') {
                                // Include source in the content
                                const sourceInfo = viz.source ? `\n\nSource: ${viz.source}` : '';
                                boardItem.content = viz.content + sourceInfo;
                              } else {
                                // For all chart types
                                boardItem.data = viz.data;
                              }
                              
                              console.log("Adding to board:", boardItem);
                              onAddToBoard(boardItem);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Add to Board
                          </button>
                        </div>
                        
                        {/* Description if available */}
                        {viz.description && (
                          <p className="text-sm text-gray-600 mb-2">{viz.description}</p>
                        )}
                        
                        <div className="h-48">
                          {renderVisualization(viz)}
                        </div>
                        
                        {/* Source Information */}
                        {viz.source && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                            <div>
                              Source: {viz.source}
                            </div>
                            {viz.sourceUrl && (
                              <a 
                                href={viz.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                View Source <ExternalLink size={12} className="ml-1" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.length === 0 && visualizations.length === 0 && analysisState === 'complete' && (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
                  No insights could be generated. Try refining your question or query.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default DeepResearch;