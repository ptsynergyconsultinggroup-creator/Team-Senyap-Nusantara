import React, { useState } from 'react';
import { initialNews } from '../data/mockData';
import { NewsItem } from '../types';
import { Newspaper, Calendar, User, ArrowRight, X } from 'lucide-react';

interface NewsSectionProps {
  news?: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news = initialNews }) => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const displayNews = news && news.length > 0 ? news : initialNews;

  return (
    <section id="berita" className="py-20 bg-stone-950 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            BERITA & INFORMASI
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base">
            Kabar terbaru seputar kegiatan aksi kemanusiaan, perkembangan hukum, dan warta organisasi TSN.
          </p>
        </div>

        {/* News Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayNews.map((news) => (
            <div
              key={news.id}
              onClick={() => setSelectedNews(news)}
              className="group cursor-pointer rounded-2xl bg-stone-900 border border-amber-500/20 hover:border-amber-400 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-stone-950 overflow-hidden">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/90 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase">
                    {news.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {news.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {news.author}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-serif text-amber-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {news.title}
                  </h3>

                  <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                    {news.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Article Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-stone-100 shadow-2xl">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
                {selectedNews.category}
              </span>
              <h3 className="text-2xl font-bold font-serif text-amber-200">
                {selectedNews.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
                <span>{selectedNews.date}</span>
                <span>•</span>
                <span>Oleh: {selectedNews.author}</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden aspect-video bg-stone-950">
              <img
                src={selectedNews.imageUrl}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-4 text-sm text-stone-300 leading-relaxed font-sans">
              <p className="font-semibold text-amber-100">{selectedNews.summary}</p>
              <p>{selectedNews.content}</p>
            </div>

            <div className="pt-4 border-t border-stone-800 text-right">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-500 rounded-lg hover:brightness-105"
              >
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
