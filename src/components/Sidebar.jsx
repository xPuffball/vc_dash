import React, { useState } from 'react';
import { 
  FolderTree, 
  TrendingUp, 
  BarChart2, 
  Globe, 
  BrainCircuit, 
  ChevronRight, 
  Plus, 
  Star,
  Edit,
  Trash2,
  Check,
  X,
  FileText
} from 'lucide-react';

const Sidebar = ({ open, folders = [], setFolders = () => {}, onDashboardSelect = () => {} }) => {
  const [editingItem, setEditingItem] = useState(null); // { type: 'folder'|'dashboard', id: number }
  const [newName, setNewName] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null); // { type: 'folder'|'dashboard', id: number }

  // Icon mapping for different folder types
  const folderIcons = {
    'investment': <TrendingUp size={18} />,
    'chart': <BarChart2 size={18} />,
    'global': <Globe size={18} />,
    'ai': <BrainCircuit size={18} />,
    'default': <FolderTree size={18} />
  };

  const handleNewFolder = () => {
    const newFolder = {
      id: Date.now(),
      name: 'New Folder',
      icon: folderIcons.default,
      iconType: 'default',
      dashboards: [],
      expanded: true
    };
    setFolders([...folders, newFolder]);
    // Start editing the new folder immediately
    setEditingItem({ type: 'folder', id: newFolder.id });
    setNewName('New Folder');
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
    // Start editing the new dashboard immediately
    setEditingItem({ type: 'dashboard', id: newDashboard.id, folderId });
    setNewName('New Dashboard');
  };

  const toggleFolder = (folderId) => {
    const updatedFolders = folders.map(f => ({
      ...f,
      expanded: f.id === folderId ? !f.expanded : f.expanded
    }));
    setFolders(updatedFolders);
  };

  const startEditing = (type, id, initialName, folderId = null) => {
    setEditingItem({ type, id, folderId });
    setNewName(initialName);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setNewName('');
  };

  const saveEditing = () => {
    if (!editingItem) return;

    const { type, id, folderId } = editingItem;
    
    if (type === 'folder') {
      setFolders(folders.map(folder => 
        folder.id === id ? { ...folder, name: newName } : folder
      ));
    } else if (type === 'dashboard' && folderId) {
      setFolders(folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            dashboards: folder.dashboards.map(dashboard => 
              dashboard.id === id ? { ...dashboard, name: newName } : dashboard
            )
          };
        }
        return folder;
      }));
    }
    
    setEditingItem(null);
    setNewName('');
  };

  const deleteFolder = (folderId) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
  };

  const deleteDashboard = (folderId, dashboardId) => {
    setFolders(folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          dashboards: folder.dashboards.filter(dashboard => dashboard.id !== dashboardId)
        };
      }
      return folder;
    }));
  };

  const toggleStarred = (folderId, dashboardId) => {
    setFolders(folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          dashboards: folder.dashboards.map(dashboard => {
            if (dashboard.id === dashboardId) {
              return { ...dashboard, starred: !dashboard.starred };
            }
            return dashboard;
          })
        };
      }
      return folder;
    }));
  };

  const changeFolderIcon = (folderId, iconType) => {
    setFolders(folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          iconType,
          icon: folderIcons[iconType] || folderIcons.default
        };
      }
      return folder;
    }));
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
              title="Create new folder"
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
            <div 
              key={folder.id} 
              className="mb-2"
              onMouseEnter={() => setHoveredItem({ type: 'folder', id: folder.id })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Folder Header */}
              <div className="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-gray-50">
                {/* Folder Icon */}
                <div onClick={() => toggleFolder(folder.id)}>
                  {folder.icon || folderIcons.default}
                </div>
                
                {open && (
                  <>
                    {/* Folder Name (Editable) */}
                    {editingItem && editingItem.type === 'folder' && editingItem.id === folder.id ? (
                      <div className="flex items-center flex-1">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 px-1 border border-blue-300 rounded text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing();
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <div className="flex ml-2">
                          <button onClick={saveEditing} className="p-1 text-green-500 hover:text-green-700">
                            <Check size={14} />
                          </button>
                          <button onClick={cancelEditing} className="p-1 text-red-500 hover:text-red-700">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className="flex-1"
                          onClick={() => toggleFolder(folder.id)}
                        >
                          {folder.name}
                        </span>
                        
                        {/* Folder Actions (visible on hover) */}
                        {hoveredItem && hoveredItem.type === 'folder' && hoveredItem.id === folder.id && (
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => startEditing('folder', folder.id, folder.name)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Edit folder"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => deleteFolder(folder.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete folder"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                        
                        <ChevronRight 
                          size={16} 
                          className={`transition-transform ${folder.expanded ? 'rotate-90' : ''}`}
                          onClick={() => toggleFolder(folder.id)}
                        />
                      </>
                    )}
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
                      onMouseEnter={() => setHoveredItem({ type: 'dashboard', id: dashboard.id, folderId: folder.id })}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => onDashboardSelect({ folderId: folder.id, dashboardId: dashboard.id })}
                    >
                      <FileText size={14} className="mr-2 text-gray-500" />
                      
                      {/* Dashboard Name (Editable) */}
                      {editingItem && 
                       editingItem.type === 'dashboard' && 
                       editingItem.id === dashboard.id && 
                       editingItem.folderId === folder.id ? (
                        <div className="flex items-center flex-1">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-1 border border-blue-300 rounded text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing();
                              if (e.key === 'Escape') cancelEditing();
                            }}
                          />
                          <div className="flex ml-2">
                            <button onClick={saveEditing} className="p-1 text-green-500 hover:text-green-700">
                              <Check size={14} />
                            </button>
                            <button onClick={cancelEditing} className="p-1 text-red-500 hover:text-red-700">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{dashboard.name}</span>
                          
                          {/* Dashboard Actions */}
                          <div className="flex items-center">
                            {/* Star Toggle (always visible) */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarred(folder.id, dashboard.id);
                              }}
                              className={dashboard.starred ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}
                              title={dashboard.starred ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star size={14} />
                            </button>
                            
                            {/* Edit/Delete (visible on hover) */}
                            {hoveredItem && 
                             hoveredItem.type === 'dashboard' && 
                             hoveredItem.id === dashboard.id && (
                              <div className="flex ml-2 space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing('dashboard', dashboard.id, dashboard.name, folder.id);
                                  }}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="Edit dashboard"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDashboard(folder.id, dashboard.id);
                                  }}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete dashboard"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {/* Add New Dashboard Button */}
                  <button
                    onClick={() => handleNewDashboard(folder.id)}
                    className="flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded w-full"
                  >
                    <Plus size={14} />
                    <span>New Dashboard</span>
                  </button>

                  {/* Folder Icon Selector (Optional) */}
                  {hoveredItem && hoveredItem.type === 'folder' && hoveredItem.id === folder.id && (
                    <div className="mt-2 p-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Change icon:</div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => changeFolderIcon(folder.id, 'default')} 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Default folder"
                        >
                          <FolderTree size={16} />
                        </button>
                        <button 
                          onClick={() => changeFolderIcon(folder.id, 'investment')} 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Investment"
                        >
                          <TrendingUp size={16} />
                        </button>
                        <button 
                          onClick={() => changeFolderIcon(folder.id, 'chart')} 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Data & Charts"
                        >
                          <BarChart2 size={16} />
                        </button>
                        <button 
                          onClick={() => changeFolderIcon(folder.id, 'global')} 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Global Markets"
                        >
                          <Globe size={16} />
                        </button>
                        <button 
                          onClick={() => changeFolderIcon(folder.id, 'ai')} 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="AI & Technology"
                        >
                          <BrainCircuit size={16} />
                        </button>
                      </div>
                    </div>
                  )}
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