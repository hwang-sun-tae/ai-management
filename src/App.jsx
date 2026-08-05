import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, Copy, Tag, Sparkles } from 'lucide-react';

export default function AIKnowledgeHub() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Python 자동매매 API 연결 템플릿 프롬프트',
      category: 'Prompt',
      tags: ['Python', 'Stock', 'API'],
      content: '다음 요구사항에 맞춰 Python으로 한국투자증권 Open API 수집 코드를 작성해줘...',
      imageUrl: null,
      createdAt: '2026-08-05'
    }
  ]);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Prompt');
  const [newTags, setNewTags] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // 모바일 캡처 이미지 첨부 핸들러
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      content: newContent,
      imageUrl: imagePreview,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setItems([newItem, ...items]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setImagePreview(null);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.content.toLowerCase().includes(search.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-7 h-7" /> AI Knowledge & Prompt Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">SNS 정보, 프롬프트, AI 노하우 통합 저장소</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="검색어 또는 태그..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 입력 폼 */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
            <Plus className="w-5 h-5 text-indigo-400" /> 새 지식 / 프롬프트 등록
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">구분</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="Prompt">유용한 프롬프트</option>
                <option value="SNS/News">SNS / 스크랩 정보</option>
                <option value="Tech/Tips">AI 기술 & 노하우</option>
                <option value="Code">코드 & 템플릿</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">제목</label>
              <input
                type="text"
                required
                placeholder="제목을 입력하세요"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">태그 (쉼표로 구분)</label>
              <input
                type="text"
                placeholder="R, Python, ChatGPT, Claude"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">내용 / 프롬프트</label>
              <textarea
                rows="5"
                placeholder="내용 또는 AI 프롬프트를 입력하세요"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            {/* 핸드폰 캡처 업로드 */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">모바일 캡처 / 이미지 첨부</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg max-h-40 object-cover border border-slate-700" />
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition"
            >
              저장하기
            </button>
          </form>
        </section>

        {/* 리스트 출력 영역 */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {['All', 'Prompt', 'SNS/News', 'Tech/Tips', 'Code'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-500">{item.createdAt}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="Captured Screenshot" className="mb-3 rounded-lg max-h-60 object-cover border border-slate-700" />
                )}

                <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-800 mb-3">
                  {item.content}
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-slate-400">#{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.content)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <Copy className="w-3.5 h-3.5" /> 프롬프트 복사
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}