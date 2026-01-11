import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';

function ApprovalGate({ children, requireApproval = false }) {
  const [isApproved, setIsApproved] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const checkApproval = async () => {
      if (!user) {
        setIsApproved(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          setIsApproved(userDoc.data().isApproved || false);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    checkApproval();
  }, [user]);

  // If not requiring approval, show content regardless
  if (!requireApproval) {
    return <>{children}</>;
  }

  // If requiring approval, check status
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || !isApproved) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center border-4 border-orange-300">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="text-xl font-bold mb-2">Approval Required</h3>
        <div className="text-gray-700 mb-3">
            <p>Thanks for your interest in volunteering to feed our campus cats!</p>
            <p>
            If you haven't completed your training orientation with an officer, please fill out{' '}
            <a 
                href="https://forms.gle/3TWKgvE5iEQVugFJA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
            >
                this form
            </a>
            , and an officer will reach out shortly.
            </p>
          </div>
      </div>
    );
  }

  // User is approved, show the actual content
  return <>{children}</>;
}

export default ApprovalGate;