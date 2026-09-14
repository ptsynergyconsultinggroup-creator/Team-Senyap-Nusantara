import React, { useState } from 'react';
import { Camera, Layers, Check } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const galleryItems = [
    {
      id: 1,
      title: 'Penyaluran Bantuan Sembako Warga Pelosok',
      category: 'Sosial',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 2,
      title: 'Tim Reaksi Cepat TSN di Posko Bencana',
      category: 'Kemanusiaan',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      title: 'Konsultasi Hukum Pro-Bono Paralegal TSN',
      category: 'Bantuan Hukum',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
      title: 'Penyuluhan Literasi Hukum Komunitas Pemuda',
      category: 'Edukasi',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 5,
      title: 'Rapat Konsolidasi Pengurus Wilayah TSN',
      category: 'Kegiatan',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 6,
      title: 'Santunan Anak Yatim & Dapur Umum Ramadhan',
      category: 'Sosial',
      imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const categories = ['Semua', 'Sosial', 'Kemanusiaan', 'Bantuan Hukum', 'Edukasi', 'Kegiatan'];

  const filteredItems =
    activeCategory === 'Semua'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <section id="galeri" className="py-20 bg-stone-900 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            GALERI KEGIATAN
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base">
            Dokumentasi aksi nyata relawan dan pengurus Team Senyap Nusantara di lapangan.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-stone-950 border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : 'bg-stone-950 border-amber-500/20 text-stone-300 hover:border-amber-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-stone-950 border border-amber-500/20 shadow-lg aspect-[4/3]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold font-serif text-amber-100 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
