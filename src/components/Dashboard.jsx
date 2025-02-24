import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import Sidebar from './Sidebar';
import DeepResearch from './DeepResearch';
import VisualizationCard from './VisualizationCard';
import { mockTrendData, mockSectorData } from '../data/mockData';
import {totalInvestmentByYear, totalInvestmentBySector, investmentVolumeByYear, investmentAvgByYear, investmentPercentageByCategory, investmentAmountDollarByCategory} from '../data/questionOneData';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [deepResearch, setDeepResearch] = useState({ open: false, question: '' });
  const [folders, setFolders] = useState([
    {
      id: 1,
      name: 'Investment Analysis',
      icon: <TrendingUp size={18} />,
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
      dashboards: [
        { id: 3, name: 'AI/ML Sector Overview', starred: true },
        { id: 4, name: 'FinTech Momentum', starred: false }
      ],
      expanded: false
    }
  ]);

  const [dashboardItems, setDashboardItems] = useState([
    {
      id: 1,
      type: 'trend',
      data: mockTrendData,
      title: 'Investment Trends Over Time',
      position: { x: 100, y: 100 },
      relatedInsights: [
        {
          text: 'Strong growth momentum in latest quarter',
          question: "What's driving the recent growth?"
        },
        {
          text: 'Series A deals showing increasing trend',
          question: 'Why are Series A deals increasing?'
        }
      ]
    },
    {
      id: 2,
      type: 'sector',
      data: mockSectorData,
      title: 'Investment by Sector',
      position: { x: 100, y: 500 },
      relatedInsights: [
        {
          text: 'AI/ML leads investment volume',
          question: 'What factors are driving AI/ML investment?'
        },
        {
          text: 'FinTech showing steady growth',
          question: 'How does FinTech compare to other sectors?'
        }
      ]
    }
  ]);

  // -------------------------------
  // Linking State & Global Handlers
  // -------------------------------
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
              // Add connection
              setDashboardItems((items) =>
                items.map((item) => {
                  if (item.id === linking.fromId) {
                    const connections = item.connections ? [...item.connections] : [];
                    connections.push({ targetId });
                    return { ...item, connections };
                  }
                  return item;
                })
              );
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

  // -------------------------------
  // Dragging (via drag handle)
  // -------------------------------
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

  // -------------------------------
  // Linking handle
  // -------------------------------
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

  // -------------------------------
  // Query / Deep Research Handlers
  // -------------------------------
  const handleQuestionSubmit = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setDeepResearch({
        open: true,
        question: query
      });
      setQuery('');
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (white background is okay if you want it) */}
      <Sidebar open={sidebarOpen} folders={folders} setFolders={setFolders} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        {/*
          If you want a transparent top bar (so you see dotted bg behind it),
          remove bg-white. Otherwise, keep it:
        */}
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
                placeholder="Ask anything about the data..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Area */}
        <div
          className="flex-1 relative"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
          }}
        >
          {/* SVG Overlay for Connections */}
          <svg className="absolute inset-0 pointer-events-none">
            {/* Permanent Connections */}
            {dashboardItems.map((item) =>
              item.connections?.map((connection, idx) => {
                const sourceEl = document.getElementById(`item-${item.id}`);
                const targetEl = document.getElementById(`item-${connection.targetId}`);
                if (sourceEl && targetEl) {
                  const containerRect = sourceEl.parentElement.getBoundingClientRect();
                  const sourceRect = sourceEl.getBoundingClientRect();
                  const targetRect = targetEl.getBoundingClientRect();
                  const start = {
                    x: sourceRect.left + sourceRect.width / 2 - containerRect.left,
                    y: sourceRect.top + sourceRect.height / 2 - containerRect.top
                  };
                  const end = {
                    x: targetRect.left + targetRect.width / 2 - containerRect.left,
                    y: targetRect.top + targetRect.height / 2 - containerRect.top
                  };
                  return (
                    <path
                      key={`${item.id}-${connection.targetId}-${idx}`}
                      d={`M ${start.x} ${start.y}
                         C ${start.x} ${(start.y + end.y) / 2},
                           ${end.x} ${(start.y + end.y) / 2},
                           ${end.x} ${end.y}`}
                      stroke="#93c5fd"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                  );
                }
                return null;
              })
            )}

            {/* Temporary Linking Line */}
            {linking.active && linking.fromPos && linking.currentPos && (
              <line
                x1={linking.fromPos.x - (document.getElementById('dashboard-container')?.getBoundingClientRect().left || 0)}
                y1={linking.fromPos.y - (document.getElementById('dashboard-container')?.getBoundingClientRect().top || 0)}
                x2={linking.currentPos.x - (document.getElementById('dashboard-container')?.getBoundingClientRect().left || 0)}
                y2={linking.currentPos.y - (document.getElementById('dashboard-container')?.getBoundingClientRect().top || 0)}
                stroke="red"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
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
                // Keep absolute positioning for drag-and-drop
                left: item.position?.x || 0,
                top: item.position?.y || 0,
                // No fixed width here; we let the inner container handle resizing
                }}
            >
                {/* Outer box that can be dragged (by the top bar) AND resized horizontally */}
                <div
                className="rounded-lg shadow-lg relative bg-white"
                style={{
                    // Let the user drag from the right edge/corner to resize horizontally
                    resize: 'horizontal',
                    // Hide any overflow instead of scroll bars
                    overflow: 'hidden',
                    // Default size (adjust as desired)
                    width: '600px',
                    // Prevent it from getting too small
                    minWidth: '300px',
                    // Height stays auto so it expands if new content (e.g. follow-up chat) appears
                    height: 'auto',
                }}
                >
                {/* Existing "drag handle" for moving the entire box around */}
                <div
                    className="absolute top-0 left-0 w-full h-6 bg-gray-200 cursor-move flex items-center pl-2 select-none"
                    onMouseDown={(e) => handleDragStart(e, item)}
                >
                    <span className="text-xs text-gray-600">Drag</span>
                </div>

                {/* Content area (your VisualizationCard or text) */}
                <div className="p-6 pt-8">
                    {item.type === 'text' ? (
                    <div
                        contentEditable
                        className="outline-none"
                        suppressContentEditableWarning
                        onBlur={(e) => {
                        setDashboardItems((items) =>
                            items.map((i) =>
                            i.id === item.id
                                ? { ...i, content: e.target.textContent }
                                : i
                            )
                        );
                        }}
                    >
                        {item.content}
                    </div>
                    ) : (
                      <VisualizationCard
                        {...item}
                        relatedInsights={item.relatedInsights || []}
                        onQuestionClick={(question) =>
                          setDeepResearch({ open: true, question })
                        }
                        onDelete={() => {
                          setDashboardItems(items => items.filter(i => i.id !== item.id));
                        }}
                        chartHeight={300} 
                    />
                    )}
                </div>

                {/* Linking handle (unchanged) */}
                <div
                    className="absolute bottom-2 right-2 w-4 h-4 bg-blue-600 rounded-full cursor-crosshair"
                    onMouseDown={(e) => handleLinkStart(e, item)}
                ></div>
                </div>
            </div>
            ))}
          </div>

          {/* Add New Component Button */}
          <button
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
            onClick={() => {
              setQuery('');
              setDeepResearch({ open: true, question: 'Create a new visualization' });
            }}
          >
            <Plus size={24} />
          </button>
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
