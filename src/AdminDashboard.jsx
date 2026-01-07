// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
// import L from 'leaflet';
// import { io } from 'socket.io-client';
// import { ShieldCheck, Target, History } from 'lucide-react';
// import { FaMotorcycle } from 'react-icons/fa';

// const socket = io('http://localhost:4000');

// export default function AdminDashboard() {

//     const [activeDeliveries, setActiveDeliveries] = useState({});
//     const [focusedPos, setFocusedPos] = useState(null);

//     useEffect(() => {
//         socket.on('location-received', (data) => {
//         const { orderId, lat, lng } = data;
        
//         setActiveDeliveries(prev => {
//             const currentHistory = prev[orderId]?.history || [];
//             const lastPoint = currentHistory[currentHistory.length - 1];
//             const newHistory = (lastPoint && lastPoint[0] === lat && lastPoint[1] === lng) 
//             ? currentHistory 
//             : [...currentHistory, [lat, lng]];

//             return {
//             ...prev,
//             [orderId]: {
//                 lat,
//                 lng,
//                 time: new Date().toLocaleTimeString(),
//                 history: newHistory
//             }
//             };
//         });
//         });
//         return () => socket.off('location-received');
//     }, []);

//     return (
//         <div className="flex flex-col h-screen w-full bg-[#0f172a] text-slate-100">

//         <div className="flex flex-1 overflow-hidden">
//             {/* SIDEBAR */}
//             <aside className="w-80 bg-[#1e293b] p-4 overflow-y-auto">
//             <h2 className="text-blue-400 text-xs font-black uppercase mb-4 flex items-center gap-2">
//                 <History size={16} /> Suivi des Trajets
//             </h2>
//             {Object.entries(activeDeliveries).map(([id, info]) => (
//                 <div key={id} className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700">
//                 <p className="text-xs font-bold text-white mb-2">Commande #{id}</p>
//                 <p className="text-[10px] text-slate-400 mb-3">{info.history.length} points enregistrés</p>
//                 <button 
//                     onClick={() => setFocusedPos([info.lat, info.lng])}
//                     className="w-full py-2 bg-blue-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"
//                 >
//                     <Target size={12} /> Centrer
//                 </button>
//                 </div>
//             ))}
//             </aside>

//             {/* MAP */}
//             <main className="flex-1 relative">
//             <MapContainer center={[3.8667, 11.5167]} zoom={13} className="h-full w-full">
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
//                 {Object.entries(activeDeliveries).map(([id, info]) => (
//                 <React.Fragment key={id}>

//                     <Polyline 
//                     positions={info.history} 
//                     color="#3b82f6" 
//                     weight={3} 
//                     opacity={0.5} 
//                     dashArray="5, 10" 
//                     />
                    
//                     <Marker position={[info.lat, info.lng]} icon={FaMotorcycle}>
//                     <Popup>Livreur {id}</Popup>
//                     </Marker>
//                 </React.Fragment>
//                 ))}
//             </MapContainer>
//             </main>
//         </div>
//         </div>
//     );
// }


import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { 
  ShieldCheck, Target, Trash2, PlusCircle, User, 
  Bike, Facebook, MessageCircle, Activity, LayoutDashboard 
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:4000');

// Icône Moto pour l'Admin
const iconMotoAdmin = L.icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713437.png', 
    iconSize: [30, 30],
    className: 'smooth-move' 
});

// Composant pour recentrer la carte
function MapFocus({ targetPos }) {
  const map = useMap();
  useEffect(() => {
    if (targetPos) map.setView(targetPos, 16, { animate: true });
  }, [targetPos, map]);
  return null;
}

export default function AdminDashboard() {
  // --- ÉTATS ---
  const [fleet, setFleet] = useState(() => {
    const saved = localStorage.getItem('yde_fleet');
    return saved ? JSON.parse(saved) : [
        { id: "LIV-001", name: "Jean Express", status: "online" }
    ];
  });
  
  const [activeDeliveries, setActiveDeliveries] = useState({});
  const [newLivreurName, setNewLivreurName] = useState("");
  const [focusedPos, setFocusedPos] = useState(null);

  // Sauvegarde locale de la flotte
  useEffect(() => {
    localStorage.setItem('yde_fleet', JSON.stringify(fleet));
  }, [fleet]);

  // --- SOCKETS : RÉCEPTION DES POSITIONS ---
  useEffect(() => {
    socket.on('location-received', (data) => {
      const { orderId, lat, lng } = data;
      setActiveDeliveries(prev => {
        const history = prev[orderId]?.history || [];
        return {
          ...prev,
          [orderId]: {
            lat, lng,
            time: new Date().toLocaleTimeString(),
            history: [...history, [lat, lng]]
          }
        };
      });
    });
    return () => socket.off('location-received');
  }, []);

  // --- ACTIONS ---
  const addLivreur = (e) => {
    e.preventDefault();
    if (!newLivreurName) return;
    const newLivreur = {
      id: `LIV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newLivreurName,
      status: "offline"
    };
    setFleet([...fleet, newLivreur]);
    setNewLivreurName("");
  };

  const removeLivreur = (id) => {
    if(window.confirm("Supprimer ce livreur de la flotte ?")) {
        setFleet(fleet.filter(l => l.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* 1. HEADER ADMIN */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-[1001] shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase">YDE-EXPRESS</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">Admin Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                SERVEUR LIVE
            </div>
        </div>
      </header>

      {/* 2. ZONE PRINCIPALE */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR : GESTION FLOTTE */}
        <aside className="w-80 md:w-96 bg-slate-800 border-r border-slate-700 flex flex-col z-[1000]">
          
          {/* Formulaire d'ajout */}
          <div className="p-6 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <PlusCircle size={14} /> Ajouter un livreur
            </h2>
            <form onSubmit={addLivreur} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nom complet..."
                value={newLivreurName}
                onChange={(e) => setNewLivreurName(e.target.value)}
                className="flex-1 bg-slate-900 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button className="bg-blue-600 p-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                <PlusCircle size={20} />
              </button>
            </form>
          </div>

          {/* Liste des livreurs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">Ma Flotte ({fleet.length})</h2>
            {fleet.map((livreur) => (
              <div key={livreur.id} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black">{livreur.name}</p>
                      <p className="text-[9px] font-mono text-slate-500">{livreur.id}</p>
                    </div>
                  </div>
                  <button onClick={() => removeLivreur(livreur.id)} className="text-slate-600 hover:text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Status sur la carte */}
                {activeDeliveries[livreur.id] ? (
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                        <span className="text-[9px] font-bold text-green-500 uppercase">En course</span>
                    </div>
                    <button 
                        onClick={() => setFocusedPos([activeDeliveries[livreur.id].lat, activeDeliveries[livreur.id].lng])}
                        className="text-[9px] bg-blue-600 px-3 py-1 rounded-lg font-black uppercase flex items-center gap-1"
                    >
                        <Target size={10} /> Voir
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-[9px] text-slate-600 uppercase font-bold">Hors ligne / En attente</p>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* MAP */}
        <main className="flex-1 relative">
          <MapContainer center={[3.8667, 11.5167]} zoom={13} className="h-full w-full grayscale-[0.1] invert-[0.02]">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapFocus targetPos={focusedPos} />
            
            {Object.entries(activeDeliveries).map(([id, info]) => (
              <React.Fragment key={id}>
                {/* Historique du tracé */}
                <Polyline positions={info.history} color="#3b82f6" weight={3} opacity={0.6} dashArray="10, 10" />
                {/* Position actuelle */}
                <Marker position={[info.lat, info.lng]} icon={iconMotoAdmin}>
                  <Popup>
                    <div className="text-slate-800 p-1">
                        <p className="font-black text-xs uppercase border-b pb-1 mb-1">Livreur: {id}</p>
                        <p className="text-[10px] italic">Dernière MAJ: {info.time}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </main>
      </div>

      {/* 3. FOOTER (Même design que Client) */}
      <footer className="w-full bg-slate-800 border-t border-slate-700 py-3 px-6 z-[1001]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-tighter">
                <div className="flex items-center gap-2">
                    <span className="text-green-500 text-lg">●</span>
                    <span className="text-slate-300">Total Flotte: {fleet.length}</span>
                </div>
                <div className="h-4 w-px bg-slate-700"></div>
                <div className="text-blue-400">Actifs: {Object.keys(activeDeliveries).length}</div>
            </div>

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                &copy; 2025 YDE-Express • Administration Yaoundé
            </div>

            <div className="flex gap-6">
                <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-all hover:scale-110">
                    <Facebook size={16} />
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-all hover:scale-110">
                    <MessageCircle size={16} />
                </a>
            </div>
        </div>
      </footer>
    </div>
  );
}