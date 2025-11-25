import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn, parseCSV, getImageSrc } from '../utils';
import { CardData } from '../types';

interface FileUploadProps {
  onDataLoaded: (cards: CardData[], filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        
        if (rows.length === 0) {
          setError('The CSV file appears to be empty or invalid.');
          return;
        }

        const cards: CardData[] = rows.map((row, index) => ({
          id: `initial-${index}-${Date.now()}`,
          displayNumber: index + 1, // Will be reassigned later during shuffle
          title: row.title || 'Untitled',
          description: row.description || 'No description provided.',
          imageSrc: getImageSrc(row),
        }));

        onDataLoaded(cards, file.name);
      } catch (err) {
        console.error(err);
        setError('Failed to parse the CSV file.');
      }
    };
    reader.onerror = () => setError('Error reading file.');
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setError(null);
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 ease-in-out text-center cursor-pointer group bg-white",
          isDragging ? "border-indigo-500 bg-indigo-50 scale-[1.02]" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
          error ? "border-red-300 bg-red-50" : ""
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragging ? "bg-indigo-200 text-indigo-700" : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload your CSV
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop or click to browse
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg">
            <FileText className="w-3 h-3" />
            <span>Required columns: title, description, image_url</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};