
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { Facebook, MessageCircle } from 'lucide-react';
import Routing from "./Routing";
import { useEffect, useState } from 'react';

const socket = io('http://localhost:4000');

// Icons
const iconVendeur = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/606/606363.png', iconSize: [30, 30] });
const iconClient = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [30, 30] });
const iconMoto = L.icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713437.png', 
    iconSize: [35, 35],
    className: 'smooth-move' 
    });

    const POSTE_CENTRALE = [3.8667, 11.5167];
    const BASTOS_DEFAULT = [3.8950, 11.5130];

    function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => { map.setView(center, 14); }, [center]);
    return null;
    }

    function MapClickHandler({ onLocationSelect, disabled }) {
    useMapEvents({ click: (e) => !disabled && onLocationSelect([e.latlng.lat, e.latlng.lng]) });
    return null;
    }

    export default function App() {
    const [courierPos, setCourierPos] = useState(POSTE_CENTRALE);
    const [destination, setDestination] = useState(BASTOS_DEFAULT);
    const [isDelivering, setIsDelivering] = useState(false);
    const [routeData, setRouteData] = useState({ distance: 0, duration: 0, path: [] });
    const [showArrivalModal, setShowArrivalModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Logic Mouvement & Socket
    useEffect(() => {
        socket.on('location-received', (data) => setCourierPos([data.lat, data.lng]));
        return () => socket.off('location-received');
    }, []);

    useEffect(() => {
        if (isDelivering && routeData.path.length > 0) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < routeData.path.length) {
            const pos = routeData.path[i];
            setCourierPos(pos);
            socket.emit('update-location', { lat: pos[0], lng: pos[1] });
            i++;
            } else {
            setIsDelivering(false);
            clearInterval(interval);
            setShowArrivalModal(true);
            }
        }, 400);
        return () => clearInterval(interval);
        }
    }, [isDelivering, routeData.path]);

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 font-sans">
        
        {/* 1. HEADER (Full Width) */}
        <header className="h-16 bg-blue-700 text-white flex items-center justify-between px-6 shadow-md z-[1001]">
            <div className="flex items-center gap-2">
            <h1 className="text-xl font-black italic tracking-tighter">YDE-EXPRESS</h1>
            </div>
            <div className="hidden md:flex gap-4 text-xs font-bold uppercase tracking-widest opacity-80">
            <span>Yaoundé</span>
            <span>•</span>
            <span>Live Tracking</span>
            </div>
        </header>

        {/* 2. ZONE PRINCIPALE (Sidebar + Map) */}
        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Sidebar */}
            <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col p-6 space-y-6 z-[1000]">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Rechercher</label>
                <input 
                type="text" 
                placeholder="Quartier à Yaoundé..." 
                className="w-full p-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Estimation</p>
                <div className="flex justify-between">
                <span className="text-lg font-black">{routeData.distance} km</span>
                <span className="text-lg font-black text-blue-600">{routeData.duration} min</span>
                </div>
            </div>

            <button 
                disabled={isDelivering}
                onClick={() => setIsDelivering(true)}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-tight shadow-lg transition-all ${isDelivering ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
            >
                {isDelivering ? "En cours..." : "Lancer la course"}
            </button>
            </aside>

            {/* Map */}
            <main className="flex-1 relative">
            <MapContainer center={POSTE_CENTRALE} zoom={14} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ChangeView center={destination} />
                <MapClickHandler onLocationSelect={setDestination} disabled={isDelivering} />
                <Marker position={POSTE_CENTRALE} icon={iconVendeur} />
                <Marker position={destination} icon={iconClient} />
                <Marker position={courierPos} icon={iconMoto} />
                <Routing start={POSTE_CENTRALE} end={destination} onRouteInfo={setRouteData} />
            </MapContainer>
            </main>
        </div>

        {/* 3. FOOTER (Full Width & Responsive) */}
    <footer className="w-full bg-white border-t border-slate-200 py-3 px-6 z-[1001]">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Stats rapides */}
        <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
            <span className={`text-green-500 text-lg ${isDelivering ? 'animate-pulse' : ''}`}>●</span>
            <span className="font-bold text-slate-700 tracking-tight">Livreur : {isDelivering ? 'En mouvement' : 'En attente'}</span>
        </div>
        <div className="h-4 w-px bg-slate-200"></div>
        <div className="font-medium text-slate-500">{routeData.distance} km total</div>
        </div>

        {/* Copyright */}
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        &copy; 2025 YDE-Express • Digital Delivery Yaoundé
        </div>

        {/* Social / Support avec Message Automatique */}
        <div className="flex gap-6">
        <a 
            href="https://facebook.com/ydeexpress" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all hover:scale-110 text-xs font-bold uppercase"
        >
            <Facebook size={18} />
            <span className="hidden sm:inline">Facebook</span>
        </a>
        
        {/* Lien WhatsApp avec texte encodé : "Bonjour YDE-Express, je souhaite suivre mon colis n°237" */}
        <a 
            href="https://wa.me/237694637342?text=Bonjour%20YDE-Express%2C%20je%20souhaite%20suivre%20mon%20colis%20n%C2%B0237" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-slate-400 hover:text-green-500 transition-all hover:scale-110 text-xs font-bold uppercase"
        >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">WhatsApp</span>
        </a>
        </div>
    </div>
    </footer>

        {/* Arrival Modal */}
        {showArrivalModal && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-black mb-2">Arrivée !</h2>
                <p className="text-slate-500 text-sm mb-6 font-medium">Le coursier est à destination.</p>
                <a href="tel:+237694637342" className="block w-full py-4 bg-green-500 text-white font-black rounded-2xl mb-3 shadow-lg shadow-green-100 uppercase flex items-center justify-center gap-2">
                📞 Appeler le livreur
                </a>
                <button onClick={() => setShowArrivalModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Fermer</button>
            </div>
            </div>
        )}
        </div>
    );
}