"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// TODO: Define proper TypeScript interface for Canvas
interface Canvas {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  createdAt: string;
}

export default function CanvasPage() {
  const router = useRouter();

  // TODO: State management for modal and form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasDescription, setNewCanvasDescription] = useState('');
  const [canvases, setCanvases] = useState<Canvas[]>([]);

  // TODO: Load canvases from localStorage on component mount
  useEffect(() => {
    loadCanvasesFromStorage();
  }, []);

  // TODO: Function to load canvases from localStorage
  const loadCanvasesFromStorage = () => {
    // Implementation needed:
    // 1. Get all localStorage keys that start with 'canvas-'
    // 2. Parse each canvas data
    // 3. Create a list of canvas metadata
    // 4. Update the canvases state
    console.log('TODO: Load canvases from localStorage');
  };

  // TODO: Function to generate unique canvas ID
  const generateCanvasId = (): string => {
    // Implementation needed:
    // 1. Generate a unique ID (timestamp + random string)
    // 2. Check if ID already exists
    // 3. Return unique ID
    return `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // TODO: Function to create new canvas
  const handleCreateCanvas = () => {
    // Implementation needed:
    // 1. Validate form inputs (name is required)
    // 2. Generate unique canvas ID
    // 3. Create canvas data object
    // 4. Save to localStorage with key 'canvas-{id}'
    // 5. Update the canvases state
    // 6. Close modal and reset form
    // 7. Navigate to the new canvas
    console.log('TODO: Create new canvas');
  };

  // TODO: Function to handle form input changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCanvasName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCanvasDescription(e.target.value);
  };

  // TODO: Function to cancel canvas creation
  const handleCancelCreate = () => {
    // Implementation needed:
    // 1. Reset form inputs
    // 2. Close modal
    setNewCanvasName('');
    setNewCanvasDescription('');
    setShowCreateModal(false);
  };

  // Click handler for canvas cards
  const handleCanvasClick = (canvasId: string) => {
    router.push(`/protected/canvas/${canvasId}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Canvases</h1>
          <p className="text-muted-foreground">Create and manage your infinite canvases</p>
        </div>

        {/* New Canvas Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            + Create New Canvas
          </button>
        </div>

        {/* TODO: Create Canvas Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Canvas</h2>
              
              {/* TODO: Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Canvas Name *
                  </label>
                  <input
                    type="text"
                    value={newCanvasName}
                    onChange={handleNameChange}
                    placeholder="Enter canvas name"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newCanvasDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Enter canvas description"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* TODO: Form buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateCanvas}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Create Canvas
                </button>
                <button
                  onClick={handleCancelCreate}
                  className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TODO: Replace with dynamic canvases from state */}
          {canvases.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No canvases yet</p>
              <p className="text-sm">Click "Create New Canvas" to get started</p>
            </div>
          ) : (
            canvases.map((canvas) => (
              <div 
                key={canvas.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCanvasClick(canvas.id)}
              >
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No preview</span>
                </div>
                <h3 className="font-semibold mb-1">{canvas.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{canvas.description}</p>
                <div className="text-xs text-muted-foreground">
                  Updated {canvas.updatedAt}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}