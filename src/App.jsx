import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const INITIAL_LOAD = 50
const LOAD_MORE_COUNT = 20

const CATEGORIES = [
  { key: 'all', label: '全部', terms: [] },
  { key: 'street', label: '街拍', terms: ['street style', 'urban'] },
  { key: 'beach', label: '海边', terms: ['beach', 'summer'] },
  { key: 'sport', label: '运动', terms: ['sport', 'fitness'] },
  { key: 'retro', label: '复古', terms: ['retro', 'vintage'] },
  { key: 'indoor', label: '室内', terms: ['indoor', 'home'] },
  { key: 'portrait', label: '写真', terms: ['portrait', 'editorial'] },
]

const TAGS = [
  { key: 'sexy', label: '性感', terms: ['chic', 'glamour'] },
  { key: 'elegant', label: '优雅', terms: ['elegant', 'minimal'] },
  { key: 'fresh', label: '清新', terms: ['fresh', 'light'] },
  { key: 'vivid', label: '活力', terms: ['energy', 'dynamic'] },
  { key: 'casual', label: '日常', terms: ['casual', 'daily'] },
  { key: 'art', label: '艺术', terms: ['artistic', 'moody'] },
]

function buildQuery(categoryKey, activeTagKeys) {
  const categoryTerms = CATEGORIES.find((item) => item.key === categoryKey)?.terms ?? []
  const tagTerms = TAGS.filter((item) => activeTagKeys.includes(item.key)).flatMap((item) => item.terms)

  const allTerms = ['legs', 'fashion', 'beauty', ...categoryTerms, ...tagTerms]
  return allTerms.map((term) => encodeURIComponent(term)).join(',')
}

function createBatch(count, startIndex, categoryKey, activeTagKeys, seed) {
  const query = buildQuery(categoryKey, activeTagKeys)

  return Array.from({ length: count }, (_, idx) => {
    const index = startIndex + idx
    const width = 420 + ((index + seed) % 4) * 40
    const height = 620 + ((index * 53 + seed) % 5) * 90
    const ratio = (height / width).toFixed(2)
    const src = `https://picsum.photos/${width}/${height}?random=${seed + index}`

    return {
      id: `${seed}-${index}`,
      src,
      ratio,
      category: CATEGORIES.find((item) => item.key === categoryKey)?.label ?? '全部',
      tags: TAGS.filter((item) => activeTagKeys.includes(item.key)).map((item) => item.label),
    }
  })
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTags, setActiveTags] = useState([])
  const [photos, setPhotos] = useState([])
  const [seed, setSeed] = useState(() => Date.now())
  const sentinelRef = useRef(null)
  const loadingRef = useRef(false)

  const selectedSummary = useMemo(() => {
    const categoryName = CATEGORIES.find((item) => item.key === activeCategory)?.label ?? '全部'
    const tagsText = activeTags.length
      ? TAGS.filter((item) => activeTags.includes(item.key))
          .map((item) => item.label)
          .join(' / ')
      : '无标签筛选'

    return `${categoryName} · ${tagsText}`
  }, [activeCategory, activeTags])

  const resetGallery = useCallback((nextCategory, nextTags) => {
    const nextSeed = Date.now()
    setSeed(nextSeed)
    setPhotos(createBatch(INITIAL_LOAD, 0, nextCategory, nextTags, nextSeed))
    loadingRef.current = false
  }, [])

  const loadMore = useCallback(() => {
    if (loadingRef.current) return
    loadingRef.current = true

    setPhotos((prev) => {
      const nextBatch = createBatch(LOAD_MORE_COUNT, prev.length, activeCategory, activeTags, seed)
      return [...prev, ...nextBatch]
    })

    window.setTimeout(() => {
      loadingRef.current = false
    }, 150)
  }, [activeCategory, activeTags, seed])

  useEffect(() => {
    resetGallery(activeCategory, activeTags)
  }, [activeCategory, activeTags, resetGallery])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '640px 0px 640px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  const toggleTag = (tagKey) => {
    setActiveTags((prev) =>
      prev.includes(tagKey) ? prev.filter((item) => item !== tagKey) : [...prev, tagKey],
    )
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="layout">
        <header className="hero">
          <p className="kicker">KAN KAN TUI GALLERY</p>
          <h1>看看腿</h1>
          <p className="description">暗色时尚瀑布流图库，持续发现街拍、海边、运动与复古灵感。</p>
          <p className="summary">当前筛选：{selectedSummary}</p>
        </header>

        <section className="panel">
          <div className="group">
            <h2>分类</h2>
            <div className="chip-wrap">
              {CATEGORIES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`chip ${activeCategory === item.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <h2>标签</h2>
            <div className="chip-wrap">
              {TAGS.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  className={`chip ${activeTags.includes(tag.key) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag.key)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="gallery-grid" aria-live="polite">
          {photos.map((photo, index) => (
            <article key={photo.id} className="photo-card">
              <img
                src={photo.src}
                alt={`美腿灵感图 ${index + 1}`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="overlay">
                <span>{photo.category}</span>
                <span>{photo.tags.join(' · ') || '精选'}</span>
                <span>比例 {photo.ratio}</span>
              </div>
            </article>
          ))}
        </section>

        <div ref={sentinelRef} className="load-hint">
          持续加载中，每次新增 {LOAD_MORE_COUNT} 张
        </div>
      </main>
    </div>
  )
}

export default App
