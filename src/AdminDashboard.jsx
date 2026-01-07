import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { ShieldCheck, Target, History } from 'lucide-react';
import { FaMotorcycle } from 'react-icons/fa';

const socket = io('http://localhost:4000');

export default function AdminDashboard() {

    const [activeDeliveries, setActiveDeliveries] = useState({});
    const [focusedPos, setFocusedPos] = useState(null);

    useEffect(() => {
        socket.on('location-received', (data) => {
        const { orderId, lat, lng } = data;
        
        setActiveDeliveries(prev => {
            const currentHistory = prev[orderId]?.history || [];
            const lastPoint = currentHistory[currentHistory.length - 1];
            const newHistory = (lastPoint && lastPoint[0] === lat && lastPoint[1] === lng) 
            ? currentHistory 
            : [...currentHistory, [lat, lng]];

            return {
            ...prev,
            [orderId]: {
                lat,
                lng,
                time: new Date().toLocaleTimeString(),
                history: newHistory
            }
            };
        });
        });
        return () => socket.off('location-received');
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-[#0f172a] text-slate-100">

        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-80 bg-[#1e293b] p-4 overflow-y-auto">
            <h2 className="text-blue-400 text-xs font-black uppercase mb-4 flex items-center gap-2">
                <History size={16} /> Suivi des Trajets
            </h2>
            {Object.entries(activeDeliveries).map(([id, info]) => (
                <div key={id} className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700">
                <p className="text-xs font-bold text-white mb-2">Commande #{id}</p>
                <p className="text-[10px] text-slate-400 mb-3">{info.history.length} points enregistrés</p>
                <button 
                    onClick={() => setFocusedPos([info.lat, info.lng])}
                    className="w-full py-2 bg-blue-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"
                >
                    <Target size={12} /> Centrer
                </button>
                </div>
            ))}
            </aside>

            {/* MAP */}
            <main className="flex-1 relative">
            <MapContainer center={[3.8667, 11.5167]} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {Object.entries(activeDeliveries).map(([id, info]) => (
                <React.Fragment key={id}>

                    <Polyline 
                    positions={info.history} 
                    color="#3b82f6" 
                    weight={3} 
                    opacity={0.5} 
                    dashArray="5, 10" 
                    />
                    
                    <Marker position={[info.lat, info.lng]} icon={FaMotorcycle}>
                    <Popup>Livreur {id}</Popup>
                    </Marker>
                </React.Fragment>
                ))}
            </MapContainer>
            </main>
        </div>
        </div>
    );
}