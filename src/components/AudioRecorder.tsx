import React, { useState, useRef } from 'react';
import { Mic, StopCircle } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onStart,
  onStop,
}) => {
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorderRef.current.addEventListener('stop', handleStop);
      mediaRecorderRef.current.start();
      onStart();
      setError(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error accessing microphone. Please make sure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    onStop(blob);
    chunksRef.current = [];
    
    // Stop all tracks in the stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white px-4 py-2 rounded-md font-semibold transition-colors flex items-center`}
      >
        {isRecording ? (
          <>
            <StopCircle className="mr-2" size={18} />
            Stop
          </>
        ) : (
          <>
            <Mic className="mr-2" size={18} />
            Record
          </>
        )}
      </button>
      {error && (
        <p className="mt-4 text-red-500">{error}</p>
      )}
    </div>
  );
};

export default AudioRecorder;