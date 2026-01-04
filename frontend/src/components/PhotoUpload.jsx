import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function PhotoUpload({ catId, catName, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const storage = getStorage();
  const db = getFirestore();
  const auth = getAuth();

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload photo
  const handleUpload = async () => {
    if (!selectedFile || !auth.currentUser) {
      setError('Please sign in to upload photos');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${selectedFile.name}`;
      const storageRef = ref(storage, `cat-photos/${catId}/${filename}`);

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          setError('Failed to upload photo. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save photo metadata to Firestore
          await addDoc(collection(db, 'cats', catId, 'photos'), {
            imageUrl: downloadURL,
            caption: caption || '',
            uploadedBy: auth.currentUser.uid,
            uploadedByEmail: auth.currentUser.email,
            uploadedAt: serverTimestamp(),
            catId: catId,
            catName: catName,
            likes: 0
          });

          // Reset form
          setSelectedFile(null);
          setPreview(null);
          setCaption('');
          setUploadProgress(0);
          setUploading(false);

          // Notify parent component
          if (onUploadComplete) {
            onUploadComplete();
          }

          alert('Photo uploaded successfully! 🎉');
        }
      );
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      <h3 className="text-xl font-bold mb-4">Add Photo to {catName}'s Album</h3>

      {/* File input */}
      <div className="mb-4">
        <label 
          htmlFor="photo-upload" 
          className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-2" />
          ) : (
            <div>
              <p className="text-gray-600 mb-2">Click to select a photo</p>
              <p className="text-sm text-gray-400">Max 5MB, images only</p>
            </div>
          )}
        </label>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Caption input */}
      {selectedFile && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption (optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            disabled={uploading}
            maxLength={200}
          />
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-purple-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
}

export default PhotoUpload;