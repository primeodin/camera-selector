'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, FileCode2, ImageUp, Moon, Plus, Printer, Sun, Trash2, Wifi, X } from 'lucide-react';
import { CAM, RES, clamp, deriveClusters, frigateConfig, money, plan } from '@/lib/planner';
import { cameraVisionProfile, revokeBlueprintPreview } from '@/lib/site-plan';
import type { BlueprintPreview } from '@/lib/site-plan';
import type { Camera, CameraType, LinkType, QualityTier, RecordMode, Resolution, Settings, Zone } from '@/lib/planner.types';

const initialZones: Zone[] = [
  { id: 'house', name: 'House', link: 'wired' },
  { id: 'barn', name: 'Barn', link: 'wireless' },
];
const initialCameras: Camera[] = [
  { id: 'cam-1', zoneId: 'house', type: 'standard', x: .22, y: .26, angle: 140 },
  { id: 'cam-2', zoneId: 'house', type: 'standard', x: .36, y: .58, angle: 40 },
  { id: 'cam-3', zoneId: 'house', type: 'ptz', x: .52, y: .42, angle: 260 },
  { id: 'cam-4', zoneId: 'barn', type: 'highpower', x: .78, y: .23, angle: 210 },
  { id: 'cam-5', zoneId: 'barn', type: 'standard', x: .82, y: .7, angle: 310 },
];
const zoneColors = ['#0e8fcc', '#6b4deb', '#e5680a', '#0f9d6b', '#d6353f'];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }
function aimAt(x: number, y: number) { return Math.round((Math.atan2(0.5 - x, -(0.5 - y)) * 180) / Math.PI); }
function fovPath(x: number, y: number, range: number, angle: number) {
  const spread = Math.min(230, Math.tan((angle / 2) * Math.PI / 180) * range);
  return `M${x} ${y} L${x - spread} ${y + range} Q${x} ${y + range * 1.14} ${x + spread} ${y + range} Z`;
}

export default function PlannerPage() {
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [zones, setZones] = useState(initialZones);
  const [cameras, setCameras] = useState(initialCameras);
  const [activeZone, setActiveZone] = useState('house');
  const [armedType, setArmedType] = useState<CameraType>('standard');
  const [view, setView] = useState<'site'|'results'>('site');
  const [blueprint, setBlueprint] = useState<BlueprintPreview | null>(null);
  const blueprintRef = useRef<BlueprintPreview | null>(null);
  const [settings, setSettings] = useState<Settings>({ resolution: '4mp', recordMode: 'event', retention: 14, tier: 'better' });
  const clusters = useMemo(() => deriveClusters(zones, cameras), [zones, cameras]);
  const result = useMemo(() => plan({ ...settings, clusters }), [settings, clusters]);
  const yaml = useMemo(() => frigateConfig({ ...settings, clusters }, result), [settings, clusters, result]);

  useEffect(() => { blueprintRef.current = blueprint; }, [blueprint]);
  useEffect(() => () => revokeBlueprintPreview(blueprintRef.current), []);

  const loadBlueprint = (file: File) => {
    const next = { name: file.name, url: URL.createObjectURL(file) };
    setBlueprint((current) => {
      revokeBlueprintPreview(current);
      return next;
    });
  };
  const clearBlueprint = () => setBlueprint((current) => {
    revokeBlueprintPreview(current);
    return null;
  });

  const addCamera = (zoneId = activeZone, type = armedType, x?: number, y?: number) => setCameras((cs) => [...cs, { id: uid('cam'), zoneId, type, x: x ?? .45 + Math.random() * .1, y: y ?? .45 + Math.random() * .1, angle: aimAt(x ?? .5, y ?? .5) }]);
  const removeCameraOfType = (zoneId: string, type: CameraType) => setCameras((cs) => { const idx = [...cs].reverse().findIndex(c => c.zoneId === zoneId && c.type === type); if (idx < 0) return cs; const real = cs.length - 1 - idx; return cs.filter((_, i) => i !== real); });
  const updateCamera = (id: string, patch: Partial<Camera>) => setCameras((cs) => cs.map((c) => c.id === id ? { ...c, ...patch } : c));
  const removeCamera = (id: string) => setCameras((cs) => cs.filter((c) => c.id !== id));
  const addZone = () => { const id = uid('zone'); setZones((zs) => [...zs, { id, name: `Location ${zs.length + 1}`, link: 'wired' }]); setActiveZone(id); };
  const removeZone = (id: string) => { if (zones.length <= 1) return; const next = zones.find((z) => z.id !== id)!; setZones((zs) => zs.filter((z) => z.id !== id)); setCameras((cs) => cs.filter((c) => c.zoneId !== id)); setActiveZone(next.id); };
  const updateZone = (id: string, patch: Partial<Zone>) => setZones((zs) => zs.map((z) => z.id === id ? { ...z, ...patch } : z));
  const countType = (zoneId: string, type: CameraType) => cameras.filter((c) => c.zoneId === zoneId && c.type === type).length;
  const exportBom = () => { const rows = ['group,name,sub,qty,unit,total', ...result.bomFlat.map((b) => [b.group, b.name, b.sub, b.qty, b.unit, b.qty * b.unit].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))]; const blob = new Blob([rows.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'primeodin-nvr-bom.csv'; a.click(); URL.revokeObjectURL(url); };

  return <main data-theme={theme} style={{ minHeight: '100vh', padding: 16 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }} className="planner-grid">
      <aside className="glass card planner-sidebar" style={{ padding: 18, position: 'sticky', top: 16, height: 'calc(100vh - 32px)', overflow: 'auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900 }}><img src={`${basePath}/assets/logo-mark.svg`} alt="" width={36}/><span>PrimeOdin</span></Link>
        <p className="eyebrow" style={{ marginTop: 24 }}>Locations & cameras</p>
        <div className="grid">
          {zones.map((zone, i) => <div key={zone.id} className="stat" style={{ borderColor: activeZone === zone.id ? zoneColors[i % zoneColors.length] : 'var(--line)' }} onClick={() => setActiveZone(zone.id)}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input value={zone.name} onChange={(e) => updateZone(zone.id, { name: e.target.value })} style={{ minWidth: 0, flex: 1, border: 0, background: 'transparent', fontWeight: 800 }} /><button className="btn" aria-label="Remove zone" onClick={(e) => { e.stopPropagation(); removeZone(zone.id); }} style={{ minHeight: 32, padding: '0 10px' }}><Trash2 size={14}/></button></div>
            <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>{(['wired','wireless'] as LinkType[]).map((l)=><button key={l} className={`btn ${zone.link===l?'primary':''}`} onClick={(e)=>{e.stopPropagation(); updateZone(zone.id,{link:l});}} style={{ minHeight: 32, padding: '0 10px', textTransform:'capitalize' }}>{l}</button>)}</div>
            {(['standard','ptz','highpower'] as CameraType[]).map((type)=><div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}><span>{CAM[type].label}</span><span><button className="btn" onClick={(e)=>{e.stopPropagation(); removeCameraOfType(zone.id,type);}} style={{ minHeight: 28, padding:'0 9px' }}>−</button> <b>{countType(zone.id,type)}</b> <button className="btn" onClick={(e)=>{e.stopPropagation(); addCamera(zone.id,type);}} style={{ minHeight: 28, padding:'0 9px' }}>+</button></span></div>)}
          </div>)}
        </div>
        <button className="btn" style={{ width: '100%', marginTop: 12 }} onClick={addZone}><Plus size={16}/> Add location</button>
        <p className="eyebrow" style={{ marginTop: 24 }}>Global settings</p>
        <Setting label="Resolution">{(Object.keys(RES) as Resolution[]).map((r)=><button key={r} className={`btn ${settings.resolution===r?'primary':''}`} onClick={()=>setSettings({...settings,resolution:r})}>{r.toUpperCase()}</button>)}</Setting>
        <Setting label="Recording">{(['event','continuous'] as RecordMode[]).map((m)=><button key={m} className={`btn ${settings.recordMode===m?'primary':''}`} onClick={()=>setSettings({...settings,recordMode:m})}>{m}</button>)}</Setting>
        <label className="muted" style={{ display:'block', marginTop: 14 }}>Retention: <b>{settings.retention} days</b><input style={{ width:'100%' }} type="range" min={3} max={90} value={settings.retention} onChange={(e)=>setSettings({...settings,retention:Number(e.target.value)})}/></label>
        <Setting label="Quality tier">{(['good','better','best'] as QualityTier[]).map((t)=><button key={t} className={`btn ${settings.tier===t?'primary':''}`} onClick={()=>setSettings({...settings,tier:t})}>{t}</button>)}</Setting>
      </aside>

      <section className="planner-main">
        <header className="glass card planner-header" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent:'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div><p className="eyebrow" style={{ margin: 0 }}>Planner / live estimate</p><h1 className="display planner-title" style={{ margin: '6px 0', fontSize: 42 }}>{result.totalCams} cameras across {result.clusters} locations</h1><p className="muted" style={{ margin: 0 }}>{result.topology} topology · {money(result.total)} estimated build</p></div>
          <div className="planner-actions" style={{ display:'flex', gap: 8, flexWrap:'wrap' }}><button className="btn" onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?<Moon size={16}/>:<Sun size={16}/>} Theme</button><button className="btn" onClick={exportBom}><Download size={16}/> Export BOM</button><button className="btn" onClick={()=>window.print()}><Printer size={16}/> Export plan</button></div>
        </header>
        <div className="planner-tabs" style={{ display: 'flex', gap: 8, margin: '14px 0' }}><button className={`btn ${view==='site'?'primary':''}`} onClick={()=>setView('site')}>Site plan</button><button className={`btn ${view==='results'?'primary':''}`} onClick={()=>setView('results')}>Results</button></div>
        {view === 'site' ? <SitePlan zones={zones} cameras={cameras} activeZone={activeZone} armedType={armedType} blueprint={blueprint} setArmedType={setArmedType} addCamera={addCamera} updateCamera={updateCamera} removeCamera={removeCamera} setActiveZone={setActiveZone} loadBlueprint={loadBlueprint} clearBlueprint={clearBlueprint}/> : <Results result={result} yaml={yaml}/>} 
      </section>
    </div>
    <style jsx global>{`
      .planner-main { min-width: 0; }
      .site-plan-svg { display: block; touch-action: none; }
      .camera-actions button { min-height: 30px; margin-right: 4px; border: 1px solid var(--line); border-radius: 8px; background: var(--glass-strong); color: var(--ink); }
      @media (max-width: 980px) {
        .planner-grid { grid-template-columns: 1fr !important; }
        .planner-sidebar { position: relative !important; height: auto !important; max-height: none !important; }
        .results-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        main[data-theme] { padding: max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left)) !important; overflow-x: hidden; }
        .planner-grid { gap: 10px !important; }
        .planner-sidebar, .planner-header, .site-plan-card { border-radius: 18px !important; padding: 12px !important; }
        .planner-sidebar { padding-bottom: calc(28px + env(safe-area-inset-bottom)) !important; }
        .planner-sidebar button.btn { min-height: 44px !important; min-width: 44px !important; }
        .planner-sidebar .stat { padding: 14px !important; }
        .planner-header { align-items: stretch !important; }
        .planner-header > div { width: 100%; min-width: 0; }
        .planner-title { font-size: clamp(28px, 9vw, 36px) !important; line-height: .96; text-wrap: balance; }
        .planner-actions { display: grid !important; grid-template-columns: 1fr 1fr; width: 100%; }
        .planner-actions .btn:last-child { grid-column: 1 / -1; }
        .planner-tabs { display: grid !important; grid-template-columns: 1fr 1fr; }
        .planner-toolbar { display: grid !important; grid-template-columns: 1fr !important; }
        .address-input { width: 100% !important; min-width: 0 !important; }
        .chip-row { display: flex !important; flex-wrap: nowrap !important; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .chip-row::-webkit-scrollbar { display: none; }
        .chip-row > * { flex: 0 0 auto; }
        .btn { min-height: 46px; padding-inline: 14px; }
        .site-plan-svg { min-height: 360px; aspect-ratio: 10 / 7; }
        .camera-actions { display: none; }
        .camera-marker { cursor: grab; }
      }
      @media print { aside,button,.btn{display:none!important}.planner-grid{display:block!important}.glass{box-shadow:none!important} }
    `}</style>
  </main>;
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) { return <div style={{ marginTop: 14 }}><div className="muted" style={{ marginBottom: 8 }}>{label}</div><div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>{children}</div></div>; }

function SitePlan({ zones, cameras, activeZone, armedType, blueprint, setArmedType, addCamera, updateCamera, removeCamera, setActiveZone, loadBlueprint, clearBlueprint }: { zones: Zone[]; cameras: Camera[]; activeZone: string; armedType: CameraType; blueprint: BlueprintPreview | null; setArmedType: (t: CameraType)=>void; addCamera: (z?: string,t?: CameraType,x?:number,y?:number)=>void; updateCamera: (id:string,p:Partial<Camera>)=>void; removeCamera:(id:string)=>void; setActiveZone:(id:string)=>void; loadBlueprint:(file: File)=>void; clearBlueprint:()=>void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadBlueprint(file);
    event.target.value = '';
  };

  return <div className="glass card site-plan-card" style={{ padding: 16 }}>
    <div className="planner-toolbar" style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:12 }}>
      <input aria-label="Address" placeholder="Enter address or project name" className="btn address-input" style={{ justifyContent:'flex-start', minWidth: 280 }}/>
      <div className="chip-row" style={{ display:'flex', gap:8 }}>
        <input ref={fileInputRef} aria-label="Upload blueprint image" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }}/>
        <button className="btn" onClick={()=>fileInputRef.current?.click()}><ImageUp size={16}/> {blueprint ? 'Replace blueprint' : 'Upload blueprint'}</button>
        {blueprint && <button className="btn" onClick={clearBlueprint}><X size={16}/> Clear</button>}
        {(['standard','ptz','highpower'] as CameraType[]).map(t=><button key={t} className={`btn ${armedType===t?'primary':''}`} onClick={()=>setArmedType(t)}>{CAM[t].label}</button>)}
      </div>
    </div>
    {blueprint && <p className="muted" style={{ marginTop: -2, marginBottom: 12 }}>Using local blueprint: <b>{blueprint.name}</b>. It stays in this browser and is not uploaded.</p>}
    <div className="chip-row" style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>{zones.map((z,i)=><button key={z.id} className={`btn ${activeZone===z.id?'primary':''}`} onClick={()=>setActiveZone(z.id)}>{z.link==='wireless'&&<Wifi size={14}/>}<span style={{ color: zoneColors[i%zoneColors.length] }}>●</span> {z.name}</button>)}</div>
    <svg viewBox="0 0 1000 560" className="card site-plan-svg" onClick={(e)=>{ const r=(e.currentTarget as SVGSVGElement).getBoundingClientRect(); addCamera(activeZone, armedType, (e.clientX-r.left)/r.width, (e.clientY-r.top)/r.height); }} style={{ width:'100%', background:'linear-gradient(140deg,#eef8ff,#fff7ed)', border:'1px solid var(--line)' }}>
      {blueprint ? <image href={blueprint.url} x="0" y="0" width="1000" height="560" preserveAspectRatio="xMidYMid slice" opacity=".9"/> : <>
        <path d="M120 80 L830 58 L910 420 L260 510 Z" fill="rgba(255,255,255,.74)" stroke="rgba(14,20,36,.14)" strokeWidth="5" />
        <path d="M310 160 h260 v160 h-260z" fill="rgba(14,143,204,.1)" stroke="rgba(14,143,204,.3)" strokeWidth="3" />
        <text x="54" y="520" fill="#6b7591" fontSize="24">Schematic preview · upload a blueprint or satellite screenshot</text>
      </>}
      <rect x="0" y="0" width="1000" height="560" fill="url(#site-grid)" opacity={blueprint ? '.22' : '.34'} pointerEvents="none"/>
      <defs><pattern id="site-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(14,20,36,.13)" strokeWidth="1"/></pattern></defs>
      {cameras.map((c)=>{ const zoneIndex = Math.max(0,zones.findIndex(z=>z.id===c.zoneId)); const color = CAM[c.type].label === 'PTZ' ? '#6b4deb' : c.type === 'highpower' ? '#e5680a' : '#0e8fcc'; const profile = cameraVisionProfile(c.type); const x=c.x*1000, y=c.y*560; return <g className="camera-marker" key={c.id} onClick={(e)=>e.stopPropagation()} onPointerDown={(e)=>{ const svg=e.currentTarget.ownerSVGElement!; const move=(ev:PointerEvent)=>{ const r=svg.getBoundingClientRect(); updateCamera(c.id,{x:clamp((ev.clientX-r.left)/r.width,.02,.98), y:clamp((ev.clientY-r.top)/r.height,.02,.98)});}; const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);}; window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); }}>
        <path d={fovPath(x, y, profile.range, profile.angle)} transform={`rotate(${c.angle} ${x} ${y})`} fill={color} opacity=".18" stroke={color} strokeWidth="2" strokeDasharray={c.type==='ptz'?'8 8':'0'}/>
        <circle cx={x} cy={y} r={profile.range} fill="none" stroke={color} opacity=".12" strokeWidth="2"/>
        <circle cx={x} cy={y} r="30" fill="white" stroke={zoneColors[zoneIndex%zoneColors.length]} strokeWidth="7"/><circle cx={x} cy={y} r="16" fill={color}/><title>{`${profile.label} · drag to move`}</title><foreignObject className="camera-actions" x={x+34} y={y-44} width="172" height="88"><div className="stat" style={{padding:6, fontSize:11}}><button onClick={()=>updateCamera(c.id,{angle:c.angle-20})}>↺</button><button onClick={()=>updateCamera(c.id,{angle:c.angle+20})}>↻</button><button onClick={()=>removeCamera(c.id)}>Remove</button></div></foreignObject></g>})}
    </svg>
    <div className="fov-legend" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
      {(['standard','ptz','highpower'] as CameraType[]).map((type) => { const profile = cameraVisionProfile(type); const color = type === 'ptz' ? '#6b4deb' : type === 'highpower' ? '#e5680a' : '#0e8fcc'; return <span key={type} className="muted" style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span style={{ width:18, height:10, borderRadius:99, background:color, opacity:.22, border:`1px solid ${color}` }}/>{CAM[type].label}: {profile.label}</span>; })}
    </div>
  </div>;
}

function Results({ result, yaml }: { result: ReturnType<typeof plan>; yaml: string }) {
  return <div className="grid results-grid" style={{ gridTemplateColumns: '1.1fr .9fr' }}>
    <div className="glass card" style={{ padding: 18 }}><h2>Topology</h2><svg viewBox="0 0 720 360" style={{ width:'100%' }}><circle cx="90" cy="180" r="44" fill="var(--accent)"/><text x="90" y="186" textAnchor="middle" fill="white" fontWeight="800">NVR</text><circle cx="280" cy="180" r="38" fill="#1a2238"/><text x="280" y="186" textAnchor="middle" fill="white">Core</text><line x1="134" y1="180" x2="242" y2="180" stroke="var(--muted)" strokeWidth="4"/>{result.access.map((a,i)=>{ const y=80+i*88; return <g key={a.cluster.name}><line x1="318" y1="180" x2="520" y2={y} stroke={a.link==='wireless'?'#6b4deb':'var(--muted)'} strokeWidth="4" strokeDasharray={a.link==='wireless'?'10 10':'0'}/><rect x="520" y={y-28} width="150" height="56" rx="18" fill="var(--glass-strong)" stroke="var(--line)"/><text x="595" y={y-4} textAnchor="middle" fontWeight="800">{a.cluster.name}</text><text x="595" y={y+15} textAnchor="middle" fill="var(--muted)" fontSize="13">{a.link==='wireless'?'PtP wireless':'LACP wired'}</text></g>})}</svg></div>
    <div className="grid"><div className="stat"><b>{result.totalCams}</b><br/>Cameras</div><div className="stat"><b>{result.totalPower}W / {result.totalPoeBudget}W</b><br/>PoE budget · {result.headroomPct}% headroom</div><div className="stat"><b>{result.recTb}TB recommended</b><br/>{result.driveQty} × {result.driveSize}TB HDD</div><div className="stat"><b>{money(result.total)}</b><br/>Estimated total</div></div>
    <div className="glass card" style={{ padding: 18 }}><h2>Bill of materials</h2>{Object.entries(result.bom).map(([group, rows])=> rows.length ? <div key={group}><h3>{group}</h3>{rows.map((b)=><div key={b.name} style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--line)', padding:'9px 0' }}><span><b>{b.name}</b><br/><span className="muted">{b.sub}</span></span><span>{b.qty} × {money(b.unit)}</span></div>)}</div> : null)}</div>
    <div className="glass card" style={{ padding: 18 }}><h2><FileCode2 size={20}/> Frigate config</h2><pre className="mono" style={{ overflow:'auto', maxHeight: 430, background:'var(--frost)', padding: 14, borderRadius: 14 }}>{yaml}</pre></div>
  </div>;
}
