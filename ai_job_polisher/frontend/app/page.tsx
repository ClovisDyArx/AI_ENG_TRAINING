'use client';
import { useState } from "react";


export default function Home() {
  // States
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [polishedDescription, setPolishedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // API handler
  const handleSubmit = async (e : Event) => {
    e.preventDefault();
    setIsLoading(true);
    setPolishedDescription('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/polish',
        {
          method: 'POST',
          headers: { 'Content-Type' : 'application/json' },
          body: JSON.stringify({ job_description: description, desired_tone: tone })
        }
      );
      
      if (!response.ok)
        throw new Error(`API Error: ${response.statusText}`);

      const message = await response.json();
      setPolishedDescription(message);

    } catch (err) {
      setError(err.message);

    } finally {
      setIsLoading(false);
    }
  };

  // UI
  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-slate-900 text-slate-100 font-sans">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">AI Job Description Polisher</h1>
          <p className="text-slate-400 mt-2">Turn a basic job description into a compelling post.</p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Input Section */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-lg font-medium mb-2 text-slate-300">
              Paste your job description below:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., We need a Python developer. Must know Django. 5 years experience."
              className="w-full h-48 p-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tone Selection Section */}
          <div className="mb-6">
            <h3 className="block text-lg font-medium mb-3 text-slate-300">Select a tone:</h3>
            <div className="flex gap-4">
              {['Professional', 'Enthusiastic', 'Concise'].map((toneValue) => (
                <label key={toneValue} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tone"
                    value={toneValue}
                    checked={tone === toneValue}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  />
                  {toneValue}
                </label>
              ))}
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !description}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all"
          >
            {isLoading ? 'Polishing...' : '✨ Polish with AI'}
          </button>
        </form>

        {/* Output Section */}
        {error && <div className="mt-8 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}
        
        {polishedDescription && (
          <div className="mt-10 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Polished Description:</h2>
            <div className="whitespace-pre-wrap text-slate-300">{polishedDescription.polished_job.content}</div>
          </div>
        )}
      </div>
    </main>
  );

}
