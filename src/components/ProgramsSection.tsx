import React, { useState } from 'react';
import { initialPrograms } from '../data/mockData';
import { Program } from '../types';
import { Heart, ShieldAlert, Scale, BookOpen, Calendar, MapPin, Users, ArrowRight, X, Sparkles } from 'lucide-react';

interface ProgramsSectionProps {
  onOpenLegalAid: () => void;
  programs?: Program[];
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({ onOpenLegalAid, programs = initialPrograms }) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const displayPrograms = programs && programs.length > 0 ? programs : initialPrograms;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Sosial':
        return <Heart className="w-4 h-4 text-amber-400" />;
      case 'Bantuan Bencana':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'Advokasi Hukum':
        return <Scale className="w-4 h-4 text-amber-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section id="program" className="py-20 bg-stone-950 relative text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Aksi & Pengabdian Berkelanjutan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            PROGRAM KERJA & AKSI NYATA
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base">
            Inisiatif berkelanjutan Team Senyap Nusantara dalam melayani masyarakat di seluruh pelosok Indonesia. Klik kartu untuk melihat rincian laporan lapangan.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPrograms.map((program) => (
            <div
              key={program.id}
              onClick={() => setSelectedProgram(program)}
              className="group cursor-pointer rounded-2xl bg-stone-900 border border-amber-500/20 hover:border-amber-400/80 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative aspect-[4/3] bg-stone-950 overflow-hidden">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/90 border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 backdrop-blur-md">
                    {getCategoryIcon(program.category)}
                    <span>{program.category}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold font-serif text-amber-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {program.title}
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
                    {program.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 border-t border-amber-500/10 mt-2 flex items-center justify-between text-xs text-amber-300/80 font-semibold">
                <span className="flex items-center gap-1 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{program.impactNumber} {program.impactUnit}</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-400 font-bold text-xs">
                  Rincian <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Informative Assurance Card (Replaces confusing button) */}
        <div className="mt-12 p-4 rounded-xl bg-stone-900/60 border border-amber-500/20 max-w-2xl mx-auto text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <Scale className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Seluruh program kemanusiaan dan bantuan hukum LPKSM TSN dilaksanakan secara independen dan bebas biaya.</span>
        </div>
      </div>

      {/* Program Modal Details */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-stone-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProgram(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
                {getCategoryIcon(selectedProgram.category)}
                <span>{selectedProgram.category}</span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-amber-200">
                {selectedProgram.title}
              </h3>
            </div>

            <div className="rounded-xl overflow-hidden aspect-video bg-stone-950">
              <img
                src={selectedProgram.imageUrl}
                alt={selectedProgram.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-950/80 border border-amber-500/20 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Waktu: {selectedProgram.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Lokasi: {selectedProgram.location}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-amber-300 font-semibold">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Dampak Kegiatan: {selectedProgram.impactNumber} {selectedProgram.impactUnit}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-stone-300 leading-relaxed font-sans">
              <p>{selectedProgram.fullContent}</p>
            </div>

            <div className="pt-4 border-t border-stone-800 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedProgram(null);
                  onOpenLegalAid();
                }}
                className="px-5 py-2.5 text-xs font-bold text-amber-200 border border-amber-500/40 rounded-lg hover:bg-amber-500/20 cursor-pointer"
              >
                Konsultasi Kasus Serupa
              </button>
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-lg hover:brightness-105 cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
