import React, { useState } from 'react';
import axios from 'axios';

interface TranscriptionButtonsProps {
  audioBlob: Blob;
  onDeepgramComplete: (transcript: any, duration: number) => void;
  onAssemblyAIComplete: (transcript: any, duration: number) => void;
}

const TranscriptionButtons: React.FC<TranscriptionButtonsProps> = ({ 
  audioBlob, 
  onDeepgramComplete, 
  onAssemblyAIComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWithDeepgram = async () => {
    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();
    try {
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      const response = await axios.post(
        'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true',
        audioBlob,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'audio/webm',
          },
        }
      );

      const data = response.data;
      if (!data.results || !data.results.channels || data.results.channels.length === 0) {
        throw new Error('Unexpected response format from Deepgram API');
      }
      const diarizedTranscript = data.results.channels[0].alternatives[0].words || [];
      const duration = (Date.now() - startTime) / 1000; // Convert to seconds
      onDeepgramComplete(diarizedTranscript, duration);
    } catch (error) {
      console.error('Error processing audio with Deepgram:', error);
      if (axios.isAxiosError(error)) {
        setError(`Error processing audio: ${error.response?.data?.message || error.message}`);
      } else {
        setError(`Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithAssemblyAI = async () => {
    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();
    try {
      const apiKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
      
      // Step 1: Upload the audio file
      const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', audioBlob, {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'audio/webm',
        },
      });

      const audioUrl = uploadResponse.data.upload_url;

      // Step 2: Submit the transcription job
      const transcriptionResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
        audio_url: audioUrl,
        speaker_labels: true,
        speech_model: 'nano' // Updated to use the 'nano' speech model
      }, {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      const transcriptId = transcriptionResponse.data.id;

      // Step 3: Poll for the transcription result
      let result;
      while (true) {
        const pollingResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { 'Authorization': apiKey },
        });
        result = pollingResponse.data;

        if (result.status === 'completed' || result.status === 'error') {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before polling again
      }

      if (result.status === 'completed') {
        // Transform the result to match the Deepgram format
        const diarizedTranscript = result.words.map((word: any) => ({
          word: word.text,
          start: word.start,
          end: word.end,
          speaker: word.speaker,
          confidence: word.confidence,
        }));
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        onAssemblyAIComplete(diarizedTranscript, duration);
      } else {
        throw new Error('Transcription failed or timed out');
      }
    } catch (error) {
      console.error('Error processing audio with AssemblyAI:', error);
      if (axios.isAxiosError(error)) {
        setError(`Error processing audio: ${error.response?.data?.message || error.message}`);
      } else {
        setError(`Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <button
        onClick={processWithDeepgram}
        disabled={isProcessing}
        className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400"
      >
        Transcribe with Deepgram
      </button>
      <button
        onClick={processWithAssemblyAI}
        disabled={isProcessing}
        className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:bg-gray-400"
      >
        Transcribe with AssemblyAI
      </button>
      {isProcessing && (
        <p className="text-center text-gray-600">Processing audio, please wait...</p>
      )}
      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}
    </div>
  );
};

export default TranscriptionButtons;