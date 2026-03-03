import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, User } from 'lucide-react';

const ProfilePhotoUploadModal = ({ isOpen, onClose, currentPhoto, onPhotoUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreview(null);
      setError('');
    }
  }, [isOpen]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onPhotoUpdate(data.data.profilePhotoUrl);
        onClose();
        setSelectedFile(null);
        setPreview(null);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile-photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onPhotoUpdate(null);
        onClose();
      } else {
        setError(data.message || 'Failed to remove photo');
      }
    } catch (error) {
      console.error('Remove photo error:', error);
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-morphism rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Profile Photo</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Photo Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-zinc-700">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : currentPhoto ? (
                <img src={`http://localhost:5000${currentPhoto}`} alt="Current" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-zinc-600" />
              )}
            </div>
            
            {/* Upload Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
              title="Upload new photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="glass-button-primary w-full flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
            </button>
          )}

          {currentPhoto && !selectedFile && (
            <button
              onClick={handleRemovePhoto}
              disabled={uploading}
              className="glass-button-secondary w-full flex items-center justify-center space-x-2 text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
              <span>{uploading ? 'Removing...' : 'Remove Photo'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="glass-button-secondary w-full"
          >
            Cancel
          </button>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mt-4 text-sm text-zinc-400 text-center">
            <p>Selected: {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoUploadModal;
