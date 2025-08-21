'use client'; // This directive is crucial for using React hooks like useState

import { useState } from 'react';

export default function Home() {
  // --- State Management ---
  // 'prompt' holds the text from the textarea
  const [prompt, setPrompt] = useState('');
  // 'result' will hold the AI's response from our backend
  const [result, setResult] = useState('');
  // 'isLoading' will be true while we wait for the API response
  const [isLoading, setIsLoading] = useState(false);

  // --- API Call Handler ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setIsLoading(true); // Show the loading indicator
    setResult(''); // Clear previous results

    try {
      // Make a POST request to our Python backend
      const response = await fetch('http://127.0.0.1:8000/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.generated_text.content); // Update the state with the AI's response

    } catch (error) {
      console.error("Failed to fetch from backend:", error);
      setResult(`Error: Could not fetch response. Is the Python backend running? Details: ${error.message}`);
    } finally {
      setIsLoading(false); // Hide the loading indicator
    }
  };

  // --- UI Rendering (JSX) ---
  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Simple AI Text Generator</h1>
      <p className="mb-6 text-gray-400">Enter a prompt and get a response from the Python backend.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Write a short story about a robot who discovers music..."
          className="w-full h-40 p-4 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Text'}
        </button>
      </form>

      {/* --- Result Display --- */}
      {result && (
        <div className="mt-8 w-full max-w-2xl p-6 bg-gray-800 border border-gray-700 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">AI Response:</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </main>
  );
}