import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Chat } from '../types';
import { callSounds } from '../utils/callSounds';

interface AudioCallModalProps {
  chat: Chat;
  type: 'audio' | 'video';
  isIncoming?: boolean;
  callSignalState?: { type: 'offered' | 'answered' | 'declined' | 'ended'; payload?: any; timestamp?: number } | null;
  webRTCSignal?: { senderId: string; signal: any } | null;
  registerWebRTCSignalListener?: (listener: (payload: { senderId: string; signal: any }) => void) => () => void;
  sendWebRTCSignal?: (targetId: string, signal: any) => void;
  onEndCall: () => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

export const AudioCallModal: React.FC<AudioCallModalProps> = ({
  chat,
  isIncoming = false,
  callSignalState,
  webRTCSignal,
  registerWebRTCSignalListener,
  sendWebRTCSignal,
  onEndCall
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'declined' | 'ended'>(
    isIncoming ? 'connected' : 'ringing'
  );
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isAudioLive, setIsAudioLive] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const hasSentOffer = useRef(false);
  const hasCreatedAnswer = useRef(false);
  const mountTimeRef = useRef(Date.now());
  const componentIdRef = useRef(Math.random().toString(36).slice(2, 6));

  // Stable refs
  const sendSignalRef = useRef(sendWebRTCSignal);
  sendSignalRef.current = sendWebRTCSignal;
  const chatIdRef = useRef(chat.id);
  chatIdRef.current = chat.id;
  const isIncomingRef = useRef(isIncoming);
  isIncomingRef.current = isIncoming;

  const LOG_PREFIX = `[WebRTC-${componentIdRef.current}]`;

  // Track readiness for offer (caller only)
  const micReadyRef = useRef(false);
  const calleeReadyRef = useRef(false);
  const micPromiseRef = useRef<Promise<MediaStream> | null>(null);

  // 1. Handle call signaling events (answered / declined / ended)
  useEffect(() => {
    if (!callSignalState) return;
    if (callSignalState.timestamp && callSignalState.timestamp < mountTimeRef.current - 1000) return;

    if (callSignalState.type === 'answered') {
      callSounds.stopAll();
      setCallState('connected');
    } else if (callSignalState.type === 'declined') {
      callSounds.playDisconnect();
      setCallState('declined');
      setTimeout(() => onEndCall(), 1500);
    } else if (callSignalState.type === 'ended') {
      callSounds.playDisconnect();
      setCallState('ended');
      setTimeout(() => onEndCall(), 1200);
    }
  }, [callSignalState, onEndCall]);

  // Attach remote stream to dedicated HTMLAudioElement (clean single-pipe output without comb-filtering)
  const attachRemoteStream = useCallback((remoteStream: MediaStream) => {
    console.log(LOG_PREFIX, '🔊 Attaching remote stream, audio tracks:', remoteStream.getAudioTracks().length);

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.play().catch((e) => {
        console.warn(LOG_PREFIX, 'HTMLAudio play notice:', e);
      });
    }

    setIsAudioLive(true);
  }, [LOG_PREFIX]);

  // Create offer (caller only)
  const sendOffer = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || hasSentOffer.current) return;
    hasSentOffer.current = true;

    const senders = pc.getSenders();
    console.log(LOG_PREFIX, 'Creating offer. Senders:', senders.length);
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      // Boost sender bitrate using standard WebRTC API
      const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
      if (audioSender?.getParameters) {
        try {
          const params = audioSender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 128000;
            params.encodings[0].priority = 'high';
            await audioSender.setParameters(params);
          }
        } catch (e) {
          console.warn(LOG_PREFIX, 'Sender bitrate boost notice:', e);
        }
      }

      console.log(LOG_PREFIX, 'Offer SDP set. Sending to target:', chatIdRef.current);
      sendSignalRef.current?.(chatIdRef.current, { type: 'offer', sdp: offer });
    } catch (err) {
      console.error(LOG_PREFIX, 'createOffer error:', err);
      hasSentOffer.current = false;
    }
  }, [LOG_PREFIX]);

  // Check both gates before creating offer (caller only)
  const tryCreateOffer = useCallback(() => {
    if (hasSentOffer.current) return;
    console.log(LOG_PREFIX, 'tryCreateOffer check → mic:', micReadyRef.current, 'callee:', calleeReadyRef.current);
    if (!micReadyRef.current || !calleeReadyRef.current) return;
    console.log(LOG_PREFIX, '✅ Both gates open — creating offer now');
    sendOffer();
  }, [LOG_PREFIX, sendOffer]);

  // Process incoming WebRTC signal directly
  const processSignal = useCallback(async (senderId: string, signal: any) => {
    const pc = peerConnectionRef.current;
    console.log(LOG_PREFIX, '📥 Signal received:', signal?.type, 'from:', senderId, 'PC exists:', !!pc, 'signalingState:', pc?.signalingState);

    if (!pc) {
      console.error(LOG_PREFIX, '❌ No PeerConnection! Cannot process signal:', signal?.type);
      return;
    }

    try {
      if (signal.type === 'callee_ready') {
        if (!isIncomingRef.current) {
          console.log(LOG_PREFIX, 'CALLER: Got callee_ready from peer! Opening callee gate.');
          calleeReadyRef.current = true;
          tryCreateOffer();
        }

      } else if (signal.type === 'offer') {
        if (hasCreatedAnswer.current) {
          console.log(LOG_PREFIX, 'Already created answer, ignoring duplicate offer');
          return;
        }

        console.log(LOG_PREFIX, 'CALLEE: Got offer. Ensuring mic is ready first...');
        if (micPromiseRef.current) {
          try {
            await micPromiseRef.current;
          } catch (e) {}
        }

        hasCreatedAnswer.current = true;
        console.log(LOG_PREFIX, 'CALLEE: Setting remote description (offer)...');
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        console.log(LOG_PREFIX, 'CALLEE: Remote description set. Flushing', iceCandidatesQueue.current.length, 'queued candidates');
        for (const cand of iceCandidatesQueue.current) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        iceCandidatesQueue.current = [];

        console.log(LOG_PREFIX, 'CALLEE: Creating answer...');
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Boost sender bitrate on callee side
        const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
        if (audioSender?.getParameters) {
          try {
            const params = audioSender.getParameters();
            if (params.encodings && params.encodings.length > 0) {
              params.encodings[0].maxBitrate = 128000;
              params.encodings[0].priority = 'high';
              await audioSender.setParameters(params);
            }
          } catch (e) {
            console.warn(LOG_PREFIX, 'Callee sender bitrate boost notice:', e);
          }
        }

        console.log(LOG_PREFIX, 'CALLEE: Answer created. Sending to', senderId);
        sendSignalRef.current?.(senderId, { type: 'answer', sdp: answer });

        setCallState('connected');
        callSounds.stopAll();
        console.log(LOG_PREFIX, 'CALLEE: Answer sent successfully ✅');

      } else if (signal.type === 'answer') {
        if (pc.signalingState === 'have-local-offer') {
          console.log(LOG_PREFIX, 'CALLER: Got answer. Setting remote description...');
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          console.log(LOG_PREFIX, 'CALLER: Remote description set. Flushing', iceCandidatesQueue.current.length, 'queued candidates');
          for (const cand of iceCandidatesQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
          iceCandidatesQueue.current = [];

          setCallState('connected');
          callSounds.stopAll();
          console.log(LOG_PREFIX, 'CALLER: Answer processed. Connection established ✅');
        } else {
          console.warn(LOG_PREFIX, 'Ignoring answer — wrong signalingState:', pc.signalingState);
        }

      } else if (signal.type === 'candidate' && signal.candidate) {
        if (pc.remoteDescription?.type) {
          console.log(LOG_PREFIX, 'Adding ICE candidate directly');
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          console.log(LOG_PREFIX, 'Queuing ICE candidate (no remote desc yet)');
          iceCandidatesQueue.current.push(signal.candidate);
        }
      }
    } catch (err) {
      console.error(LOG_PREFIX, 'Signal processing error:', err);
    }
  }, [LOG_PREFIX, tryCreateOffer]);

  // 2. PeerConnection + Mic (runs ONCE on mount)
  useEffect(() => {
    let isCancelled = false;
    const id = componentIdRef.current;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;
    hasSentOffer.current = false;
    hasCreatedAnswer.current = false;
    micReadyRef.current = false;
    calleeReadyRef.current = false;

    console.log(`[WebRTC-${id}] PC created. Role: ${isIncomingRef.current ? 'CALLEE' : 'CALLER'}, chatId: ${chatIdRef.current}`);

    pc.onconnectionstatechange = () => console.log(`[WebRTC-${id}] connectionState:`, pc.connectionState);
    pc.oniceconnectionstatechange = () => console.log(`[WebRTC-${id}] iceState:`, pc.iceConnectionState);
    pc.onsignalingstatechange = () => console.log(`[WebRTC-${id}] signalingState:`, pc.signalingState);
    pc.onicegatheringstatechange = () => console.log(`[WebRTC-${id}] iceGatheringState:`, pc.iceGatheringState);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC-${id}] Sending ICE candidate`);
        sendSignalRef.current?.(chatIdRef.current, {
          type: 'candidate',
          candidate: event.candidate.toJSON()
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`[WebRTC-${id}] 🔊 ontrack! kind: ${event.track.kind}, streams: ${event.streams.length}`);
      const remoteStream = (event.streams?.[0]) || new MediaStream([event.track]);
      attachRemoteStream(remoteStream);
    };

    if (!isIncomingRef.current) {
      callSounds.startRingback();
    }

    // Balanced, crystal-clear microphone audio
    const micPromise = navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    micPromiseRef.current = micPromise;

    micPromise
      .then((stream) => {
        if (isCancelled) {
          console.log(`[WebRTC-${id}] Component unmounted, stopping mic tracks`);
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        console.log(`[WebRTC-${id}] Mic acquired:`, stream.getAudioTracks().map(t => t.label));
        localStreamRef.current = stream;

        // Add audio tracks to PC
        stream.getAudioTracks().forEach((track) => {
          console.log(`[WebRTC-${id}] Adding track to PC:`, track.kind, track.label);
          pc.addTrack(track, stream);
        });

        micReadyRef.current = true;

        if (isIncomingRef.current) {
          console.log(`[WebRTC-${id}] CALLEE: Sending callee_ready to`, chatIdRef.current);
          sendSignalRef.current?.(chatIdRef.current, { type: 'callee_ready' });
        } else {
          tryCreateOffer();
        }
      })
      .catch((err) => {
        console.error(`[WebRTC-${id}] Mic error:`, err);
      });

    return () => {
      console.log(`[WebRTC-${id}] 🧹 Cleanup! Closing PC and stopping tracks.`);
      isCancelled = true;
      callSounds.stopAll();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pc.close();
      peerConnectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Fallback timer for caller in case callee_ready broadcast is dropped
  useEffect(() => {
    if (!isIncoming && callState === 'connected') {
      const fallbackTimer = setTimeout(() => {
        if (!hasSentOffer.current && micReadyRef.current) {
          console.log(LOG_PREFIX, '⏱️ Fallback timer: callee_ready not received after 2.5s, creating offer anyway');
          calleeReadyRef.current = true;
          tryCreateOffer();
        }
      }, 2500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isIncoming, callState, tryCreateOffer, LOG_PREFIX]);

  // 4. Subscribe to WebRTC signals synchronously via registerWebRTCSignalListener (ZERO BATCHING LOSS)
  useEffect(() => {
    if (registerWebRTCSignalListener) {
      console.log(LOG_PREFIX, 'Subscribing to synchronous WebRTC signal listener');
      const unregister = registerWebRTCSignalListener(({ senderId, signal }) => {
        processSignal(senderId, signal);
      });
      return () => {
        console.log(LOG_PREFIX, 'Unsubscribing from WebRTC signal listener');
        unregister();
      };
    }
  }, [registerWebRTCSignalListener, processSignal, LOG_PREFIX]);

  // 4b. Fallback for state-based signals if registerWebRTCSignalListener is not provided
  useEffect(() => {
    if (!registerWebRTCSignalListener && webRTCSignal?.signal) {
      processSignal(webRTCSignal.senderId, webRTCSignal.signal);
    }
  }, [webRTCSignal, registerWebRTCSignalListener, processSignal]);

  // 5. Timer
  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      callSounds.stopAll();
      timer = setInterval(() => setSeconds((p) => p + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeaker;
    }
    setIsSpeaker(!isSpeaker);
  };

  const formatTime = (ts: number) => {
    const m = Math.floor(ts / 60), s = ts % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-8 text-white select-none overflow-hidden animate-fadeIn">
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#0a0a0f]/60 to-black/95 pointer-events-none" />

      <div className="flex flex-col items-center space-y-2 pt-6 z-10 animate-slideDown">
        <span className="text-xs uppercase tracking-widest text-[#0095F6] font-bold">Pinterest Live Voice Call</span>
        <h2 className="text-3xl font-extrabold tracking-tight">{chat.name}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-300 font-mono bg-white/[0.08] px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
            {callState === 'ringing' ? 'Calling...' : callState === 'declined' ? 'Call Declined' : callState === 'ended' ? 'Call Ended' : formatTime(seconds)}
          </span>
          {isAudioLive && (
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Audio</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-center my-auto z-10">
        {callState === 'ringing' && (
          <>
            <div className="absolute w-52 h-52 rounded-full border border-[#0095F6]/30 animate-ping opacity-40" />
            <div className="absolute w-40 h-40 rounded-full border border-white/20 animate-pulse" />
          </>
        )}
        {callState === 'connected' && (
          <>
            <div className="absolute w-52 h-52 rounded-full border-2 border-emerald-500/30 animate-pulse opacity-60" />
            <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 animate-ping [animation-duration:3s]" />
          </>
        )}
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl backdrop-blur-md relative z-10">
          <img src={chat.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} alt={chat.name} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="w-full max-w-sm flex items-center justify-center space-x-6 pb-8 z-10 animate-slideUp">
        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 backdrop-blur-md border ${isMuted ? 'bg-red-500/80 text-white border-red-500/30 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border-white/10'}`} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button onClick={toggleSpeaker} className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 backdrop-blur-md border ${isSpeaker ? 'bg-white/25 text-white border-white/20 shadow-md' : 'bg-white/10 text-zinc-400 border-white/10'}`} title={isSpeaker ? 'Mute speaker' : 'Unmute speaker'}>
          {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
        <button onClick={() => { callSounds.playDisconnect(); onEndCall(); }} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition" title="End Call">
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
