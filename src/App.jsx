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

const CATEGORY_PHOTO_IDS = {
  street: [
    '1483985988355-763728e1935b',
    '1494790108377-be9c29b29330',
    '1487412720507-e7ab37603c6f',
    '1469474968028-56623f02e42e',
    '1475180098004-ca77a66827be',
    '1492446845049-9c50cc313f00',
    '1494526585095-c41746248156',
    '1496497243327-9dccd845c35f',
    '1503341455253-b2e723bb3dbb',
    '1506084868230-bb9d95c24759',
    '1507003211169-0a1dd7228f2d',
    '1518837695005-2083093ee35b',
    '1521572267360-ee0c2909d518',
    '1542291026-7eec264c27ff',
  ],
  beach: [
    '1464863979621-258859e62245',
    '1496747611176-843222e1e57c',
    '1485230895905-ec40ba36b9bc',
    '1489515217757-5fd1be406fef',
    '1500530855697-b586d89ba3ee',
    '1504609813442-a8924e83f76e',
    '1506869640319-fe1a24fd76dc',
    '1509631179647-0177331693ae',
    '1519741497674-611481863552',
    '1526510747491-58f928ec870f',
    '1530841377377-3ff06c0ca713',
    '1545296664-39db0d7e2f8d',
    '1551524164-687a55dd1126',
    '1560243563-062bfc001d68',
  ],
  sport: [
    '1521572163474-6864f9cf17ab',
    '1529139574466-a303027c1d8b',
    '1508214751196-bcfd4ca60f91',
    '1509967419530-da38b4704bc6',
    '1517841905240-472988babdf9',
    '1520970014086-2208d157c9e2',
    '1521146764736-56c929d59c83',
    '1536766768598-e09213fdcf22',
    '1545239351-1141bd82e8a6',
    '1546512565-39d4dc75e556',
    '1547190028-7e0d4c53f9b5',
    '1552872673-9b7b99711ebb',
    '1557089521-72b242a8c3f8',
    '1563720223185-11003d516935',
  ],
  retro: [
    '1515886657613-9f3515b0c78f',
    '1469334031218-e382a71b716b',
    '1483982258113-b72862e6cff6',
    '1485965120184-e220f721d03e',
    '1512436991641-6745cdb1723f',
    '1479936343636-73cdc5aae0c3',
    '1472099645785-5658abf4ff4e',
    '1496449903678-68ddcb189a24',
    '1498551172509-8e1e22ad20d1',
    '1518622358385-8ea7d0794bf6',
    '1519340241574-2cec6aef0c01',
    '1521334884684-d80222895322',
    '1535591273668-578e31182c4f',
    '1543083477-4f785aeafaa9',
  ],
  indoor: [
    '1524504388940-b1c1722653e1',
    '1521119989659-a83eee488004',
    '1500917293891-ef795e70e1f6',
    '1519996529931-28324d5a630e',
    '1524253482453-3fed8d2fe12b',
    '1529626455594-4ff0802cfb7e',
    '1534528741775-53994a69daeb',
    '1535713875002-d1d0cf377fde',
    '1539109136881-3be0616acf4b',
    '1544005313-94ddf0286df2',
    '1548544144-421d54d306c9',
    '1550614000-4895a10e1bfd',
    '1551986782-d0169b3f8fa7',
    '1564420228450-dfa5bc8a3dfb',
  ],
  portrait: [
    '1503342217505-b0a15ec3261c',
    '1539533113208-f6df8cc8b543',
    '1544717302-de2939b7ef71',
    '1549060279-7e168fcee0c2',
    '1549294413-26f195200c16',
    '1551024601-bec78aea704b',
    '1551232864-3f0890e580d9',
    '1551854838-212c9a4d593d',
    '1552374196-c4e7ffc6e126',
    '1553440569-bcc63803a83d',
    '1554080353-a576cf803bda',
    '1555685812-4b943f1cb0eb',
    '1556228720-195a672e8a03',
    '1559563362-c667ba5f5480',
  ],
}

const TAG_PHOTO_IDS = {
  sexy: [
    '1494526585095-c41746248156',
    '1551024601-bec78aea704b',
    '1551232864-3f0890e580d9',
    '1551854838-212c9a4d593d',
    '1552374196-c4e7ffc6e126',
    '1559563362-c667ba5f5480',
  ],
  elegant: [
    '1483982258113-b72862e6cff6',
    '1518622358385-8ea7d0794bf6',
    '1519340241574-2cec6aef0c01',
    '1535591273668-578e31182c4f',
    '1539533113208-f6df8cc8b543',
    '1549060279-7e168fcee0c2',
  ],
  fresh: [
    '1489515217757-5fd1be406fef',
    '1500530855697-b586d89ba3ee',
    '1506869640319-fe1a24fd76dc',
    '1519741497674-611481863552',
    '1545296664-39db0d7e2f8d',
    '1560243563-062bfc001d68',
  ],
  vivid: [
    '1521572163474-6864f9cf17ab',
    '1529139574466-a303027c1d8b',
    '1508214751196-bcfd4ca60f91',
    '1517841905240-472988babdf9',
    '1545239351-1141bd82e8a6',
    '1557089521-72b242a8c3f8',
  ],
  casual: [
    '1494790108377-be9c29b29330',
    '1469474968028-56623f02e42e',
    '1475180098004-ca77a66827be',
    '1492446845049-9c50cc313f00',
    '1503341455253-b2e723bb3dbb',
    '1521572267360-ee0c2909d518',
  ],
  art: [
    '1515886657613-9f3515b0c78f',
    '1521119989659-a83eee488004',
    '1529626455594-4ff0802cfb7e',
    '1535713875002-d1d0cf377fde',
    '1539109136881-3be0616acf4b',
    '1548544144-421d54d306c9',
  ],
}

const ALL_PHOTO_IDS = [...new Set(Object.values(CATEGORY_PHOTO_IDS).flat())]

function getPhotoPool(categoryKey, activeTagKeys) {
  const categoryPool =
    categoryKey === 'all' ? ALL_PHOTO_IDS : CATEGORY_PHOTO_IDS[categoryKey] ?? ALL_PHOTO_IDS

  if (!activeTagKeys.length) return categoryPool

  const tagPool = activeTagKeys.flatMap((tagKey) => TAG_PHOTO_IDS[tagKey] ?? [])
  return [...new Set([...categoryPool, ...tagPool])]
}

function createBatch(count, startIndex, categoryKey, activeTagKeys, seed) {
  const photoPool = getPhotoPool(categoryKey, activeTagKeys)
  const safePool = photoPool.length ? photoPool : ALL_PHOTO_IDS

  return Array.from({ length: count }, (_, idx) => {
    const index = startIndex + idx
    const width = 420 + ((index + seed) % 4) * 40
    const height = 620 + ((index * 53 + seed) % 5) * 90
    const ratio = (height / width).toFixed(2)
    const photoId = safePool[(seed + index) % safePool.length]
    const src = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`

    return {
      id: `${seed}-${index}`,
      src,
      width,
      height,
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
