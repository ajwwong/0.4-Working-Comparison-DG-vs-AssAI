import React, { useState, useRef } from 'react';
import { Mic, StopCircle, Play, Upload } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import DiarizedTranscript from './components/DiarizedTranscript';
import TranscriptionButtons from './components/TranscriptionButtons';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [deepgramTranscript, setDeepgramTranscript] = useState<any>(null);
  const [assemblyAITranscript, setAssemblyAITranscript] = useState<any>(null);
  const [deepgramDuration, setDeepgramDuration] = useState<number | null>(null);
  const [assemblyAIDuration, setAssemblyAIDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = (blob: Blob) => {
    setIsRecording(false);
    setAudioBlob(blob);
  };

  const playAudio = () => {
    if (audioRef.current && audioBlob) {
      audioRef.current.src = URL.createObjectURL(audioBlob);
      audioRef.current.play();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBlob(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Audio Transcription Comparison</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between mb-4">
          <AudioRecorder
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
          />
          <button
            onClick={triggerFileUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <Upload className="mr-2" size={18} />
            Upload Audio
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
        </div>
        {audioBlob && (
          <div className="mt-4">
            <button
              onClick={playAudio}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors w-full"
            >
              <Play className="inline-block mr-2" size={18} />
              Play Audio
            </button>
            <audio ref={audioRef} className="hidden" />
          </div>
        )}
        {audioBlob && (
          <TranscriptionButtons
            audioBlob={audioBlob}
            onDeepgramComplete={(transcript, duration) => {
              setDeepgramTranscript(transcript);
              setDeepgramDuration(duration);
            }}
            onAssemblyAIComplete={(transcript, duration) => {
              setAssemblyAITranscript(transcript);
              setAssemblyAIDuration(duration);
            }}
          />
        )}
      </div>
      {deepgramTranscript && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Deepgram Transcript</h2>
          <p className="mb-4 text-gray-600">Duration: {deepgramDuration?.toFixed(2)} seconds</p>
          <DiarizedTranscript transcript={deepgramTranscript} />
        </div>
      )}
      {assemblyAITranscript && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">AssemblyAI Transcript</h2>
          <p className="mb-4 text-gray-600">Duration: {assemblyAIDuration?.toFixed(2)} seconds</p>
          <DiarizedTranscript transcript={assemblyAITranscript} />
        </div>
      )}
    </div>
  );
}

export default App;