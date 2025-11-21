import { useState } from 'react'

export function VocabularyApp() {
  const [sentence, setSentence] = useState('')

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Vocabulary</h1>
        <p className="text-sm opacity-90">Learn words in context</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        {/* Sentence Input */}
        <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <label htmlFor="sentence" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a sentence to translate
          </label>
          <textarea
            id="sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Type or paste a sentence here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{sentence.length}/500</span>
            <button
              onClick={() => {
                console.log('Translate:', sentence)
                // TODO: Implement translation
              }}
              disabled={!sentence.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Translate
            </button>
          </div>
        </section>

        {/* Translation Result - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Translation</h2>
          <p className="text-gray-500 italic">Translation will appear here...</p>
        </section>

        {/* Vocabulary List - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">My Vocabulary</h2>
          <p className="text-gray-500 italic">Saved words will appear here...</p>
        </section>
      </main>
    </div>
  )
}
