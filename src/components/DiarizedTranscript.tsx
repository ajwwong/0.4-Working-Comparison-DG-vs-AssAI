import React from 'react';

interface Word {
  word: string;
  start: number;
  end: number;
  speaker: number;
  confidence: number;
}

interface DiarizedTranscriptProps {
  transcript: Word[];
}

const DiarizedTranscript: React.FC<DiarizedTranscriptProps> = ({ transcript }) => {
  if (!transcript || transcript.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Diarized Transcript</h2>
      <div className="space-y-2">
        {transcript.map((word, index) => (
          <span key={index} className="text-gray-700">
            {index === 0 || word.speaker !== transcript[index - 1].speaker ? (
              <span className="font-semibold text-blue-600 mr-1">
                Speaker {word.speaker}:
              </span>
            ) : null}
            {word.word}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DiarizedTranscript;