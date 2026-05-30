import Link from 'next/link';
import { Cable, Camera, CheckCircle2, Cpu, Database, FileCode2, MapPinned, Network, ShieldCheck, Wifi } from 'lucide-react';

const features = [
  ['PoE budget', 'Headroom-aware switch sizing across PoE+ and PoE++ cameras.', Cable],
  ['Storage', 'Retention, recording mode, resolution, and surveillance HDD sizing.', Database],
  ['Topology', 'Core/access, backbone, LACP, and point-to-point wireless paths.', Network],
  ['Wired / wireless', 'Plan remote barns, gates, shops, and outbuildings honestly.', Wifi],
  ['Frigate config', 'Generate a starter config.yml with detectors and camera streams.', FileCode2],
  ['Bill of materials', 'Grouped, costed equipment list ready for refinement.', Cpu],
] as const;

const steps = ['Map property', 'Place cameras', 'Get network', 'Export build'];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function HomePage() {
  return (
    <main>
      <nav className="container glass pill" style={{ position: 'sticky', top: 16, zIndex: 10, marginTop: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
          <img src={`${basePath}/assets/logo-mark.svg`} alt="PrimeOdin" width={34} height={34} />
          <span>PrimeOdin</span><span className="muted hide-mobile">NVR Planner</span>
        </Link>
        <div className="hide-mobile" style={{ display: 'flex', gap: 20, color: 'var(--muted)', fontWeight: 600 }}>
          <a href="#how">How it works</a><a href="#features">Features</a><a href="#faq">FAQ</a>
        </div>
        <Link href="/planner" className="btn primary">Open the planner →</Link>
      </nav>

      <section className="container hero-section" style={{ padding: '104px 0 72px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(360px,.82fr)', gap: 32, alignItems: 'center' }}>
        <div>
          <div className="btn ghost" style={{ marginBottom: 18 }}>Built for Frigate · open-source NVR</div>
          <h1 className="display" style={{ fontSize: 'clamp(54px, 9vw, 112px)', lineHeight: .86, margin: 0 }}>Your camera system,<br /><span className="gradient-text serif">planned in minutes.</span></h1>
          <p className="serif" style={{ fontSize: 30, color: 'var(--slate)', margin: '24px 0 10px' }}>A calm planning surface for serious DIY surveillance builds.</p>
          <p className="muted" style={{ maxWidth: 650, fontSize: 18, lineHeight: 1.7 }}>Place IP cameras, choose resolution and retention, then get PoE power, storage, topology, a costed BOM, and a starter Frigate config without spreadsheet drift.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}><Link className="btn primary" href="/planner">Start planning</Link><a className="btn" href="#features">See features</a></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 26, color: 'var(--slate)', fontWeight: 600 }}>
            {['No account required', 'Exportable phase-one plan', 'Frigate-first logic'].map((t) => <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={18} color="var(--success)" /> {t}</span>)}
          </div>
        </div>
        <div className="glass card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}><i className="stat" style={{ width: 12, height: 12, padding: 0, borderRadius: 20, background: '#ff5f57' }} /><i className="stat" style={{ width: 12, height: 12, padding: 0, borderRadius: 20, background: '#ffbd2e' }} /><i className="stat" style={{ width: 12, height: 12, padding: 0, borderRadius: 20, background: '#28c840' }} /><span className="pill mono" style={{ marginLeft: 'auto', padding: '5px 12px', background: 'var(--frost)', fontSize: 12 }}>primeodin.dev/planner</span></div>
          <svg viewBox="0 0 620 430" role="img" aria-label="Product preview schematic plan" style={{ width: '100%', borderRadius: 22, background: 'linear-gradient(140deg,#eef8ff,#fff7ed)' }}>
            <path d="M104 64 L508 44 L562 300 L176 374 Z" fill="rgba(255,255,255,.72)" stroke="rgba(14,20,36,.12)" strokeWidth="3" />
            <path d="M190 128 h170 v110 h-170z" fill="rgba(14,143,204,.11)" stroke="rgba(14,143,204,.32)" />
            {[['132','102','#0e8fcc'],['482','112','#6b4deb'],['518','282','#e5680a'],['214','326','#0e8fcc']].map(([x,y,c],i)=><g key={i}><path d={`M${x} ${y} l-62 108 a120 120 0 0 1 124 0z`} fill={c} opacity=".16"/><circle cx={x} cy={y} r="24" fill="white" stroke={c} strokeWidth="8"/></g>)}
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>{[['12','Cameras'],['184W','PoE budget'],['8TB','Storage']].map(([n,l])=><div className="stat" key={l}><strong style={{ fontSize: 24 }}>{n}</strong><br/><span className="muted">{l}</span></div>)}</div>
        </div>
      </section>

      <section id="how" className="container" style={{ padding: '60px 0' }}><p className="eyebrow">How it works</p><div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>{steps.map((s,i)=><div className="glass card" style={{ padding: 22 }} key={s}><span className="mono muted">0{i+1}</span><h3>{s}</h3><p className="muted">A focused step that keeps the plan editable and grounded in equipment constraints.</p></div>)}</div></section>
      <section id="features" className="container" style={{ padding: '60px 0' }}><p className="eyebrow">Features</p><h2 className="display" style={{ fontSize: 48, marginTop: 0 }}>Everything needed before buying hardware.</h2><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>{features.map(([title, body, Icon])=><div className="stat" key={title} style={{ padding: 24 }}><div className="pill" style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', background: 'var(--spectrum)', color: 'white' }}><Icon size={22}/></div><h3>{title}</h3><p className="muted">{body}</p></div>)}</div></section>
      <section className="container glass card" style={{ padding: 40, margin: '60px auto' }}><ShieldCheck color="var(--accent)"/><h2 className="display" style={{ fontSize: 44, margin: '12px 0' }}>Start planning your system</h2><p className="muted">The MVP is local-first: your plan lives in the browser until you export the bill of materials.</p><Link href="/planner" className="btn primary">Open the planner →</Link></section>
      <section id="faq" className="container" style={{ padding: '40px 0 90px' }}><p className="eyebrow">FAQ</p><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>{['Real maps? This version uses a schematic site plan. Google Maps, Mapbox, or blueprint upload can be added later with server-side key handling.', 'Price accuracy? Catalogue values are documented estimates and should be dated before affiliate or launch use.', 'Camera support? Standard, PTZ, and PoE++ classes cover most first-pass planning.', 'Data storage? This version keeps state client-side and exports BOM/config locally.'].map((f)=><div className="glass card" style={{ padding: 22 }} key={f}>{f}</div>)}</div></section>
      <footer className="container muted" style={{ borderTop: '1px solid var(--line)', padding: '26px 0 50px', display:'flex', justifyContent:'space-between' }}><span>PrimeOdin NVR Planner</span><span>Estimates only; validate codes, loads, and Frigate schema before install.</span></footer>
    </main>
  );
}
