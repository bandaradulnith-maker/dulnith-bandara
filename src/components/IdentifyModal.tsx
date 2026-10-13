import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  HelpCircle,
  BookOpen,
  MapPin,
  Scale,
  ArrowRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Scan,
  Zap,
  Eye,
} from 'lucide-react';
import { IdentificationResult, OrganismGroup, Species, AppTheme } from '../types/biodiversity';
import { ASSETS } from '../data/mockBiodiversityData';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { THEME_CONFIGS } from '../utils/theme';

interface IdentifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObservation: (data: {
    photoUrl: string;
    organismGroup: OrganismGroup;
    suggestedSpecies: any;
    notes: string;
    placeName: string;
  }) => void;
  onOpenCompare: (speciesA?: Species, speciesB?: Species) => void;
  onOpenBioGuideWithContext: (speciesName: string) => void;
  currentLang: Language;
  theme?: AppTheme;
}

export const IdentifyModal: React.FC<IdentifyModalProps> = ({
  isOpen,
  onClose,
  onSaveObservation,
  onOpenCompare,
  onOpenBioGuideWithContext,
  currentLang,
  theme = 'forest',
}) => {
  const t = TRANSLATIONS[currentLang];
  const currentTheme = THEME_CONFIGS[theme];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [organismGroup, setOrganismGroup] = useState<OrganismGroup | 'auto'>('auto');
  const [rotation, setRotation] = useState<number>(0);
  const [locationHint, setLocationHint] = useState('Sinharaja Rainforest Northern Sector');
  const [notes, setNotes] = useState('Observed in canopy layer during morning expedition.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auto-Identify on Insert Mode toggle
  const [autoIdentifyOnInsert, setAutoIdentifyOnInsert] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scanStep, setScanStep] = useState<string>('Initializing AI Vision...');
  const [showFeatureMarkers, setShowFeatureMarkers] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Preset specimens across diverse organism groups
  const presets = [
    { name: 'Blue Magpie', url: ASSETS.blueMagpie, group: 'bird' as OrganismGroup },
    { name: 'Sri Lankan Leopard', url: ASSETS.heroLeopard, group: 'mammal' as OrganismGroup },
    { name: 'Green Sea Turtle', url: ASSETS.greenSeaTurtle, group: 'marine' as OrganismGroup },
    { name: 'Green Pit Viper', url: ASSETS.greenPitViper, group: 'reptile' as OrganismGroup },
    { name: 'Purple-faced Langur', url: ASSETS.purpleFacedLangur, group: 'mammal' as OrganismGroup },
    { name: 'Emerald Swallowtail', url: ASSETS.emeraldSwallowtail, group: 'insect' as OrganismGroup },
    { name: 'Pitcher Plant', url: ASSETS.pitcherPlant, group: 'plant' as OrganismGroup },
    { name: 'Oceanic Manta Ray', url: ASSETS.oceanMantaRay, group: 'marine' as OrganismGroup },
  ];

  // AI Pipeline Runner
  const runIdentification = useCallback(
    async (imageData: string, groupHint?: OrganismGroup | 'auto') => {
      setIsLoading(true);
      setErrorMsg(null);
      setResult(null);

      // Simulation steps while server processes
      setScanStep('📐 Isolating specimen morphometrics & outlines...');
      const stepTimer1 = setTimeout(() => {
        setScanStep('🔬 Extracting diagnostic visible features...');
      }, 700);
      const stepTimer2 = setTimeout(() => {
        setScanStep('🌿 Cross-referencing GBIF & IUCN taxonomic records...');
      }, 1500);

      try {
        const res = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageData,
            organismGroup: groupHint && groupHint !== 'auto' ? groupHint : organismGroup === 'auto' ? undefined : organismGroup,
            locationHint,
            notes,
          }),
        });

        if (!res.ok) {
          throw new Error('AI Identification service encountered an error.');
        }

        const data: IdentificationResult = await res.json();
        setResult(data);
      } catch (err: any) {
        console.error('Identification failed:', err);
        setErrorMsg(err.message || 'Failed to identify species. Please check connection and try again.');
      } finally {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setIsLoading(false);
      }
    },
    [organismGroup, locationHint, notes]
  );

  // Handle image load from file or drop
  const handleProcessImage = useCallback(
    (dataUrl: string, groupHint?: OrganismGroup | 'auto') => {
      setSelectedImage(dataUrl);
      setRotation(0);
      setResult(null);
      setErrorMsg(null);

      if (autoIdentifyOnInsert) {
        runIdentification(dataUrl, groupHint);
      }
    },
    [autoIdentifyOnInsert, runIdentification]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProcessImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProcessImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clipboard paste listener (Ctrl+V anywhere in modal)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              handleProcessImage(reader.result as string);
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleProcessImage]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error or unsupported in environment:', err);
      setIsCameraActive(false);
      setErrorMsg('Camera access unavailable. Please use file upload or select a specimen preset.');
    }
  };

  const captureCameraFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        // Stop camera tracks
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setIsCameraActive(false);
        handleProcessImage(dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleSave = () => {
    if (!selectedImage) return;

    const group =
      organismGroup !== 'auto'
        ? organismGroup
        : result?.leadCandidate?.commonName.toLowerCase().includes('bird') ||
          result?.leadCandidate?.scientificName.includes('Urocissa')
        ? 'bird'
        : 'mammal';

    onSaveObservation({
      photoUrl: selectedImage,
      organismGroup: group,
      suggestedSpecies: result?.leadCandidate
        ? {
            scientificName: result.leadCandidate.scientificName,
            commonName: result.leadCandidate.commonName,
            confidence: result.leadCandidate.confidenceEstimate,
            alternativeCandidates: result.alternativeCandidates?.map((a) => ({
              scientificName: a.scientificName,
              commonName: a.commonName,
              distinction: a.distinguishingTraits,
            })),
          }
        : undefined,
      notes: notes,
      placeName: locationHint,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  // AI Voice Guide reading of identification results
  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window) || !result?.leadCandidate) return;

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    window.speechSynthesis.cancel();
    const candidate = result.leadCandidate;
    const text = `Identified as ${candidate.commonName}, scientific name ${candidate.scientificName}. Estimated confidence is ${Math.round(
      candidate.confidenceEstimate * 100
    )} percent. Diagnostic markers observed include ${candidate.visibleFeatures.slice(0, 2).join(' and ')}. IUCN status is ${candidate.statusLabel}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    setIsPlayingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 transition-all ${
          isDragOver ? 'ring-4 ring-emerald-500/50' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${currentTheme.primaryBg} text-white flex items-center justify-center shadow-sm`}>
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  AI Wildlife Scanner
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                  AI Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Instant Diagnostic Identification & Morphometrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Identify on Insert Mode Switch */}
            <button
              onClick={() => setAutoIdentifyOnInsert(!autoIdentifyOnInsert)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                autoIdentifyOnInsert
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-500'
              }`}
              title="When enabled, inserting any photo triggers AI identification immediately"
            >
              <Zap className={`w-3 h-3 ${autoIdentifyOnInsert ? 'text-amber-500 fill-amber-500' : ''}`} />
              <span>Auto-Scan: {autoIdentifyOnInsert ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                if (isPlayingVoice) window.speechSynthesis?.cancel();
                stopCamera();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Saved Notification */}
          {savedSuccess && (
            <div className="bg-emerald-800 text-white rounded-2xl p-3 flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Observation successfully saved to your field journal!</span>
            </div>
          )}

          {/* Active Live Camera Stream View */}
          {isCameraActive ? (
            <div className="relative aspect-4/3 rounded-2xl bg-black overflow-hidden flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 flex items-center gap-3">
                <button
                  onClick={captureCameraFrame}
                  className="px-6 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-full shadow-lg active:scale-95"
                >
                  Snap & Identify
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-black/60 text-white font-medium text-xs rounded-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            /* Selected Image Preview with Live Scanning Laser Effect */
            <div className="space-y-3">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-inner group">
                <img
                  src={selectedImage}
                  alt="Selected specimen"
                  referrerPolicy="no-referrer"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="w-full h-full object-contain transition-transform duration-200"
                />

                {/* Laser Scanning Beam when Loading */}
                {isLoading && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Scanner grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:24px_24px]" />
                    {/* Sweeping laser line */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[bounce_2.5s_infinite]" />
                    {/* Reticle brackets */}
                    <div className="absolute inset-8 border border-emerald-400/40 rounded-2xl pointer-events-none" />
                    <div className="absolute top-10 left-10 text-[9px] font-mono text-emerald-300 bg-black/70 px-2 py-0.5 rounded">
                      SPECTRUM_AI_ACTIVE
                    </div>
                  </div>
                )}

                {/* AI Feature Pins / Diagnostic Markers on Identified Image */}
                {!isLoading && result?.leadCandidate && showFeatureMarkers && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-8 left-8 bg-black/75 backdrop-blur-md border border-emerald-400/60 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{result.leadCandidate.visibleFeatures[0]?.slice(0, 32)}...</span>
                    </div>
                    {result.leadCandidate.visibleFeatures[1] && (
                      <div className="absolute bottom-10 right-8 bg-black/75 backdrop-blur-md border border-teal-400/60 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                        <span>{result.leadCandidate.visibleFeatures[1]?.slice(0, 32)}...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons on Image */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white rounded-full transition-colors"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white rounded-full transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scanning Telemetry Banner */}
              {isLoading && (
                <div className="bg-emerald-950 text-white p-3.5 rounded-2xl flex items-center gap-3 text-xs shadow-md border border-emerald-800 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300 shrink-0" />
                  <div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-300 block">
                      AI Vision Inference in Progress
                    </span>
                    <p className="text-emerald-100/90 text-[11px]">{scanStep}</p>
                  </div>
                </div>
              )}

              {/* Organism Group & Field Notes Selectors */}
              {!result && !isLoading && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Organism Group (Optional Taxonomic Filter)
                    </label>
                    <select
                      value={organismGroup}
                      onChange={(e) => setOrganismGroup(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="auto">Auto-detect from image</option>
                      <option value="bird">Bird (Avian)</option>
                      <option value="mammal">Mammal</option>
                      <option value="marine">Marine / Ocean (Turtles, Rays)</option>
                      <option value="reptile">Reptile / Snake</option>
                      <option value="insect">Insect / Butterfly</option>
                      <option value="plant">Flora / Carnivorous Plant</option>
                      <option value="amphibian">Amphibian</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Field Location / Habitat
                    </label>
                    <input
                      type="text"
                      value={locationHint}
                      onChange={(e) => setLocationHint(e.target.value)}
                      placeholder="e.g. Sinharaja Forest canopy, 600m elevation"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <button
                    onClick={() => runIdentification(selectedImage)}
                    className={`w-full ${currentTheme.primaryBg} ${currentTheme.primaryHover} active:scale-98 text-white font-bold text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Run AI Species Identification</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Upload / Capture Empty State with Drag-and-Drop Zone */
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-3xl p-6 text-center space-y-3 transition-colors ${
                  isDragOver
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl ${currentTheme.badgeBg} ${currentTheme.badgeText} mx-auto flex items-center justify-center shadow-sm`}>
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Insert Wildlife Photograph
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                    Drag and drop here, paste from clipboard (Ctrl+V), or take a photo. Auto-identify will analyze it immediately!
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={startCamera}
                    className={`px-4 py-2.5 ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Sample Wildlife Presets across Decks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Instant Specimen Presets
                  </span>
                  <span className="text-[10px] text-slate-400">Click to Auto-Scan</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleProcessImage(preset.url, preset.group)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/90 hover:border-emerald-600 text-left transition-all bg-white group shadow-sm hover:shadow"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-800">
                          {preset.name}
                        </p>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {preset.group}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI IDENTIFICATION RESULTS DISPLAY */}
          {result && !isLoading && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              {/* Outcome Banner */}
              <div
                className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs ${
                  result.outcome === 'strong_candidate'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                    : result.outcome === 'multiple_candidates'
                    ? 'bg-amber-50 border border-amber-200 text-amber-950'
                    : 'bg-slate-100 border border-slate-200 text-slate-800'
                }`}
              >
                {result.outcome === 'strong_candidate' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : result.outcome === 'multiple_candidates' ? (
                  <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider">
                    {result.outcome === 'strong_candidate'
                      ? 'Outcome A: Strong Candidate'
                      : result.outcome === 'multiple_candidates'
                      ? 'Outcome B: Multiple Possible Species'
                      : 'Outcome C: Unable to Identify Reliably'}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-snug">
                    {result.outcome === 'strong_candidate'
                      ? 'Diagnostic morphological keys visible in photo.'
                      : result.outcome === 'multiple_candidates'
                      ? 'Shared traits detected across related taxa. Review alternatives below.'
                      : result.uncertaintyExplanation || 'Insufficient visual evidence or angle.'}
                  </p>
                </div>
              </div>

              {/* Lead Candidate Details */}
              {result.leadCandidate && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {result.leadCandidate.commonName}
                        </h3>
                        <p className="text-xs italic font-serif text-slate-600">
                          {result.leadCandidate.scientificName}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full shrink-0">
                        {result.leadCandidate.conservationStatus} · {result.leadCandidate.statusLabel}
                      </span>
                    </div>

                    {/* Confidence Indicator + Voice Narration trigger */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Confidence Estimate:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800 tabular-nums">
                          {Math.round(result.leadCandidate.confidenceEstimate * 100)}% (Visual Match)
                        </span>
                        <button
                          onClick={handlePlayVoice}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          title="Listen to AI Voice Field Guide"
                        >
                          {isPlayingVoice ? (
                            <VolumeX className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic mt-0.5">
                      *AI-assisted visual match distinguished from certified lab validation.
                    </p>
                  </div>

                  {/* Visible Distinguishing Features in this photo */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">
                        Visible Distinguishing Features Observed:
                      </p>
                      <button
                        onClick={() => setShowFeatureMarkers(!showFeatureMarkers)}
                        className="text-[10px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{showFeatureMarkers ? 'Hide Pins' : 'Show Pins'}</span>
                      </button>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {result.leadCandidate.visibleFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Habitat, Diet, Ecological Role */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
                    <div>
                      <strong className="text-slate-800">Habitat & Range: </strong>
                      {result.leadCandidate.habitat} ({result.leadCandidate.geographicRange})
                    </div>
                    <div>
                      <strong className="text-slate-800">Diet & Behavior: </strong>
                      {result.leadCandidate.diet}; {result.leadCandidate.behavior}
                    </div>
                    <div>
                      <strong className="text-slate-800">Ecological Role: </strong>
                      {result.leadCandidate.ecologicalRole}
                    </div>
                  </div>

                  {/* Similar Species & Field Separation */}
                  {result.leadCandidate.similarSpecies && result.leadCandidate.similarSpecies.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-bold text-slate-900">
                        How to Distinguish from Similar Species:
                      </p>
                      <div className="space-y-1.5">
                        {result.leadCandidate.similarSpecies.map((sim, i) => (
                          <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                            <span className="font-semibold text-slate-800">{sim.name}: </span>
                            <span className="text-slate-600">{sim.distinguishingKeys}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources Citations */}
                  {result.leadCandidate.sources && result.leadCandidate.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
                      <span className="font-semibold text-slate-500">Scientific Sources Cited:</span>
                      {result.leadCandidate.sources.map((s, i) => (
                        <p key={i}>· {s.title} ({s.organization})</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Alternative Candidates */}
              {result.alternativeCandidates && result.alternativeCandidates.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Alternative Candidates
                  </h4>
                  <div className="space-y-2">
                    {result.alternativeCandidates.map((alt, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900">{alt.commonName}</strong>
                          <span className="italic font-serif text-slate-500">{alt.scientificName}</span>
                        </div>
                        <p className="text-slate-600">{alt.distinguishingTraits}</p>
                        {alt.suggestedVerificationAngle && (
                          <p className="text-[10px] text-emerald-800 font-medium">
                            💡 Verification tip: {alt.suggestedVerificationAngle}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleSave}
                  className={`w-full ${currentTheme.primaryBg} ${currentTheme.primaryHover} active:scale-98 text-white font-bold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Observation to Field Journal</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (result.leadCandidate) {
                        onOpenBioGuideWithContext(result.leadCandidate.commonName);
                        onClose();
                      }
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ask BioGuide AI</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenCompare();
                      onClose();
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare Species</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
