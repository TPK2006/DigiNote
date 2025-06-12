import React, { useState } from 'react';

const HelloFetcher = () => {
  const [message, setMessage] = useState('');
  const [insertStatus, setInsertStatus] = useState('');

  const fetchHello = async () => {
    try {
      const res = await fetch('/api/hello');
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching:', error);
      setMessage('Failed to fetch from server');
    }
  };

  const insertNote = async () => {
    try {
      const res = await fetch('/api/add-note');
      const data = await res.json();
      setInsertStatus(data.message || 'Insert success');
    } catch (error) {
      console.error('Insert failed:', error);
      setInsertStatus('Failed to insert note');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-6">
      <button
        onClick={fetchHello}
        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
      >
        Fetch Message
      </button>

      {message && (
        <p className="text-gray-800 text-lg font-medium">{message}</p>
      )}

      <button
        onClick={insertNote}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
      >
        Insert Note
      </button>

      {insertStatus && (
        <p className="text-gray-700 text-base">{insertStatus}</p>
      )}
    </div>
  );
};

export default HelloFetcher;
