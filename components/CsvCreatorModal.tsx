import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Download, Loader2, FileText, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { cn } from '../utils';

interface CsvEntry {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  fileName: string;
}

interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface CsvCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvCreatorModal: React.FC<CsvCreatorModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<CsvEntry[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [defaultDescription, setDefaultDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadItem[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pending'
      }));
      setUploadQueue(prev => [...prev, ...newItems]);
      
      // Reset input so same files can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const uploadImage = async (fileToUpload: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', fileToUpload);
    formData.append('bucketName', 'imges_my_custom');

    const authString = btoa('MrOgo:gP4^yR8!nA2$kW7#qT5@eH1%vZ9*fM0');

    const response = await fetch('https://gcloud-uploader-api-293951101530.europe-central2.run.app/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // API returns camelCase properties as confirmed by user
    const fileResult = data.files?.[0];
    if (!fileResult) throw new Error('No file data in response');
    if (fileResult.status !== 'Success') throw new Error(fileResult.message || 'Upload failed');
    if (!fileResult.link) throw new Error('No link returned');
    
    return fileResult.link;
  };

  const processQueue = async () => {
    const pendingItems = uploadQueue.filter(item => item.status === 'pending' || item.status === 'error');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);

    // We map over the queue to update state in place
    // Creating a snapshot of items to process
    const itemsToProcess = [...pendingItems];

    const uploadPromises = itemsToProcess.map(async (item) => {
      // Update status to uploading
      setUploadQueue(current => current.map(i => i.id === item.id ? { ...i, status: 'uploading', errorMessage: undefined } : i));

      try {
        const imageUrl = await uploadImage(item.file);
        
        // Success
        setUploadQueue(current => current.map(i => i.id === item.id ? { ...i, status: 'success' } : i));
        
        // Add to entries
        const newEntry: CsvEntry = {
          id: Math.random().toString(36).substring(7),
          title: item.file.name.split('.')[0].replace(/[-_]/g, ' '), // Basic clean up of filename
          description: defaultDescription,
          imageUrl: imageUrl,
          fileName: item.file.name
        };
        setEntries(prev => [...prev, newEntry]);

      } catch (err: any) {
        console.error(`Error uploading ${item.file.name}:`, err);
        setUploadQueue(current => current.map(i => i.id === item.id ? { ...i, status: 'error', errorMessage: err.message } : i));
      }
    });

    await Promise.all(uploadPromises);
    setIsProcessing(false);
  };

  const updateEntry = (id: string, field: keyof CsvEntry, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const clearSuccessfulUploads = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'success'));
  };

  const downloadCsv = () => {
    if (entries.length === 0) return;

    const csvHeader = 'title,description,image_url\n';
    const csvRows = entries.map(entry => {
        const safeTitle = `"${entry.title.replace(/"/g, '""')}"`;
        const safeDesc = `"${entry.description.replace(/"/g, '""')}"`;
        const safeUrl = `"${entry.imageUrl.replace(/"/g, '""')}"`;
        return `${safeTitle},${safeDesc},${safeUrl}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'custom_deck.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pendingCount = uploadQueue.filter(i => i.status === 'pending' || i.status === 'error').length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-gray-100">
         {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Card Deck</h2>
              <p className="text-sm text-gray-500 mt-1">Upload multiple images, refine details, and download your CSV.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
            </button>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-hidden min-h-0">
           <div className="h-full grid lg:grid-cols-[1fr,1.4fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              
              {/* Left Column: Upload & Queue */}
              <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
                  
                  {/* Fixed Top: Upload Controls */}
                  <div className="p-6 pb-4 shrink-0">
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Upload className="w-4 h-4 text-indigo-500" /> Bulk Upload
                          </h3>
                          
                          <div className="space-y-3">
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                id="bulk-upload"
                                className="hidden" 
                              />
                              <label 
                                htmlFor="bulk-upload"
                                className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors bg-gray-50"
                              >
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                  <Upload className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-900">Click to select images</p>
                                  <p className="text-xs text-gray-500 mt-1">Select multiple files at once</p>
                                </div>
                              </label>

                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Default Description (Optional)</label>
                                  <textarea 
                                      value={defaultDescription}
                                      onChange={(e) => setDefaultDescription(e.target.value)}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-16 text-sm transition-all"
                                      placeholder="Applied to all new uploads..."
                                  />
                              </div>

                              <button 
                                  onClick={processQueue}
                                  disabled={isProcessing || pendingCount === 0}
                                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                              >
                                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                  {isProcessing ? 'Uploading...' : `Upload ${pendingCount} Files`}
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Flexible Bottom: Queue List */}
                  {uploadQueue.length > 0 && (
                     <div className="flex-1 overflow-hidden min-h-0 flex flex-col px-6 pb-6">
                        <div className="flex items-center justify-between mb-2 px-1">
                           <h4 className="text-sm font-semibold text-gray-700">Upload Queue</h4>
                           {uploadQueue.some(i => i.status === 'success') && (
                             <button onClick={clearSuccessfulUploads} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                               Clear Completed
                             </button>
                           )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm">
                           <div className="divide-y divide-gray-50">
                             {uploadQueue.map((item) => (
                               <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 text-sm">
                                  <div className="flex items-center gap-3 min-w-0">
                                     <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                     </div>
                                     <div className="min-w-0">
                                        <p className="truncate font-medium text-gray-700 max-w-[150px]" title={item.file.name}>{item.file.name}</p>
                                        <p className="text-xs text-gray-400">{(item.file.size / 1024).toFixed(1)} KB</p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                     {item.status === 'pending' && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Pending</span>}
                                     {item.status === 'uploading' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                                     {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                     {item.status === 'error' && (
                                        <div className="flex items-center gap-1 text-red-500" title={item.errorMessage}>
                                           <AlertCircle className="w-4 h-4" />
                                           <span className="text-xs hidden sm:inline">Failed</span>
                                        </div>
                                     )}
                                     <button 
                                        onClick={() => removeFromQueue(item.id)}
                                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                     >
                                        <X className="w-3.5 h-3.5" />
                                     </button>
                                  </div>
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                  )}
              </div>

              {/* Right Column: Deck List */}
              <div className="flex flex-col h-full overflow-hidden bg-white">
                 <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 shrink-0">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> 
                        Current Deck
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{entries.length}</span>
                    </h3>
                    {entries.length > 0 && (
                      <span className="text-xs text-gray-400">Click text to edit</span>
                    )}
                 </div>
                 
                 <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                    {entries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center space-y-2">
                            <div className="bg-gray-50 p-4 rounded-full">
                              <FileText className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">No cards yet.</p>
                            <p className="text-xs max-w-xs">Upload images from the left panel to generate cards. You can edit their details here.</p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="group flex gap-3 p-3 bg-white border border-gray-200 hover:border-indigo-300 rounded-xl shadow-sm transition-all">
                                <div className="w-20 h-20 rounded-lg bg-gray-100 shrink-0 border border-gray-200 overflow-hidden relative">
                                    <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <input 
                                      type="text"
                                      value={entry.title}
                                      onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                                      className="w-full text-sm font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-0 px-0 py-0.5 transition-colors placeholder-gray-300"
                                      placeholder="Card Title"
                                    />
                                    <textarea 
                                      value={entry.description}
                                      onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                                      className="w-full text-xs text-gray-600 bg-transparent border border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-0 rounded p-1 transition-colors resize-none h-10 placeholder-gray-300"
                                      placeholder="Card Description"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                      onClick={() => removeEntry(entry.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="Remove card"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                            </div>
                        ))
                    )}
                 </div>
              </div>
           </div>
         </div>

         {/* Footer */}
         <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3 z-10 shrink-0">
             <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
             >
                Cancel
             </button>
             <button 
                onClick={downloadCsv}
                disabled={entries.length === 0}
                className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
             >
                <Download className="w-4 h-4" />
                Download CSV Deck
             </button>
         </div>
      </div>
    </div>
  );
};