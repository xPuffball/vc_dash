// Modified Dashboard.jsx Component to include Regional Analysis page

import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  BarChart2,
  X,
  ArrowRight,
  MessageSquare,
  FileText,
  Globe // Added for Regional icon
} from 'lucide-react';
import Sidebar from './Sidebar';
import DeepResearch from './DeepResearch';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  AreaChart, Area,
  ComposedChart
} from 'recharts';

// Import our data sources
import {
  totalInvestmentByYear, 
  totalInvestmentBySector, 
  investmentVolumeByYear, 
  investmentAvgByYear,
  investmentPercentageByCategory,
  investmentAmountDollarByCategory,
  COLORS
} from '../data/questionOneData';

// Import regional visualization components and functions
import { 
  createRegionalDashboardItems, 
  regionalVisualizations 
} from './RegionalAnalysis';

// Transform data for visualizations
const transformData = () => {
  // Investment trend data
  const investmentTrendData = totalInvestmentByYear.map(item => ({
    year: item.year,
    total: Math.round(item.amount / 1000000) // Convert to millions
  }));

  // Top sectors data
  const topSectorData = [...totalInvestmentBySector]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(item => ({
      sector: item.sectorTag,
      value: Math.round(item.amount / 1000000000 * 100) / 100 // Convert to billions with 2 decimal places
    }));

  // Deal volume and size data
  const dealVolumeAndSizeData = investmentVolumeByYear.map((item) => {
    // Find matching average investment size for this year
    const avgItem = investmentAvgByYear.find(avg => avg.year === item.year);
    return {
      year: item.year,
      volume: item.amount,
      avgSize: avgItem ? Math.round(avgItem.amount / 1000000 * 10) / 10 : 0 // Convert to millions with 1 decimal
    };
  });

  // Deal size breakdown data
  const dealSizeBreakdownData = investmentPercentageByCategory.map(item => ({
    year: item.year,
    "Mega Deals ($100M+)": item["$100M+"],
    "Large ($5M-$100M)": item["$5M-$100M"],
    "Medium ($1M-$5M)": item["$1M-$5M"],
    "Small ($100K-$1M)": item["$100K-$1M"],
    "Micro (<$100K)": item["<$100K"]
  }));

  // Growth rate data
  const yoyGrowthData = totalInvestmentByYear.map((item, index, arr) => {
    let growthRate = 0;
    if (index > 0) {
      const prevAmount = arr[index - 1].amount;
      growthRate = prevAmount !== 0 ? ((item.amount - prevAmount) / prevAmount) * 100 : 0;
    }
    return {
      year: item.year,
      growthRate: Math.round(growthRate * 10) / 10 // Round to 1 decimal place
    };
  }).filter((_, index) => index > 0); // Remove first year

  return {
    investmentTrendData,
    topSectorData,
    dealVolumeAndSizeData,
    dealSizeBreakdownData,
    yoyGrowthData
  };
};

// Function to create dashboard items for the Investment Trends dashboard
const createInvestmentDashboardItems = () => {
  const {
    investmentTrendData,
    topSectorData,
    dealVolumeAndSizeData,
    dealSizeBreakdownData,
    yoyGrowthData
  } = transformData();

  return [
    {
      id: 1,
      type: 'investmentTrend',
      data: investmentTrendData,
      title: 'Total Investment by Year (Millions USD)',
      position: { x: 100, y: 100 },
      relatedInsights: [
        {
          text: `Investment increased by 58.1% in 2024 compared to 2023`,
          question: "What factors drove the 2024 investment growth?"
        },
        {
          text: `2021 had the highest investment at $14.03B`,
          question: "Why was 2021 such a strong year for investment?"
        }
      ]
    },
    {
      id: 2,
      type: 'topSectors',
      data: topSectorData,
      title: 'Top 5 Sectors by Investment (Billions USD)',
      position: { x: 700, y: 100 },
      relatedInsights: [
        {
          text: `Software & Cloud leads with $8.96B in investments`,
          question: "What's driving growth in the Software & Cloud sector?"
        },
        {
          text: `Health & Biotech is the second highest sector with $5.73B`,
          question: "How does Health & Biotech compare to other sectors?"
        }
      ]
    },
    {
      id: 3,
      type: 'dealVolumeAndSize',
      data: dealVolumeAndSizeData,
      title: 'Deal Volume vs. Average Deal Size',
      position: { x: 100, y: 450 },
      relatedInsights: [
        {
          text: "Average deal size increased while volume decreased after 2021",
          question: "Why are deals getting larger but fewer in number?"
        },
        {
          text: "2024 average deal size reached $35.8M, the highest in the dataset",
          question: "What's causing the shift toward larger deals in 2024?"
        }
      ]
    },
    {
      id: 4,
      type: 'dealSizeBreakdown',
      data: dealSizeBreakdownData,
      title: 'Investment Distribution by Deal Size (%)',
      position: { x: 700, y: 450 },
      relatedInsights: [
        {
          text: "Mega deals ($100M+) reached 69.1% of all investment in 2024",
          question: "What's driving the concentration of capital in mega deals?"
        },
        {
          text: "Small deals ($100K-$1M) decreased from 0.84% in 2019 to 0.03% in 2024",
          question: "Why are small deals becoming less common?"
        }
      ]
    },
    {
      id: 5,
      type: 'yoyGrowth',
      data: yoyGrowthData,
      title: 'Year-over-Year Investment Growth (%)',
      position: { x: 400, y: 800 },
      relatedInsights: [
        {
          text: "Investment growth has been volatile, with a sharp 222% increase in 2021",
          question: "What caused the dramatic investment surge in 2021?"
        },
        {
          text: "2023 saw a decline of 41.1% before recovering in 2024",
          question: "What market factors led to the 2023 investment decline?"
        }
      ]
    }
  ];
};

// VisualizationCard component
const VisualizationCard = ({ data, type, title, onQuestionClick, onDelete, relatedInsights, className = '', chartHeight = 300, updateTextBoxContent }) => {
  const [showChat, setShowChat] = useState(false);
  const [followUp, setFollowUp] = useState('');

  // Provide margins so labels/legends aren't cut off
  const chartMargin = { top: 20, right: 20, bottom: 35, left: 20 };

  const renderChart = () => {
    // Handle regional visualization types
    if (Object.keys(regionalVisualizations).includes(type)) {
      const RegionalComponent = regionalVisualizations[type];
      return <RegionalComponent data={data} title={title} />;
    }

    switch (type) {
      case 'investmentTrend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                label={{ value: 'Millions USD', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()} M`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total" 
                name="Total Investment" 
                stroke="#0088FE" 
                fill="#0088FE" 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'topSectors':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={chartMargin}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="sector"
                cx="50%"
                cy="50%"
                outerRadius={Math.min(chartHeight / 2.2, 100)}
                label={({ sector, value }) => `${sector}: $${value}B`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}B`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'dealVolumeAndSize':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                label={{ value: 'Deal Count', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                label={{ value: 'Avg Size (M)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip formatter={(value, name) => [
                name === "volume" ? value : `$${value}M`,
                name === "volume" ? "Number of Deals" : "Average Deal Size"
              ]} />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="volume" 
                name="Deal Volume" 
                fill="#0088FE" 
                barSize={20} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avgSize" 
                name="Avg Deal Size" 
                stroke="#FF8042" 
                strokeWidth={2} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'dealSizeBreakdown':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(tick) => `${tick}%`} />
              <Tooltip 
                formatter={(value) => `${value.toFixed(1)}%`}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              <Bar dataKey="Mega Deals ($100M+)" fill="#00838F" />
              <Bar dataKey="Large ($5M-$100M)" fill="#00ACC1" />
              <Bar dataKey="Medium ($1M-$5M)" fill="#26C6DA" />
              <Bar dataKey="Small ($100K-$1M)" fill="#80DEEA" />
              <Bar dataKey="Micro (<$100K)" fill="#E0F7FA" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'yoyGrowth':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Growth (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar 
                dataKey="growthRate" 
                name="YoY Growth Rate" 
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.growthRate >= 0 ? "#00C49F" : "#FF8042"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'text':
        return (
          <div 
            className="w-full h-full min-h-[100px] bg-white p-2 rounded overflow-auto"
            style={{ backgroundColor: '#fffef0' }} // Light yellow background for notes
          >
            <textarea
              className="w-full h-full resize-none border-0 bg-transparent focus:outline-none"
              value={data.content || ''}
              onChange={(e) => updateTextBoxContent(data.id, e.target.value)}
              placeholder="Enter your notes here..."
            />
          </div>
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
    <div className="relative bg-white shadow-lg rounded-lg">
      <div className="p-4 flex flex-col">
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

        <div style={{ width: '100%', height: chartHeight }}>
          {renderChart()}
        </div>

        {showChat && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
              {relatedInsights?.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-blue-100 bg-blue-50 rounded-md text-blue-800 cursor-pointer hover:bg-blue-100"
                  onClick={() => onQuestionClick(insight.question)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{insight.text}</p>
                    <ArrowRight size={16} className="text-blue-600" />
                  </div>
                </div>
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
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [deepResearch, setDeepResearch] = useState({ open: false, question: '' });
  
  // Initialize folders with sample data including the new Regional Analysis dashboard
  const [folders, setFolders] = useState([
    {
      id: 1,
      name: 'Investment Analysis',
      icon: <TrendingUp size={18} />,
      iconType: 'investment',
      dashboards: [
        { id: 1, name: 'Investment Trends 2024', starred: true },
        { id: 2, name: 'Series A Analysis', starred: false }
      ],
      expanded: true
    },
    {
      id: 2,
      name: 'Sector Deep Dives',
      icon: <BarChart2 size={18} />,
      iconType: 'chart',
      dashboards: [
        { id: 3, name: 'AI/ML Sector Overview', starred: true },
        { id: 4, name: 'FinTech Momentum', starred: false }
      ],
      expanded: false
    },
    {
      id: 3, // New folder for Regional Analysis
      name: 'Regional Analysis',
      icon: <Globe size={18} />,
      iconType: 'global',
      dashboards: [
        { id: 5, name: 'Regional Investment Breakdown', starred: true },
      ],
      expanded: false
    }
  ]);

  // State for the active dashboard
  const [activeDashboard, setActiveDashboard] = useState({
    folderId: 1,
    dashboardId: 1,
    name: 'Investment Trends 2024'
  });

  // Function to get dashboard items based on the active dashboard
  const getDashboardItems = (dashboardId) => {
    switch (dashboardId) {
      case 1: // Investment Trends 2024
        return createInvestmentDashboardItems();
      case 5: // Regional Investment Breakdown
        return createRegionalDashboardItems();
      default:
        return [];
    }
  };

  // Initialize dashboard items based on the active dashboard
  const [dashboardItems, setDashboardItems] = useState(getDashboardItems(activeDashboard.dashboardId));

  // Text box counter for creating unique IDs
  const [textBoxCounter, setTextBoxCounter] = useState(1);

  // Load the appropriate dashboard when the active dashboard changes
  useEffect(() => {
    setDashboardItems(getDashboardItems(activeDashboard.dashboardId));
  }, [activeDashboard.dashboardId]);

  // Add a new text box to the dashboard
  const addTextBox = () => {
    const newId = Date.now();
    setDashboardItems((prev) => [
      ...prev,
      {
        id: newId,
        type: 'text',
        content: `Text Box ${textBoxCounter}`,
        title: `Note ${textBoxCounter}`,
        position: { x: 400, y: 300 },
      }
    ]);
    setTextBoxCounter(prev => prev + 1);
  };

  // Update text box content
  const updateTextBoxContent = (id, content) => {
    setDashboardItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, content } : item
      )
    );
  };

  // Linking state for connections between items
  const [linking, setLinking] = useState({
    active: false,
    fromId: null,
    fromPos: null,
    currentPos: null
  });

  useEffect(() => {
    if (linking.active) {
      // Prevent text selection during link-drag
      document.body.style.userSelect = 'none';

      const onMouseMove = (e) => {
        setLinking((prev) => ({
          ...prev,
          currentPos: { x: e.clientX, y: e.clientY }
        }));
      };

      const onMouseUp = (e) => {
        // On mouse up, see if we dropped on another item
        document.body.style.userSelect = ''; // restore userSelect

        const targetEl = document.elementFromPoint(e.clientX, e.clientY);
        if (targetEl) {
          const targetItemEl = targetEl.closest('.dashboard-item');
          if (targetItemEl) {
            const targetIdStr = targetItemEl.getAttribute('data-id');
            const targetId = parseInt(targetIdStr, 10);
            if (targetId && targetId !== linking.fromId) {
              // Add connection to both items for bidirectional linking
              setDashboardItems((items) => {
                const newItems = [...items];
                
                // Find source and target items
                const sourceItem = newItems.find(item => item.id === linking.fromId);
                const targetItem = newItems.find(item => item.id === targetId);
                
                // Only proceed if both items exist
                if (sourceItem && targetItem) {
                  // Add connection to source item
                  const sourceConnections = sourceItem.connections ? [...sourceItem.connections] : [];
                  if (!sourceConnections.some(conn => conn.targetId === targetId)) {
                    sourceConnections.push({ targetId });
                    sourceItem.connections = sourceConnections;
                  }
                }
                
                return newItems;
              });
              
              // Give visual feedback that connection was made
              const feedback = document.createElement('div');
              feedback.className = 'fixed z-50 bg-green-500 text-white px-3 py-1 rounded-md text-sm';
              feedback.style.left = `${e.clientX}px`;
              feedback.style.top = `${e.clientY - 30}px`;
              feedback.textContent = 'Connected!';
              document.body.appendChild(feedback);
              
              setTimeout(() => {
                document.body.removeChild(feedback);
              }, 1000);
            }
          }
        }
        setLinking({ active: false, fromId: null, fromPos: null, currentPos: null });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [linking.active, linking.fromId]);

  // Handle dragging items
  const handleDragStart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX - (item.position?.x || 0);
    const startY = e.clientY - (item.position?.y || 0);

    const onMouseMove = (moveEvent) => {
      const newX = Math.max(0, moveEvent.clientX - startX);
      const newY = Math.max(0, moveEvent.clientY - startY);
      setDashboardItems((items) =>
        items.map((i) =>
          i.id === item.id ? { ...i, position: { x: newX, y: newY } } : i
        )
      );
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Handle linking items
  const handleLinkStart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const itemEl = document.getElementById(`item-${item.id}`);
    if (itemEl) {
      const rect = itemEl.getBoundingClientRect();
      const startPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      setLinking({
        active: true,
        fromId: item.id,
        fromPos: startPos,
        currentPos: startPos
      });
    }
  };

  // Handle question submission
  const handleQuestionSubmit = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setDeepResearch({
        open: true,
        question: query
      });
      setQuery('');
    }
  };

  // Add new visualization to the board
  const handleAddToBoard = (item) => {
    setDashboardItems((prev) => [
      ...prev,
      {
        ...item,
        id: Date.now(),
        position: { x: 100, y: 100 }
      }
    ]);
  };

  // Handle dashboard selection from sidebar
  const handleDashboardSelect = ({ folderId, dashboardId }) => {
    // Find the selected dashboard
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const dashboard = folder.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) return;

    // Update the active dashboard
    setActiveDashboard({
      folderId,
      dashboardId,
      name: dashboard.name
    });
    
    console.log(`Switched to dashboard: ${dashboard.name}`);
  };

  // Save the current dashboard
  const saveDashboard = () => {
    console.log(`Saving dashboard: ${activeDashboard.name}`);
    
    // In a real app, you would save the dashboard state to a database here
    // For this demo, we'll just show a success message
    const feedback = document.createElement('div');
    feedback.className = 'fixed z-50 bg-green-500 text-white px-3 py-1 rounded-md text-sm';
    feedback.style.left = '50%';
    feedback.style.top = '20px';
    feedback.style.transform = 'translateX(-50%)';
    feedback.textContent = `Dashboard "${activeDashboard.name}" saved successfully!`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        folders={folders} 
        setFolders={setFolders}
        onDashboardSelect={handleDashboardSelect}
        activeDashboard={activeDashboard}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="shadow-sm p-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleQuestionSubmit}
                placeholder="Ask anything about the investment data..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center ml-4">
              <h1 className="text-lg font-semibold">{activeDashboard.name}</h1>
              <button
                onClick={saveDashboard}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Area */}
        <div
          className="flex-1 relative overflow-auto"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
          }}
        >
          {/* Dashboard Welcome Message when no items exist */}
          {dashboardItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Dashboard</h2>
                <p className="text-gray-600 mb-6">
                  This dashboard is currently empty. You can add visualizations using the buttons below, 
                  or create text notes to organize your research.
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={addTextBox}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FileText size={18} className="mr-2" />
                    Add Note
                  </button>
                  <button
                    onClick={() => {
                      setDeepResearch({ open: true, question: 'Create a new visualization' });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Visualization
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SVG Overlay for Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Permanent Connections */}
            {dashboardItems.map((item) =>
              item.connections?.map((connection, idx) => {
                const sourceEl = document.getElementById(`item-${item.id}`);
                const targetEl = document.getElementById(`item-${connection.targetId}`);
                const containerEl = document.getElementById('dashboard-container');
                
                if (sourceEl && targetEl && containerEl) {
                  // Get the bounding rectangles for source and target
                  const sourceRect = sourceEl.getBoundingClientRect();
                  const targetRect = targetEl.getBoundingClientRect();
                  
                  // Get the container's position
                  const containerRect = containerEl.getBoundingClientRect();
                  
                  // Calculate connection points (from the bottom right of source to the bottom right of target)
                  const sourceConnector = {
                    x: sourceRect.right - containerRect.left - 14, // Position of the blue connection dot
                    y: sourceRect.bottom - containerRect.top - 14
                  };
                  
                  const targetConnector = {
                    x: targetRect.right - containerRect.left - 14,
                    y: targetRect.bottom - containerRect.top - 14
                  };
                  
                  // Create a curved path between the two points
                  const path = `
                    M ${sourceConnector.x} ${sourceConnector.y}
                    C ${sourceConnector.x} ${sourceConnector.y + 50},
                      ${targetConnector.x} ${targetConnector.y + 50},
                      ${targetConnector.x} ${targetConnector.y}
                  `;
                  
                  return (
                    <g key={`connection-${item.id}-${connection.targetId}`}>
                      {/* Connection line */}
                      <path
                        d={path}
                        stroke="#3b82f6" // Blue color
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                      
                      {/* Small circles at connection endpoints for visual clarity */}
                      <circle 
                        cx={sourceConnector.x} 
                        cy={sourceConnector.y} 
                        r="3" 
                        fill="#3b82f6" 
                      />
                      <circle 
                        cx={targetConnector.x} 
                        cy={targetConnector.y} 
                        r="3" 
                        fill="#3b82f6" 
                      />
                    </g>
                  );
                }
                return null;
              })
            )}

            {/* Temporary Linking Line */}
            {linking.active && linking.fromPos && linking.currentPos && document.getElementById('dashboard-container') && (
              <>
                <line
                  x1={linking.fromPos.x - document.getElementById('dashboard-container').getBoundingClientRect().left}
                  y1={linking.fromPos.y - document.getElementById('dashboard-container').getBoundingClientRect().top}
                  x2={linking.currentPos.x - document.getElementById('dashboard-container').getBoundingClientRect().left}
                  y2={linking.currentPos.y - document.getElementById('dashboard-container').getBoundingClientRect().top}
                  stroke="#ef4444" // Red color
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <circle 
                  cx={linking.currentPos.x - document.getElementById('dashboard-container').getBoundingClientRect().left} 
                  cy={linking.currentPos.y - document.getElementById('dashboard-container').getBoundingClientRect().top} 
                  r="4" 
                  fill="#ef4444" 
                />
              </>
            )}
          </svg>

          {/* Dashboard Items */}
          <div id="dashboard-container" className="relative w-full h-full p-6">
            {dashboardItems.map((item) => (
              <div
                key={item.id}
                id={`item-${item.id}`}
                data-id={item.id}
                className="dashboard-item absolute"
                style={{
                  left: item.position?.x || 0,
                  top: item.position?.y || 0,
                }}
              >
                <div
                  className="rounded-lg shadow-lg relative bg-white"
                  style={{
                    resize: 'horizontal',
                    overflow: 'hidden',
                    width: item.type === 'text' ? '300px' : '600px',
                    minWidth: '200px',
                    height: 'auto',
                  }}
                >
                  {/* Drag handle */}
                  <div
                    className="absolute top-0 left-0 w-full h-6 bg-gray-200 cursor-move flex items-center pl-2 select-none"
                    onMouseDown={(e) => handleDragStart(e, item)}
                  >
                    <span className="text-xs text-gray-600">Drag</span>
                  </div>

                  {/* Content area */}
                  <div className="p-6 pt-8">
                    {item.type === 'text' ? (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <button
                            onClick={() => {
                              setDashboardItems(items => items.filter(i => i.id !== item.id));
                            }}
                            className="text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 flex items-center justify-center w-6 h-6"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <textarea
                          className="w-full border rounded-lg p-2 min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          value={item.content || ''}
                          onChange={(e) => updateTextBoxContent(item.id, e.target.value)}
                          placeholder="Enter your notes here..."
                        />
                      </div>
                    ) : (
                      <VisualizationCard
                        {...item}
                        onQuestionClick={(question) => setDeepResearch({ open: true, question })}
                        onDelete={() => {
                          setDashboardItems(items => items.filter(i => i.id !== item.id));
                        }}
                        chartHeight={300}
                        updateTextBoxContent={updateTextBoxContent}
                      />
                    )}
                  </div>

                  {/* Linking handle */}
                  <div
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full cursor-crosshair flex items-center justify-center shadow-md hover:shadow-lg"
                    onMouseDown={(e) => handleLinkStart(e, item)}
                    title="Drag to connect with another component"
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                      <span className="text-white text-xs">+</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Action Buttons - Simplified */}
          <div className="fixed bottom-6 right-6 flex space-x-3">
            <button
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center"
              onClick={addTextBox}
              title="Add Text Box"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h16v3"></path>
                <path d="M9 20h6"></path>
                <path d="M12 4v16"></path>
              </svg>
            </button>
            
            {/* Add New Visualization Button */}
            <button
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
              onClick={() => {
                setQuery('');
                setDeepResearch({ open: true, question: 'Create a new visualization' });
              }}
              title="Add Visualization"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Deep Research Panel */}
      <DeepResearch
        isOpen={deepResearch.open}
        onClose={() => setDeepResearch({ open: false, question: '' })}
        question={deepResearch.question}
        onAddToBoard={handleAddToBoard}
      />
    </div>
  );
};

export default Dashboard;