
import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex justify-center w-full h-64 px-4 transition bg-gray-800 border-2 ${isDragging ? 'border-brand-primary' : 'border-gray-600'} border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-secondary focus:outline-none`}
      >
        <span className="flex flex-col items-center justify-center space-y-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="font-medium">
            Glissez-déposez vos photos ici, ou <span className="text-brand-secondary">cliquez pour sélectionner</span>
          </span>
          <span className="text-sm">Formats supportés: JPG, PNG, WEBP</span>
        </span>
        <input type="file" name="file_upload" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleChange} disabled={isProcessing} />
      </label>
    </div>
  );
};

export default ImageUploader;
