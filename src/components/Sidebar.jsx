import React from 'react';
import { FolderTree, TrendingUp, BarChart2, Globe, BrainCircuit, ChevronRight, Plus, Star } from 'lucide-react';

const Sidebar = ({ open, folders = [], setFolders = () => {} }) => {
  const handleNewFolder = () => {
    const newFolder = {
      id: Date.now(),
      name: 'New Folder',
      icon: <FolderTree size={18} />,
      dashboards: [],
      expanded: true
    };
    setFolders([...folders, newFolder]);
  };

  const handleNewDashboard = (folderId) => {
    const newDashboard = {
      id: Date.now(),
      name: 'New Dashboard',
      starred: false
    };
    
    const updatedFolders = folders.map(f => 
      f.id === folderId 
        ? { ...f, dashboards: [...f.dashboards, newDashboard] }
        : f
    );
    setFolders(updatedFolders);
  };

  const toggleFolder = (folderId) => {
    const updatedFolders = folders.map(f => ({
      ...f,
      expanded: f.id === folderId ? !f.expanded : f.expanded
    }));
    setFolders(updatedFolders);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 flex flex-col ${open ? 'w-64' : 'w-20'}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FolderTree className="text-blue-600" size={24} />
            {open && <span className="font-semibold">VC Research Hub</span>}
          </div>
          {open && (
            <button 
              onClick={handleNewFolder}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Folders List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {folders.map((folder) => (
            <div key={folder.id} className="mb-2">
              {/* Folder Header */}
              <div 
                className="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-gray-50"
                onClick={() => toggleFolder(folder.id)}
              >
                {folder.icon}
                {open && (
                  <>
                    <span className="flex-1">{folder.name}</span>
                    <ChevronRight 
                      size={16} 
                      className={`transition-transform ${folder.expanded ? 'rotate-90' : ''}`}
                    />
                  </>
                )}
              </div>

              {/* Dashboards in Folder */}
              {open && folder.expanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {folder.dashboards.map((dashboard) => (
                    <div 
                      key={dashboard.id}
                      className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="flex-1 text-sm">{dashboard.name}</span>
                      {dashboard.starred && <Star size={14} className="text-yellow-400" />}
                    </div>
                  ))}
                  <button
                    onClick={() => handleNewDashboard(folder.id)}
                    className="flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded w-full"
                  >
                    <Plus size={14} />
                    <span>New Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        {open && (
          <button
            onClick={handleNewFolder}
            className="flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded w-full"
          >
            <Plus size={14} />
            <span>New Folder</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;