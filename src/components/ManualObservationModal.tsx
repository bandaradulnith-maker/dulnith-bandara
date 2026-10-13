import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { OrganismGroup } from '../types/biodiversity';
import { ASSETS } from '../data/mockBiodiversityData';

interface ManualObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (obsData: any) => void;
}

export const ManualObservationModal: React.FC<ManualObservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [photoUrl, setPhotoUrl] = useState<string>(ASSETS.blueMagpie);
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [group, setGroup] = useState<OrganismGroup>('bird');
  const [placeName, setPlaceName] = useState('Sinharaja Rainforest Buffer');
  const [habitat, setHabitat] = useState('Lowland Wet Evergreen Rainforest');
  const [notes, setNotes] = useState('');
  const [generalized, setGeneralized] = useState(true);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      photoUrl,
      organismGroup: group,
      suggestedSpecies: {
        commonName: commonName || 'Field Specimen',
        scientificName: scientificName || 'Taxon sp.',
        confidence: 0.9,
      },
      observedAt: new Date().toISOString(),
      approximateLocation: {
        placeName,
        lat: 6.42,
        lng: 80.46,
        generalized,
      },
      habitat,
      notes,
      visibility,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Log Field Observation Manually
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Add specimen directly to your personal nature journal
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* Photo Preview & Upload */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Specimen Photograph
            </label>
            <div className="flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Specimen preview"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
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

          {/* Names */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Common Name
              </label>
              <input
                type="text"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="e.g. Sri Lanka Blue Magpie"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Scientific Name (Optional)
              </label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="e.g. Urocissa ornata"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 italic focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Organism Group */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Organism Classification
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as OrganismGroup)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            >
              <option value="bird">Bird</option>
              <option value="mammal">Mammal</option>
              <option value="insect">Insect / Butterfly</option>
              <option value="plant">Flora / Plant</option>
              <option value="reptile">Reptile</option>
              <option value="amphibian">Amphibian</option>
            </select>
          </div>

          {/* Location & Habitat */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Location Area
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Habitat
              </label>
              <input
                type="text"
                value={habitat}
                onChange={(e) => setHabitat(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                required
              />
            </div>
          </div>

          {/* Field Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Field Notes & Behavior Observed
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record canopy height, feeding behavior, flock size..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
            />
          </div>

          {/* Sensitive Species Protection Toggle */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Mask Coordinates (Taxon Safety)</span>
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Protects endangered organisms against poaching.
              </p>
            </div>
            <input
              type="checkbox"
              checked={generalized}
              onChange={(e) => setGeneralized(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl shadow-md transition-all pt-3"
          >
            Save to Nature Journal
          </button>
        </form>
      </div>
    </div>
  );
};
