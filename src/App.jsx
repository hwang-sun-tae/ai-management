import React, { useState, useEffect } from 'react';
import { Search, Plus, Copy, Tag, Sparkles, Trash2, Edit2, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from './supabase';

export default function AIKnowledgeHub() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const defaultCategories = ['Prompt', 'SNS/News', 'Tech/Tips', 'Code'];
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('ai_hub_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'Prompt');
  const [newTags, setNewTags] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]); 
  
  // 💡 다중 이미지 확대 보기(갤러리/스와이프) 상태 관리
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], currentIndex: 0 });

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('knowledge_hub')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setItems(data);
      const dataCategories = [...new Set(data.map(item => item.category))];
      setCategories(prev => {
        const merged = [...new Set([...prev, ...dataCategories])];
        localStorage.setItem('ai_hub_categories', JSON.stringify(merged));
        return merged;
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 모달 켜졌을 때 키보드(좌/우/ESC) 조작 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const promises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(promises).then(results => {
        setImagePreviews(prev => [...prev, ...results]);
      });
    }
  };

  const removeImagePreview = (indexToRemove) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddCategory = () => {
    const newCat = window.prompt("새로운 구분(카테고리) 이름을 입력하세요:");
    if (newCat && newCat.trim() && !categories.includes(newCat.trim())) {
      const updated = [...categories, newCat.trim()];
      setCategories(updated);
      localStorage.setItem('ai_hub_categories', JSON.stringify(updated));
      setNewCategory(newCat.trim());
    } else if (newCat && categories.includes(newCat.trim())) {
      alert("이미 존재하는 카테고리입니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      title: newTitle,
      category: newCategory,
      tags: tagArray,
      content: newContent,
      image_url: imagePreviews.length > 0 ? JSON.stringify(imagePreviews) : null,
    };

    if (editingId) {
      const { error } = await supabase.from('knowledge_hub').update(payload).eq('id', editingId);
      if (!error) {
        alert('수정되었습니다.');
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('knowledge_hub').insert([payload]);
      if (error) console.error("Insert error:", error);
    }

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setImagePreviews([]); 
    fetchItems();
  };

  const handleDelete = async (id) => {
    if(window.confirm("정말 이 데이터를 삭제하시겠습니까?")) {
      const { error } = await supabase.from('knowledge_hub').delete().eq('id', id);
      if (!error) fetchItems();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewCategory(item.category);
    setNewContent(item.content);
    setNewTags(item.tags ? item.tags.join(', ') : '');
    
    if (item.image_url) {
      try {
        const parsed = JSON.parse(item.image_url);
        setImagePreviews(Array.isArray(parsed) ? parsed : [item.image_url]);
      } catch (e) {
        setImagePreviews([item.image_url]);
      }
    } else {
      setImagePreviews([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 💡 모달창 이미지 탐색 기능
  const closeLightbox = () => setLightbox({ isOpen: false, images: [], currentIndex: 0 });
  
  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));
  };

  // 💡 모바일 스와이프 기능 처리
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch = (item.title && item.title.toLowerCase().includes(searchLower)) || 
                          (item.content && item.content.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans relative">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-7 h-7" /> "나만의 AI"
          </h1>
          <p className="text-slate-400 text-sm mt-1">SNS 정보, 프롬프트, AI 노하우 통합 저장소</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="검색어 입력..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
            {editingId ? <Edit2 className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-indigo-400" />}
            {editingId ? '지식 / 프롬프트 수정' : '새 지식 / 프롬프트 등록'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">구분</label>
              <div className="flex gap-2">
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="button" onClick={handleAddCategory} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap">
                  + 추가
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">제목</label>
              <input type="text" required placeholder="제목을 입력하세요" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">태그 (쉼표로 구분)</label>
              <input type="text" placeholder="Python, ChatGPT" value={newTags} onChange={(e) => setNewTags(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">내용 / 프롬프트</label>
              <textarea 
                rows="10" 
                placeholder="내용 또는 AI 프롬프트를 입력하세요" 
                value={newContent} 
                onChange={(e) => setNewContent(e.target.value)} 
                className="w-full min-h-[200px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">모바일 캡처 / 여러 이미지 첨부</label>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" />
              
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative min-w-[100px] flex-shrink-0">
                      <img src={src} alt="Preview" className="h-24 w-full object-cover rounded-lg border border-slate-700" />
                      <button type="button" onClick={() => removeImagePreview(idx)} className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-red-500 rounded-full p-1 border border-slate-600 transition">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className={`flex-1 text-white font-medium py-2 rounded-lg text-sm transition ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                {editingId ? '수정 완료' : '저장하기'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setNewTitle(''); setNewContent(''); setNewTags(''); setImagePreviews([]); }} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 rounded-lg text-sm transition">
                  취소
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => {
              let displayImages = [];
              if (item.image_url) {
                try {
                  const parsed = JSON.parse(item.image_url);
                  displayImages = Array.isArray(parsed) ? parsed : [item.image_url];
                } catch (e) {
                  displayImages = [item.image_url];
                }
              }

              return (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                      {item.category}
                    </span>
                    
                    <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">
                      <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-amber-400 p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                  
                  {/* 목록의 이미지 클릭 시 라이트박스 열기 (전체 배열 전달) */}
                  {displayImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
                      {displayImages.map((img, idx) => (
                        <div key={idx} className="relative group/img cursor-pointer flex-shrink-0" onClick={() => setLightbox({ isOpen: true, images: displayImages, currentIndex: idx })}>
                          <img 
                            src={img} 
                            alt={`Captured ${idx}`} 
                            className="rounded-lg h-32 md:h-48 w-auto object-cover border border-slate-700 group-hover/img:opacity-70 transition" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition pointer-events-none">
                            <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-800 mb-3">
                    {item.content}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      {item.tags && item.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-slate-400">#{tag}</span>
                      ))}
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(item.content)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                      <Copy className="w-3.5 h-3.5" /> 복사
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center text-slate-500 py-10">등록된 데이터가 없습니다.</div>
            )}
          </div>
        </section>
      </main>

      {/* 💡 다중 이미지 지원 갤러리 모달 (스와이프, 좌우 화살표 포함) */}
      {lightbox.isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 select-none"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <button 
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition z-50 p-2 bg-slate-800/50 rounded-full"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* 사진이 여러 장일 때만 좌우 이동 버튼 표시 */}
            {lightbox.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 md:left-8 text-white/50 hover:text-white transition p-3 bg-slate-800/50 rounded-full z-50">
                  <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
                </button>
                <button onClick={nextImage} className="absolute right-2 md:right-8 text-white/50 hover:text-white transition p-3 bg-slate-800/50 rounded-full z-50">
                  <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
                </button>
              </>
            )}

            {/* 현재 인덱스 표시 (1/3 형식) */}
            {lightbox.images.length > 1 && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-1 rounded-full text-sm tracking-widest font-mono">
                {lightbox.currentIndex + 1} / {lightbox.images.length}
              </div>
            )}

            {/* 메인 뷰어 이미지 */}
            <img 
              src={lightbox.images[lightbox.currentIndex]} 
              alt={`Full size ${lightbox.currentIndex}`} 
              className="max-w-[95vw] max-h-[90vh] object-contain drop-shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
}