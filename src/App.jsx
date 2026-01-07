// import React, { useState, useEffect, useCallback } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
// import L from 'leaflet';
// import { io } from 'socket.io-client';
// import Routing from './components/Routing';

// // --- CONFIGURATION ---
// const socket = io('http://localhost:4000');

// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// let DefaultIcon = L.icon({
//     iconUrl: markerIcon,
//     shadowUrl: markerShadow,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// const POSTE_CENTRALE = [3.8667, 11.5167];
// const BASTOS_DEFAULT = [3.8950, 11.5130];

// function MapClickHandler({ onLocationSelect, disabled }) {
//   useMapEvents({
//     click: (e) => {
//       if (!disabled) onLocationSelect([e.latlng.lat, e.latlng.lng]);
//     },
//   });
//   return null;
// }

// export default function App() {
//   const [courierPos, setCourierPos] = useState(POSTE_CENTRALE);
//   const [destination, setDestination] = useState(BASTOS_DEFAULT);
//   const [isDelivering, setIsDelivering] = useState(false);
//   const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Pour mobile

//   // WebSockets
//   useEffect(() => {
//     socket.on('location-received', (data) => setCourierPos([data.lat, data.lng]));
//     return () => socket.off('location-received');
//   }, []);

//   const emitLocation = useCallback((lat, lng) => {
//     socket.emit('update-location', { lat, lng, orderId: 'YDE-237' });
//   }, []);

//   // Simulation
//   useEffect(() => {
//     if (isDelivering) {
//       const interval = setInterval(() => {
//         setCourierPos(prev => {
//           const distLat = Math.abs(prev[0] - destination[0]);
//           const distLng = Math.abs(prev[1] - destination[1]);
//           if (distLat < 0.0005 && distLng < 0.0005) {
//             setIsDelivering(false);
//             clearInterval(interval);
//             return destination;
//           }
//           const newLat = prev[0] + (destination[0] - prev[0]) * 0.1;
//           const newLng = prev[1] + (destination[1] - prev[1]) * 0.1;
//           emitLocation(newLat, newLng);
//           return [newLat, newLng];
//         });
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [isDelivering, destination, emitLocation]);

//   return (
//     <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans bg-gray-50">
      
//       {/* HEADER MOBILE (Visible uniquement sur petit écran) */}
//       <header className="md:hidden bg-blue-600 p-4 text-white flex justify-between items-center shadow-md z-[2000]">
//         <h1 className="font-black italic">YDE-EXPRESS 🛵</h1>
//         <button 
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           className="bg-blue-500 px-3 py-1 rounded-lg text-xs font-bold"
//         >
//           {isSidebarOpen ? "Fermer" : "Infos"}
//         </button>
//       </header>

//       {/* SIDEBAR RESPONSIVE */}
//       <aside className={`
//         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
//         fixed md:relative z-[1002] md:z-auto
//         w-full md:w-80 h-[calc(100%-60px)] md:h-full
//         bg-white shadow-2xl flex flex-col border-r border-gray-200
//         transition-transform duration-300 ease-in-out
//       `}>
//         {/* Logo (Desktop) */}
//         <div className="hidden md:block p-6 bg-blue-600 text-white">
//           <h1 className="text-xl font-black italic tracking-tighter">YDE-EXPRESS 🛵</h1>
//           <p className="text-blue-100 text-[10px] uppercase font-bold mt-1 tracking-widest">Yaoundé Delivery Engine</p>
//         </div>

//         <div className="p-5 flex-1 space-y-6 overflow-y-auto">
//           {/* Status Card */}
//           <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
//             <div>
//               <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Distance</p>
//               <p className="text-xl font-black text-blue-900">{routeInfo.distance} km</p>
//             </div>
//             <div className="text-right">
//               <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">ETA</p>
//               <p className="text-xl font-black text-blue-900">{routeInfo.duration} min</p>
//             </div>
//           </div>

//           {/* Itinéraire */}
//           <div className="space-y-4 px-2">
//             <div className="flex gap-4">
//               <div className="flex flex-col items-center py-1">
//                 <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                 <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
//               </div>
//               <div className="text-sm italic text-gray-500">Poste Centrale (Départ)</div>
//             </div>
//             <div className="flex gap-4">
//               <div className="text-lg">📍</div>
//               <div className="text-sm font-bold text-gray-700">Destination choisie</div>
//             </div>
//           </div>

//           {!isDelivering && (
//             <div className="p-3 bg-yellow-50 rounded-xl text-[11px] text-yellow-700 border border-yellow-100">
//               👉 Touchez la carte pour changer le lieu de livraison.
//             </div>
//           )}
//         </div>

//         {/* Bouton Fixe en bas */}
//         <div className="p-4 border-t border-gray-100 bg-white">
//           <button 
//             disabled={isDelivering}
//             onClick={() => {
//               setIsDelivering(true);
//               if (window.innerWidth < 768) setIsSidebarOpen(false); // Ferme la sidebar sur mobile au lancement
//             }}
//             className={`w-full py-4 rounded-2xl font-bold uppercase transition-all shadow-lg ${
//               isDelivering 
//               ? 'bg-gray-100 text-gray-400' 
//               : 'bg-blue-600 text-white shadow-blue-200'
//             }`}
//           >
//             {isDelivering ? "Livraison en cours..." : "Confirmer & Lancer"}
//           </button>
//         </div>
//       </aside>

//       {/* ZONE CARTE */}
//       <main className="flex-1 relative z-0">
//         <MapContainer center={POSTE_CENTRALE} zoom={14} className="h-full w-full">
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
//           <MapClickHandler 
//             onLocationSelect={(coords) => setDestination(coords)} 
//             disabled={isDelivering} 
//           />

//           <Marker position={POSTE_CENTRALE}><Popup>Vendeur</Popup></Marker>
//           <Marker position={destination}><Popup>Destination</Popup></Marker>
//           <Marker position={courierPos} />

//           <Routing 
//             start={POSTE_CENTRALE} 
//             end={destination} 
//             onRouteInfo={(info) => setRouteInfo(info)}
//           />
//         </MapContainer>
//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import Routing from './components/Routing';

const socket = io('http://localhost:4000');

// Icônes personnalisées
const iconVendeur = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/606/606363.png', iconSize: [35, 35] });
const iconClient = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [35, 35] });
const iconMoto = L.icon({ 
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713437.png', 
  iconSize: [40, 40],
  className: 'smooth-move' // Applique la transition CSS
});

const POSTE_CENTRALE = [3.8667, 11.5167];
const BASTOS_DEFAULT = [3.8950, 11.5130];

function MapClickHandler({ onLocationSelect, disabled }) {
  useMapEvents({ click: (e) => !disabled && onLocationSelect([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function App() {
  const [courierPos, setCourierPos] = useState(POSTE_CENTRALE);
  const [destination, setDestination] = useState(BASTOS_DEFAULT);
  const [isDelivering, setIsDelivering] = useState(false);
  const [routeData, setRouteData] = useState({ distance: 0, duration: 0, path: [] });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Écoute temps réel
  useEffect(() => {
    socket.on('location-received', (data) => setCourierPos([data.lat, data.lng]));
    return () => socket.off('location-received');
  }, []);

  // Animation fluide : parcourt le tableau de coordonnées de la route
  useEffect(() => {
    if (isDelivering && routeData.path.length > 0) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < routeData.path.length) {
          const nextPos = routeData.path[currentIndex];
          setCourierPos(nextPos);
          socket.emit('update-location', { lat: nextPos[0], lng: nextPos[1], orderId: 'YDE-237' });
          currentIndex++;
        } else {
          setIsDelivering(false);
          clearInterval(interval);
        }
      }, 500); // Vitesse de déplacement (500ms par segment de route)
      return () => clearInterval(interval);
    }
  }, [isDelivering, routeData.path]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-gray-100">
      
      {/* Mobile Header */}
      <header className="md:hidden bg-blue-700 p-4 text-white flex justify-between z-[2000]">
        <span className="font-black">YDE-EXPRESS 🛵</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xs border px-2 py-1 rounded">
          {isSidebarOpen ? "Carte" : "Infos"}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-[1002] w-full md:w-80 h-full bg-white transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 bg-blue-700 text-white hidden md:block">
          <h1 className="text-xl font-black italic">YDE-EXPRESS</h1>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-gray-400">Distance</p>
              <p className="text-lg font-black">{routeData.distance} km</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-gray-400">Arrivée</p>
              <p className="text-lg font-black">{routeData.duration} min</p>
            </div>
          </div>

          <div className="space-y-4 border-l-2 border-dashed ml-2 pl-4">
            <div className="text-sm"><strong>Départ:</strong> Poste Centrale</div>
            <div className="text-sm font-bold text-blue-600 italic font-medium tracking-tight">Cliquer sur la carte pour changer l'arrivée</div>
          </div>

          <button 
            disabled={isDelivering}
            onClick={() => { setIsDelivering(true); setIsSidebarOpen(false); }}
            className={`w-full py-4 rounded-2xl font-bold uppercase transition-all ${isDelivering ? 'bg-gray-200 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            {isDelivering ? "Livraison en cours..." : "Lancer la course"}
          </button>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative">
        <MapContainer center={POSTE_CENTRALE} zoom={14} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onLocationSelect={setDestination} disabled={isDelivering} />
          <Marker position={POSTE_CENTRALE} icon={iconVendeur} />
          <Marker position={destination} icon={iconClient} />
          <Marker position={courierPos} icon={iconMoto}>
            <Popup>Livreur en direct 🛵</Popup>
          </Marker>
          <Routing start={POSTE_CENTRALE} end={destination} onRouteInfo={setRouteData} />
        </MapContainer>
      </main>
    </div>
  );
}
