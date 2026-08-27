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
      setError('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB. Please choose a smaller image.');
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

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setUploadProgress(0);
    setError('');
  };

  // Upload photo
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a photo first');
      return;
    }

    if (!auth.currentUser) {
      setError('Please sign in to upload photos');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create unique filename
      const timestamp = Date.now();
      const sanitizedFilename = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedFilename}`;
      const storagePath = `cat-photos/${catId}/${filename}`;
      const storageRef = ref(storage, storagePath);

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
          setError('Failed to upload photo. Please check your connection and try again.');
          setUploading(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            // Upload completed successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save photo metadata to Firestore
            await addDoc(collection(db, 'cats', catId, 'photos'), {
              imageUrl: downloadURL,
              storagePath: storagePath,
              caption: caption.trim() || '',
              uploadedBy: auth.currentUser.uid,
              uploadedByEmail: auth.currentUser.email || 'Anonymous',
              uploadedAt: serverTimestamp(),
              catId: catId,
              catName: catName
            });

            // Reset form and notify parent
            resetForm();
            setUploading(false);

            if (onUploadComplete) {
              onUploadComplete();
            }

            alert('Photo uploaded successfully! 🎉');
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            setError('Photo uploaded but failed to save metadata. Please try again.');
            setUploading(false);
          }
        }
      );
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="c4-panel font-hand rounded-[18px] p-4 sm:p-5">
      <h3 className="font-pix text-accent m-0 mb-4 text-xl sm:text-2xl">
        add photo to {catName}'s album
      </h3>

      {/* File input */}
      <div className="mb-6">
        <label 
          htmlFor="photo-upload" 
          className={`block w-full cursor-pointer rounded-[14px] border-2 border-dashed p-5 text-center transition-all sm:p-6 ${
            preview 
              ? 'border-accent bg-soft'
              : 'border-line hover:border-accent hover:bg-soft'
          }`}
        >
          {preview ? (
            <div className="space-y-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-64 sm:max-h-80 mx-auto rounded-xl shadow-lg object-contain" 
              />
              <div className="text-accent flex flex-col items-center justify-center gap-2 text-sm font-medium sm:flex-row">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>click to change photo</span>
              </div>
            </div>
          ) : (
            <div className="py-6 sm:py-8">
              <svg className="text-line mx-auto mb-3 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-pix text-accent m-0 mb-1 text-lg">click to select a photo</p>
              <p className="text-ink/70 m-0 text-sm">JPG, PNG, or GIF • Max 5MB</p>
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
        <div className="mb-6">
          <label className="text-ink mb-2 block text-sm font-bold sm:text-base">
            Caption (optional)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tell us about this photo of your favorite cat..."
            className="c4-input resize-none"
            disabled={uploading}
            maxLength={200}
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-ink/60 m-0 text-xs sm:text-sm">
              {caption.length}/200 characters
            </p>
            {caption.length > 150 && (
              <p className="text-accent m-0 text-xs font-medium">
                {200 - caption.length} left
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ink text-sm font-medium">uploading…</span>
            <span className="text-accent text-sm font-bold">{uploadProgress}%</span>
          </div>
          <div className="bg-soft border-line h-3 w-full overflow-hidden rounded-full border">
            <div
              className="h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%`, background: 'var(--color-accent)' }}
            ></div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-[12px] border-2 p-3" style={{ borderColor: '#d99a9a', background: '#fbeeee', color: '#8f4b4b' }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm sm:text-base font-medium">{error}</span>
        </div>
      )}

      {/* Action buttons */}
      {selectedFile && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="c4-btn flex flex-1 items-center justify-center gap-2"
            style={{ background: 'var(--color-accent)', color: 'var(--color-panel)' }}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                uploading…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                upload photo
              </>
            )}
          </button>
          
          {!uploading && (
            <button
              onClick={resetForm}
              className="sm:w-auto px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 sm:py-4 rounded-xl transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;