import { useState } from "react";

const C = {
  bg: "#0D0F14", card: "#13161E", cardHover: "#181C26",
  border: "#1F2535", borderHover: "#2A3347",
  accent: "#4F8EF7", accentDim: "#1A2D4F",
  green: "#22C55E", greenDim: "#0E3321",
  orange: "#F97316", orangeDim: "#3D1F0A",
  red: "#EF4444", redDim: "#3D1010",
  yellow: "#EAB308", yellowDim: "#332B00",
  text: "#E2E8F0", muted: "#64748B", dim: "#94A3B8",
};

const reports = [
  { id:1, category:"pothole", lat:-6.2088, lng:106.8456, upvotes:12, status:"pending", address:"Jl. Sudirman, Jakarta", time:"2 jam lalu", reporter:"7xKp...3mNq", icon:"🕳️" },
  { id:2, category:"crime",   lat:-6.1944, lng:106.8229, upvotes:8,  status:"confirmed", address:"Jl. Thamrin, Jakarta", time:"5 jam lalu", reporter:"9aRt...7pQw", icon:"🚨" },
  { id:3, category:"pothole", lat:-6.2297, lng:106.8232, upvotes:5,  status:"pending", address:"Jl. Gatot Subroto, Jakarta", time:"1 hari lalu", reporter:"3bXm...2kLn", icon:"🕳️" },
  { id:4, category:"crime",   lat:-6.1751, lng:106.8650, upvotes:15, status:"confirmed", address:"Jl. Mangga Besar, Jakarta", time:"3 jam lalu", reporter:"5cYp...8mOq", icon:"🚨" },
  { id:5, category:"pothole", lat:-6.2615, lng:106.7811, upvotes:3,  status:"pending", address:"Jl. Raya Kebayoran, Jakarta", time:"6 jam lalu", reporter:"2dZr...4nPt", icon:"🕳️" },
];

const sayembaras = [
  { id:1, title:"Pemetaan Jalan Rusak DKI Jakarta 2026", province:"DKI Jakarta", category:"pothole", deposit:2.5, deadline:"30 Apr 2026", confirmed:24, pending:127 },
  { id:2, title:"Hotspot Kejahatan Surabaya Q2 2026",   province:"Jawa Timur",  category:"crime",   deposit:1.8, deadline:"15 Mei 2026", confirmed:11, pending:58 },
];

const board = [
  { rank:1, wallet:"7xKp...3mNq", reports:47, confirmed:38, sol:"0.142", badge:"City Hero" },
  { rank:2, wallet:"9aRt...7pQw", reports:32, confirmed:28, sol:"0.098", badge:"Guardian" },
  { rank:3, wallet:"3bXm...2kLn", reports:28, confirmed:21, sol:"0.079", badge:"Guardian" },
  { rank:4, wallet:"5cYp...8mOq", reports:19, confirmed:14, sol:"0.051", badge:"Watcher" },
  { rank:5, wallet:"2dZr...4nPt", reports:14, confirmed:9,  sol:"0.033", badge:"Watcher" },
];

const gmapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

const Badge = ({ text, color }) => {
  const bg = { green:C.greenDim, orange:C.orangeDim, red:C.redDim, blue:C.accentDim, yellow:C.yellowDim }[color];
  const fg = { green:C.green, orange:C.orange, red:C.red, blue:C.accent, yellow:C.yellow }[color];
  return <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:bg, color:fg, fontWeight:500, whiteSpace:"nowrap" }}>{text}</span>;
};

const Nav = ({ label, icon, active, onClick }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:8, border:"none", background:active?C.accentDim:"transparent", color:active?C.accent:C.muted, cursor:"pointer", fontSize:13, fontWeight:active?500:400, width:"100%" }}>
    <span style={{ fontSize:15 }}>{icon}</span>{label}
  </button>
);

const Stat = ({ label, value, sub }) => (
  <div style={{ background:"#0D0F14", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"12px 14px", flex:1 }}>
    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:20, fontWeight:500, color:C.text }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{sub}</div>}
  </div>
);

const MapsLink = ({ lat, lng }) => (
  <a
    href={gmapsUrl(lat, lng)}
    target="_blank"
    rel="noreferrer"
    onClick={e => e.stopPropagation()}
    style={{ fontSize:11, color:C.accent, textDecoration:"none", padding:"3px 8px", borderRadius:5, border:`0.5px solid ${C.accentDim}`, background:C.accentDim, whiteSpace:"nowrap" }}
  >
    📍 Google Maps
  </a>
);

function MapView({ onReport }) {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("all");
  const filtered = reports.filter(r => filter === "all" || r.category === filter);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:500, color:C.text }}>Peta Laporan</div>
          <div style={{ fontSize:12, color:C.muted }}>Radius 5KM · Jakarta Pusat</div>
        </div>
        <button onClick={onReport} style={{ background:C.accent, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:500, cursor:"pointer" }}>+ Laporkan</button>
      </div>

      <div style={{ display:"flex", gap:6 }}>
        {[["all","Semua"],["pothole","Jalan Rusak"],["crime","Kejahatan"]].map(([f,l]) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 12px", borderRadius:99, border:`0.5px solid ${filter===f?C.accent:C.border}`, background:filter===f?C.accentDim:"transparent", color:filter===f?C.accent:C.muted, fontSize:12, cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {/* Mock map */}
      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:16, position:"relative", height:220, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 39px,#1a2030 39px,#1a2030 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#1a2030 39px,#1a2030 40px)", borderRadius:12 }} />
        <div style={{ position:"absolute", top:10, left:10, fontSize:10, color:C.muted, background:C.card, padding:"2px 7px", borderRadius:5, border:`0.5px solid ${C.border}` }}>MapLibre + OpenFreeMap</div>
        {filtered.map(r => {
          const x = 40 + ((r.lng - 106.77) / 0.12) * 340;
          const y = 20 + ((r.lat - (-6.27)) / 0.1) * 170;
          return (
            <button key={r.id} onClick={() => setSel(sel?.id===r.id?null:r)} style={{ position:"absolute", left:x, top:y, width:26, height:26, borderRadius:"50%", border:`2px solid ${r.category==="pothole"?C.orange:C.red}`, background:sel?.id===r.id?(r.category==="pothole"?C.orange:C.red):(r.category==="pothole"?C.orangeDim:C.redDim), cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, transform:"translate(-50%,-50%)", color:C.text }}>!</button>
          );
        })}
        <div style={{ position:"absolute", bottom:10, right:10, display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.muted }}><div style={{ width:8, height:8, borderRadius:"50%", background:C.orange }} />Jalan Rusak</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.muted }}><div style={{ width:8, height:8, borderRadius:"50%", background:C.red }} />Kejahatan</div>
        </div>
      </div>

      {/* Popup detail */}
      {sel && (
        <div style={{ background:C.card, border:`0.5px solid ${C.borderHover}`, borderRadius:12, padding:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Badge text={sel.category==="pothole"?"Jalan Rusak":"Kejahatan"} color={sel.category==="pothole"?"orange":"red"} />
              <Badge text={sel.status==="confirmed"?"Verified":"Pending"} color={sel.status==="confirmed"?"green":"yellow"} />
            </div>
            <button onClick={() => setSel(null)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
          </div>
          <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:2 }}>{sel.address}</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{sel.lat.toFixed(4)}, {sel.lng.toFixed(4)} · {sel.time}</div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:52, height:52, borderRadius:8, background:C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{sel.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>Reporter: <span style={{ fontFamily:"monospace", color:C.dim }}>{sel.reporter}</span></div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <button style={{ background:C.accentDim, border:`0.5px solid ${C.accent}`, color:C.accent, borderRadius:6, padding:"4px 12px", fontSize:12, cursor:"pointer" }}>▲ Upvote ({sel.upvotes})</button>
                <MapsLink lat={sel.lat} lng={sel.lng} />
                {sel.status==="confirmed" && <span style={{ fontSize:10, color:C.green, fontFamily:"monospace" }}>TX: 4xKp...9mRq</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report list */}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {filtered.map(r => (
          <div key={r.id} onClick={() => setSel(sel?.id===r.id?null:r)} style={{ background:sel?.id===r.id?C.cardHover:C.card, border:`0.5px solid ${sel?.id===r.id?C.borderHover:C.border}`, borderRadius:10, padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.15s" }}>
            <div style={{ fontSize:20 }}>{r.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.address}</div>
              <div style={{ fontSize:11, color:C.muted }}>{r.time} · {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
              <Badge text={r.status==="confirmed"?"Verified":"Pending"} color={r.status==="confirmed"?"green":"yellow"} />
              <span style={{ fontSize:11, color:C.muted }}>▲ {r.upvotes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportFlow({ onBack }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [validating, setValidating] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  const extractGPS = async (file) => {
    setGpsError(null); setGpsCoords(null);
    try {
      const buf = await file.arrayBuffer();
      const view = new DataView(buf);
      if (view.getUint16(0) !== 0xFFD8) { setGpsError("Bukan file JPEG yang valid."); return; }
      let off = 2;
      while (off < view.byteLength - 2) {
        const marker = view.getUint16(off);
        if (marker === 0xFFE1) {
          const hdr = String.fromCharCode(...new Uint8Array(view.buffer, off+4, 4));
          if (hdr === "Exif") { parseGPS(view, off+10); return; }
        }
        if ((marker & 0xFF00) !== 0xFF00) break;
        off += 2 + view.getUint16(off+2);
      }
      setGpsError("Foto tidak memiliki data GPS. Pastikan lokasi aktif saat memotret.");
    } catch { setGpsError("Gagal membaca metadata foto."); }
  };

  const parseGPS = (view, base) => {
    try {
      const le = view.getUint16(base) === 0x4949;
      const ifd = view.getUint32(base+4, le);
      const n = view.getUint16(base+ifd, le);
      for (let i = 0; i < n; i++) {
        const tag = view.getUint16(base+ifd+2+i*12, le);
        if (tag === 0x8825) {
          const goff = view.getUint32(base+ifd+2+i*12+8, le);
          readGPSIFD(view, base, goff, le); return;
        }
      }
      setGpsError("Foto tidak memiliki data GPS. Pastikan lokasi aktif saat memotret.");
    } catch { setGpsError("Gagal membaca EXIF."); }
  };

  const rat3 = (v, off, le) => [v.getUint32(off,le)/v.getUint32(off+4,le), v.getUint32(off+8,le)/v.getUint32(off+12,le), v.getUint32(off+16,le)/v.getUint32(off+20,le)];

  const readGPSIFD = (view, base, goff, le) => {
    try {
      const n = view.getUint16(base+goff, le);
      let lat=null, lng=null, latR="N", lngR="E";
      for (let i = 0; i < n; i++) {
        const o = base+goff+2+i*12;
        const tag = view.getUint16(o, le);
        if (tag===1) latR = String.fromCharCode(view.getUint8(o+8));
        if (tag===3) lngR = String.fromCharCode(view.getUint8(o+8));
        if (tag===2) lat = rat3(view, base+view.getUint32(o+8,le), le);
        if (tag===4) lng = rat3(view, base+view.getUint32(o+8,le), le);
      }
      if (!lat||!lng) { setGpsError("Foto tidak memiliki data GPS. Pastikan lokasi aktif saat memotret."); return; }
      const latD = lat[0]+lat[1]/60+lat[2]/3600;
      const lngD = lng[0]+lng[1]/60+lng[2]/3600;
      setGpsCoords({ lat: latR==="S"?-latD:latD, lng: lngR==="W"?-lngD:lngD });
    } catch { setGpsError("Gagal membaca GPS dari EXIF."); }
  };

  const handleUpload = () => {
    if (!gpsCoords) return;
    setValidating(true);
    setTimeout(() => { setValidating(false); setStep(3); }, 2000);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:20 }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:500, color:C.text }}>Buat Laporan</div>
          <div style={{ fontSize:12, color:C.muted }}>Step {step} dari 4</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:4 }}>
        {[1,2,3,4].map(s => <div key={s} style={{ flex:1, height:3, borderRadius:99, background:s<=step?C.accent:C.border, transition:"background 0.3s" }} />)}
      </div>

      {step===1 && (
        <div>
          <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:12 }}>Pilih kategori laporan</div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {[{id:"pothole",label:"Jalan Rusak",icon:"⚠️",desc:"Lubang, retak, permukaan rusak"},{id:"crime",label:"Kejahatan",icon:"🚨",desc:"Hotspot kriminalitas, area berbahaya"}].map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{ flex:1, padding:14, borderRadius:10, border:`1.5px solid ${category===c.id?C.accent:C.border}`, background:category===c.id?C.accentDim:C.card, cursor:"pointer", textAlign:"left" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{c.icon}</div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:3 }}>{c.label}</div>
                <div style={{ fontSize:11, color:C.muted }}>{c.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => category && setStep(2)} style={{ width:"100%", padding:"10px 0", borderRadius:8, background:category?C.accent:C.border, border:"none", color:category?"#fff":C.muted, fontSize:14, fontWeight:500, cursor:category?"pointer":"not-allowed" }}>Lanjut</button>
        </div>
      )}

      {step===2 && (
        <div>
          <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:12 }}>Upload foto</div>
          <div style={{ background:C.card, border:`1.5px dashed ${C.border}`, borderRadius:12, padding:28, textAlign:"center", marginBottom:10 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{category==="pothole"?"🕳️":"📸"}</div>
            <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:4 }}>Pilih foto dari perangkat</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>JPG, PNG · Wajib ada GPS di EXIF foto</div>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && extractGPS(e.target.files[0])} style={{ fontSize:12, color:C.muted, cursor:"pointer" }} />
          </div>
          {category==="pothole" && <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:11, color:C.muted, marginBottom:8 }}>AI YOLO akan memvalidasi bahwa foto mengandung jalan berlubang</div>}
          {gpsError && <div style={{ background:C.redDim, border:`0.5px solid ${C.red}`, borderRadius:8, padding:"10px 12px", fontSize:12, color:C.red, marginBottom:8 }}>{gpsError}</div>}
          {gpsCoords && !gpsError && (
            <div style={{ background:C.greenDim, border:`0.5px solid ${C.green}`, borderRadius:8, padding:"10px 12px", fontSize:12, color:C.green, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>GPS dari EXIF: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}</span>
              <a href={gmapsUrl(gpsCoords.lat, gpsCoords.lng)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize:11, color:C.accent, textDecoration:"none" }}>📍 Lihat</a>
            </div>
          )}
          {validating && (
            <div style={{ background:C.accentDim, border:`0.5px solid ${C.accent}`, borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${C.accent}`, borderTopColor:"transparent", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
              <span style={{ fontSize:12, color:C.accent }}>Memvalidasi foto dengan AI...</span>
            </div>
          )}
          <button onClick={handleUpload} disabled={!gpsCoords||!!gpsError} style={{ width:"100%", padding:"10px 0", borderRadius:8, background:gpsCoords&&!gpsError?C.accent:C.border, border:"none", color:gpsCoords&&!gpsError?"#fff":C.muted, fontSize:14, fontWeight:500, cursor:gpsCoords&&!gpsError?"pointer":"not-allowed" }}>Upload & Validasi</button>
        </div>
      )}

      {step===3 && (
        <div>
          <div style={{ background:C.greenDim, border:`0.5px solid ${C.green}`, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:500, color:C.green, marginBottom:2 }}>Foto divalidasi</div>
            <div style={{ fontSize:12, color:C.green, opacity:0.8 }}>{category==="pothole"?"YOLO mendeteksi pothole · confidence 94%":"Foto lolos filter AI — tidak blur, GPS valid"}</div>
          </div>
          <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:10 }}>Konfirmasi detail laporan</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
            {[["Kategori",category==="pothole"?"Jalan Rusak":"Kejahatan"],["GPS (dari EXIF)",`${gpsCoords?.lat.toFixed(4) ?? "-6.2088"}, ${gpsCoords?.lng.toFixed(4) ?? "106.8456"}`],["Waktu","20 Mar 2026, 14:32"],["Reporter","7xKp...3mNq"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:C.card, borderRadius:8, border:`0.5px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.muted }}>{k}</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:12, color:C.text, fontFamily:k==="GPS (dari EXIF)"||k==="Reporter"?"monospace":"inherit" }}>{v}</span>
                  {k==="GPS (dari EXIF)" && <a href={gmapsUrl(gpsCoords?.lat ?? -6.2088, gpsCoords?.lng ?? 106.8456)} target="_blank" rel="noreferrer" style={{ fontSize:11, color:C.accent, textDecoration:"none" }}>📍</a>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} style={{ width:"100%", padding:"10px 0", borderRadius:8, background:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:500, cursor:"pointer" }}>Submit ke Blockchain</button>
        </div>
      )}

      {step===4 && (
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <div style={{ fontSize:44, marginBottom:14 }}>🎉</div>
          <div style={{ fontSize:17, fontWeight:500, color:C.text, marginBottom:6 }}>Laporan berhasil disubmit!</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:18 }}>Dicatat di Solana Devnet. Warga sekitar bisa upvote untuk memprioritaskan validasi.</div>
          <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:14, textAlign:"left" }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Transaction Hash</div>
            <div style={{ fontSize:12, fontFamily:"monospace", color:C.accent }}>4xKpR7mNq...8tYsW2vL</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Solana Devnet · Dikonfirmasi</div>
          </div>
          <div style={{ background:C.greenDim, border:`0.5px solid ${C.green}`, borderRadius:10, padding:12, marginBottom:18, textAlign:"left" }}>
            <div style={{ fontSize:12, color:C.green }}>Kamu akan dapat reward SOL jika dikonfirmasi oleh author sayembara aktif di wilayahmu.</div>
          </div>
          <button onClick={onBack} style={{ padding:"10px 24px", borderRadius:8, background:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:500, cursor:"pointer" }}>Kembali ke Peta</button>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AuthorDashboard() {
  const [sel, setSel] = useState(sayembaras[0]);
  const [confirmed, setConfirmed] = useState([]);
  const sorted = reports.filter(r => !confirmed.includes(r.id)).sort((a,b) => b.upvotes - a.upvotes);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div>
        <div style={{ fontSize:16, fontWeight:500, color:C.text }}>Author Dashboard</div>
        <div style={{ fontSize:12, color:C.muted }}>Kelola sayembara & validasi laporan</div>
      </div>
      <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:2 }}>
        {sayembaras.map(s => (
          <button key={s.id} onClick={() => setSel(s)} style={{ flexShrink:0, padding:"7px 12px", borderRadius:8, border:`0.5px solid ${sel?.id===s.id?C.accent:C.border}`, background:sel?.id===s.id?C.accentDim:C.card, color:sel?.id===s.id?C.accent:C.muted, fontSize:11, cursor:"pointer" }}>{s.title.substring(0,28)}...</button>
        ))}
        <button style={{ flexShrink:0, padding:"7px 12px", borderRadius:8, border:`0.5px solid ${C.border}`, background:"transparent", color:C.accent, fontSize:11, cursor:"pointer" }}>+ Buat Sayembara</button>
      </div>

      {sel && <>
        <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14 }}>
          <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:8 }}>{sel.title}</div>
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            <Badge text={sel.province} color="blue" />
            <Badge text="Aktif" color="green" />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Stat label="Deposit" value={`${sel.deposit} SOL`} sub="Di escrow" />
            <Stat label="Confirmed" value={sel.confirmed + confirmed.length} sub="laporan" />
            <Stat label="Deadline" value="30 Apr" sub="2026" />
          </div>
        </div>

        <div style={{ fontSize:13, fontWeight:500, color:C.text }}>Antrian <span style={{ color:C.muted, fontWeight:400, fontSize:12 }}>— by upvote</span></div>

        {sorted.length === 0
          ? <div style={{ textAlign:"center", padding:28, color:C.muted, fontSize:13 }}>Semua laporan sudah divalidasi</div>
          : sorted.map(r => (
            <div key={r.id} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:42, height:42, borderRadius:8, background:C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{r.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.address}</div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{r.lat.toFixed(4)}, {r.lng.toFixed(4)} · {r.time}</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
                  <Badge text={`▲ ${r.upvotes}`} color="blue" />
                  <Badge text={r.category==="pothole"?"Jalan Rusak":"Kejahatan"} color={r.category==="pothole"?"orange":"red"} />
                  <MapsLink lat={r.lat} lng={r.lng} />
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <button onClick={() => setConfirmed(c => [...c, r.id])} style={{ padding:"4px 10px", borderRadius:6, background:C.greenDim, border:`0.5px solid ${C.green}`, color:C.green, fontSize:11, cursor:"pointer", fontWeight:500 }}>Konfirmasi</button>
                <button style={{ padding:"4px 10px", borderRadius:6, background:C.redDim, border:`0.5px solid ${C.red}`, color:C.red, fontSize:11, cursor:"pointer" }}>Tolak</button>
              </div>
            </div>
          ))
        }

        {confirmed.length > 0 && (
          <button style={{ width:"100%", padding:"10px 0", borderRadius:8, background:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:500, cursor:"pointer" }}>
            Distribute {sel.deposit} SOL ke {sel.confirmed + confirmed.length} Reporter
          </button>
        )}
      </>}
    </div>
  );
}

function Leaderboard() {
  const bc = b => b==="City Hero"?"yellow":b==="Guardian"?"blue":"green";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div>
        <div style={{ fontSize:16, fontWeight:500, color:C.text }}>Leaderboard</div>
        <div style={{ fontSize:12, color:C.muted }}>Top kontributor · Jakarta · Maret 2026</div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Stat label="Total Laporan" value="1,247" sub="Bulan ini" />
        <Stat label="Verified" value="834" sub="67%" />
        <Stat label="SOL Out" value="3.2" sub="distributed" />
      </div>
      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 48px 52px 58px", gap:8, padding:"9px 14px", borderBottom:`0.5px solid ${C.border}` }}>
          {["#","Wallet","Laporan","Verified","SOL"].map(h => <div key={h} style={{ fontSize:11, color:C.muted }}>{h}</div>)}
        </div>
        {board.map((u,i) => (
          <div key={u.rank} style={{ display:"grid", gridTemplateColumns:"28px 1fr 48px 52px 58px", gap:8, padding:"10px 14px", borderBottom:i<4?`0.5px solid ${C.border}`:"none", alignItems:"center", background:i===0?"#1a1505":"transparent" }}>
            <div style={{ fontSize:13, fontWeight:500, color:i===0?C.yellow:C.muted }}>{u.rank}</div>
            <div>
              <div style={{ fontSize:11, fontFamily:"monospace", color:C.text, marginBottom:3 }}>{u.wallet}</div>
              <Badge text={u.badge} color={bc(u.badge)} />
            </div>
            <div style={{ fontSize:12, color:C.dim }}>{u.reports}</div>
            <div style={{ fontSize:12, color:C.green }}>{u.confirmed}</div>
            <div style={{ fontSize:12, color:C.accent, fontFamily:"monospace" }}>{u.sol}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:14 }}>
        <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:10 }}>Profil Kamu</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:C.accentDim, border:`1.5px solid ${C.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>👤</div>
          <div>
            <div style={{ fontSize:12, fontFamily:"monospace", color:C.text, marginBottom:3 }}>7xKp...3mNq</div>
            <Badge text="City Hero" color="yellow" />
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Stat label="Laporan" value="47" />
          <Stat label="Verified" value="38" sub="80.8%" />
          <Stat label="SOL" value="0.142" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("map");
  const [reporting, setReporting] = useState(false);

  return (
    <div style={{ background:C.bg, minHeight:"600px", display:"flex", fontFamily:"system-ui,sans-serif", color:C.text, borderRadius:12, overflow:"hidden", border:`0.5px solid ${C.border}` }}>
      <div style={{ width:170, flexShrink:0, borderRight:`0.5px solid ${C.border}`, padding:"14px 8px", display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{ padding:"6px 14px", marginBottom:10 }}>
          <div style={{ fontSize:14, fontWeight:500, color:C.text }}>CrowdRadar</div>
          <div style={{ fontSize:10, color:C.muted }}>Indonesia · Devnet</div>
        </div>
        <Nav label="Peta" icon="🗺" active={tab==="map"&&!reporting} onClick={() => { setTab("map"); setReporting(false); }} />
        <Nav label="Laporkan" icon="+" active={reporting} onClick={() => { setReporting(true); setTab("map"); }} />
        <Nav label="Author" icon="🏛" active={tab==="author"} onClick={() => { setTab("author"); setReporting(false); }} />
        <Nav label="Leaderboard" icon="🏆" active={tab==="leaderboard"} onClick={() => { setTab("leaderboard"); setReporting(false); }} />
        <div style={{ flex:1 }} />
        <div style={{ padding:"10px 14px", borderTop:`0.5px solid ${C.border}` }}>
          <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>Wallet</div>
          <div style={{ fontSize:11, fontFamily:"monospace", color:C.accent }}>7xKp...3mNq</div>
          <div style={{ fontSize:11, color:C.green, marginTop:2 }}>0.142 SOL</div>
        </div>
      </div>
      <div style={{ flex:1, padding:18, overflowY:"auto" }}>
        {reporting
          ? <ReportFlow onBack={() => setReporting(false)} />
          : tab==="map" ? <MapView onReport={() => setReporting(true)} />
          : tab==="author" ? <AuthorDashboard />
          : <Leaderboard />
        }
      </div>
    </div>
  );
}