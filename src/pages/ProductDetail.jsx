import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Download, FileText, CheckCircle2, RotateCw } from 'lucide-react'
import { Crumbs } from '../components/PageHero'
import { applications, categories, faceMaterials, products } from '../data'

const tabs = ['Overview', 'Technical Specifications', 'Materials', 'Applications', 'Downloads']

function Detail({ slug }) {
  const p = products.find((x) => x.slug === slug)
  const [img, setImg] = useState(0)
  const [tab, setTab] = useState('Overview')
  const [spin, setSpin] = useState(0)

  if (!p) {
    return (
      <section className="section container page">
        <div className="empty">Product not found. <Link to="/products" className="link">Back to products</Link></div>
      </section>
    )
  }

  const cat = categories.find((c) => c.id === p.category)
  const gallery = [p.image, ...p.types.map((t) => t.image), ...(p.gallery || []).map((g) => g.image)]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4)
  const sheets = p.types.flatMap((t) => t.datasheets.map((d, i) => ({ url: d, name: t.name, n: t.datasheets.length > 1 ? i + 1 : null })))
  const apps = applications.filter((a) => a.products.includes(p.slug))
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4)
  const points = [...p.highlights, ...(p.note ? [p.note] : [])].slice(0, 4)
  const current = gallery[img] || p.image

  return (
    <>
      <section className="pdh">
        <div className="container">
          <Crumbs items={[{ label: 'Products', to: '/products' }, { label: cat?.label, to: `/products?type=${p.category}` }, { label: p.code }]} />
          <div className="pdh__grid">
            <div className="pdh__gallery">
              <div className="pdh__thumbs">
                {gallery.map((g, i) => (
                  <button key={g} className={i === img ? 'is-active' : ''} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}>
                    <img src={g} alt="" />
                  </button>
                ))}
              </div>
              <div className="pdh__main">
                {current ? (
                  <img key={current} src={current} alt={p.name} style={{ transform: `rotate(${spin}deg)` }} />
                ) : (
                  <span className="ph ph--lg">{p.code}</span>
                )}
                <button className="pdh__360" onClick={() => setSpin((s) => s + 360)} aria-label="Rotate 360°">
                  <RotateCw size={16} /><span>360°</span>
                </button>
              </div>
            </div>
            <div className="pdh__info">
              <h1>{p.code}</h1>
              <h2>{p.name}</h2>
              <p>{p.intro}</p>
              <ul>
                {points.map((h) => <li key={h}><CheckCircle2 size={16} /> {h}</li>)}
              </ul>
              <div className="pdh__cta">
                <Link to={`/contact?product=${encodeURIComponent(p.name)}`} className="btn btn--blue">Request a Quote <ArrowRight size={15} /></Link>
                <a href={sheets[0]?.url || p.link} target="_blank" rel="noreferrer" className="btn btn--line">Download Datasheet <Download size={15} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet sheet--detail">
        <div className="container">
          <div className="ptabs" role="tablist">
            {tabs.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          <div className="ptab" key={tab}>
            {tab === 'Overview' && (
              <div className="pov">
                <div className="pov__text">
                  <h3>Product Overview</h3>
                  <p>{p.intro}</p>
                  {p.note && <p>{p.note}</p>}
                  {p.image && <img src={p.image} alt={p.name} className="pov__img" />}
                </div>
                <div className="spec">
                  <h4>Key Specifications</h4>
                  <dl>
                    <dt>Seal Type</dt><dd>{p.name}</dd>
                    <dt>Category</dt><dd>{cat?.label}</dd>
                    <dt>Reference</dt><dd>{p.code}</dd>
                    <dt>Variants</dt><dd>{p.types.length ? `${p.types.length} types` : 'On request'}</dd>
                    <dt>Key data</dt><dd>{p.highlights.join(' · ')}</dd>
                    <dt>Data sheets</dt><dd>{sheets.length || 'On request'}</dd>
                  </dl>
                </div>
              </div>
            )}

            {tab === 'Technical Specifications' && (
              p.types.length ? (
                <table className="ttable">
                  <thead><tr><th>Type</th><th>Description</th><th>Data sheet</th></tr></thead>
                  <tbody>
                    {p.types.map((t) => (
                      <tr key={t.name}>
                        <td>{t.image && <img src={t.image} alt="" />}</td>
                        <td>{t.name}</td>
                        <td>{t.datasheets.map((d, i) => <a key={d} href={d} target="_blank" rel="noreferrer"><FileText size={14} /> PDF{t.datasheets.length > 1 ? ` ${i + 1}` : ''}</a>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="ptab__empty">Technical data is prepared per application. <Link to="/contact" className="link">Request a quote <ArrowRight size={14} /></Link></p>
            )}

            {tab === 'Materials' && (
              <div className="mats">
                {faceMaterials.map((m) => (
                  <div key={m} className="mat"><span>{m.split(' ').map((w) => w[0]).join('')}</span><strong>{m}</strong><small>Seal face material</small></div>
                ))}
                <p>Face material combinations are selected for your medium, pressure and temperature. Manufacturing to drawing is available.</p>
              </div>
            )}

            {tab === 'Applications' && (
              apps.length ? (
                <div className="papps">
                  {apps.map((a) => (
                    <Link key={a.id} to={`/applications#${a.id}`} className="papp">
                      <img src={a.img} alt="" loading="lazy" />
                      <span><strong>{a.label}</strong><small>{a.text}</small></span>
                    </Link>
                  ))}
                </div>
              ) : <p className="ptab__empty">Used across specialised applications. <Link to="/contact" className="link">Ask our engineers <ArrowRight size={14} /></Link></p>
            )}

            {tab === 'Downloads' && (
              sheets.length ? (
                <div className="dls">
                  {sheets.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="dl">
                      <FileText size={20} />
                      <span><strong>{s.name}</strong><small>Data sheet{s.n ? ` ${s.n}` : ''} · PDF</small></span>
                      <Download size={16} />
                    </a>
                  ))}
                </div>
              ) : <p className="ptab__empty">Data sheets for this product are available on request. <Link to="/contact" className="link">Request <ArrowRight size={14} /></Link></p>
            )}
          </div>

          {related.length > 0 && (
            <div className="related">
              <h3>Related Products</h3>
              <div className="catalog__grid catalog__grid--4">
                {related.map((r) => (
                  <Link key={r.slug} to={`/products/${r.slug}`} className="pc pc--cat">
                    <div className="pc__media">{r.image ? <img src={r.image} alt={r.name} loading="lazy" /> : <span className="ph">{r.code}</span>}</div>
                    <div className="pc__body">
                      <div><h3>{r.name}</h3><p>{r.short}</p></div>
                      <span className="pc__go"><ArrowRight size={15} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  return <Detail key={slug} slug={slug} />
}
