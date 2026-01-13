'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';

const TestErrorHandlingPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Error Handling</h1>
      <p className="mb-4 text-gray-600">
        This page allows you to test the error handling in the chat interface.
      </p>
      

      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-medium text-yellow-800">Testing Instructions:</h3>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Try sending messages to test normal operation</li>
          <li>Disconnect your network to test connection error handling</li>
          <li>Try sending multiple rapid messages to test loading states</li>
          <li>Check that error messages are user-friendly and helpful</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
        <ChatInterface
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>
    </div>
  );
};

export default TestErrorHandlingPage;