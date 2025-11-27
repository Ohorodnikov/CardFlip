import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Download, Loader2, FileText, AlertCircle } from 'lucide-react';

interface CsvEntry {
  title: string;
  description: string;
  imageUrl: string;
  fileName: string;
}

interface CsvCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvCreatorModal: React.FC<CsvCreatorModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<CsvEntry[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadImage = async (fileToUpload: File): Promise<string> => {
    const formData = new FormData();
    // The API expects "files" as the key for IFormFileCollection
    formData.append('files', fileToUpload);
    formData.append('bucketName', 'imges_my_custom');

    // Basic Auth Credentials
    const authString = btoa('MrOgo:gP4^yR8!nA2$kW7#qT5@eH1%vZ9*fM0');

    const response = await fetch('https://gcloud-uploader-api-293951101530.europe-central2.run.app/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    // API Response format: {"message": "...", "files": [{"status":"...", "message": "...", "fileName": "...", "link":"..."}]}
    
    // Check for "files" (camelCase)
    const fileResult = data.files?.[0];
    
    if (!fileResult) {
        throw new Error('Invalid response format: No file data returned');
    }

    // Check status (camelCase)
    if (fileResult.status !== 'Success') {
        throw new Error(fileResult.message || 'Upload reported failure');
    }

    // Check link (camelCase)
    if (!fileResult.link) {
        throw new Error('Upload succeeded but no link was returned');
    }
    
    return fileResult.link;
  };

  const handleAddCard = async () => {
    if (!title || !description || !file) {
      setUploadError('Please fill in all fields and select an image.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadImage(file);
      const newEntry: CsvEntry = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl,
        fileName: file.name
      };
      
      setEntries(prev => [...prev, newEntry]);
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const downloadCsv = () => {
    if (entries.length === 0) return;

    // Header
    const csvHeader = 'title,description,image_url\n';
    
    // Rows
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
         {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Card Deck</h2>
              <p className="text-sm text-gray-500 mt-1">Add cards and download a CSV to play</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
            </button>
         </div>

         {/* Content - Scrollable */}
         <div className="flex-1 overflow-y-auto bg-gray-50/50">
           <div className="p-6 grid gap-8 lg:grid-cols-[1fr,1.2fr]">
              {/* Form Section */}
              <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-indigo-500" /> New Card Details
                      </h3>
                      
                      <div className="space-y-3">
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                              <input 
                                  type="text" 
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                  placeholder="e.g., Mountain View"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                              <textarea 
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-24 transition-all"
                                  placeholder="Describe the card..."
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Image</label>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleFileChange}
                                  id="file-upload"
                                  className="hidden" 
                                />
                                <label 
                                  htmlFor="file-upload"
                                  className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    file ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className={`p-2 rounded-full ${file ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                    <Upload className={`w-4 h-4 ${file ? 'text-indigo-600' : 'text-gray-500'}`} />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className={`text-sm font-medium truncate ${file ? 'text-indigo-900' : 'text-gray-600'}`}>
                                      {file ? file.name : 'Click to select image'}
                                    </p>
                                    {!file && <p className="text-xs text-gray-400">Supports JPG, PNG</p>}
                                  </div>
                                </label>
                              </div>
                          </div>
                      </div>

                      {uploadError && (
                          <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{uploadError}</span>
                          </div>
                      )}

                      <button 
                          onClick={handleAddCard}
                          disabled={isUploading}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          {isUploading ? 'Uploading...' : 'Add to Deck'}
                      </button>
                  </div>
              </div>

              {/* List Section */}
              <div className="flex flex-col h-full min-h-[300px]">
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" /> 
                            Current Deck
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{entries.length}</span>
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {entries.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                  <FileText className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm">No cards added yet.</p>
                                <p className="text-xs mt-1">Fill out the form to build your deck.</p>
                            </div>
                        ) : (
                            entries.map((entry, idx) => (
                                <div key={idx} className="group flex items-start justify-between p-3 bg-white border border-gray-100 hover:border-indigo-200 rounded-lg transition-all hover:shadow-sm">
                                    <div className="flex gap-3 overflow-hidden">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 border border-gray-200 overflow-hidden">
                                            <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0 py-0.5">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{entry.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{entry.description}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeEntry(idx)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                        title="Remove card"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
              </div>
           </div>
         </div>

         {/* Footer */}
         <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3 z-10">
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