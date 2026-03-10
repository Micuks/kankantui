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

const UNSPLASH_PHOTO_IDS = [
  '1483985988355-763728e1935b',
  '1464863979621-258859e62245',
  '1496747611176-843222e1e57c',
  '1524504388940-b1c1722653e1',
  '1494790108377-be9c29b29330',
  '1485230895905-ec40ba36b9bc',
  '1515886657613-9f3515b0c78f',
  '1521572163474-6864f9cf17ab',
  '1529139574466-a303027c1d8b',
  '1487412720507-e7ab37603c6f',
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
    const photoId = UNSPLASH_PHOTO_IDS[(seed + index) % UNSPLASH_PHOTO_IDS.length]
    const src = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`

    return {
      id: `${seed}-${index}`,
      src,
      width,
      height,
      ratio,
      category: CATEGORIES.find((item) => item.key === categoryKey)?.label ?? '全部',
      tags: TAGS.filter((item) => activeTagKeys.includes(item.key)).map((item) => item.label),
      query,
    }
  })
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTags, setActiveTags] = useState([])
  const [photos, setPhotos] = useState([])
  const [loadedState, setLoadedState] = useState({})
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
    setLoadedState({})
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

  const handleImageReady = useCallback((photoId) => {
    setLoadedState((prev) => {
      if (prev[photoId]) return prev
      return { ...prev, [photoId]: true }
    })
  }, [])

  return (
    <div className="app-shell">
      <main className="layout">
        <header className="top-bar">
          <h1>看看腿</h1>
          <p className="summary">当前筛选：{selectedSummary}</p>
        </header>

        <section className="filter-bar" aria-label="筛选栏">
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
            <article
              key={photo.id}
              className={`photo-card ${loadedState[photo.id] ? 'is-loaded' : 'is-loading'}`}
              style={{ '--img-ratio': `${photo.width} / ${photo.height}` }}
            >
              <div className="photo-frame">
                <div className="photo-skeleton" aria-hidden="true" />
                <img
                  src={photo.src}
                  alt={`美腿灵感图 ${index + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  width={photo.width}
                  height={photo.height}
                  onLoad={() => handleImageReady(photo.id)}
                  onError={() => handleImageReady(photo.id)}
                />
              </div>
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
