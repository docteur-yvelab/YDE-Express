import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// L'URL de ton futur serveur Node.js (ex: http://localhost:4000)
const SOCKET_URL = "http://localhost:4000";

export const useDeliverySocket = (orderId) => {
    const [deliveryPos, setDeliveryPos] = useState(null);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on("connect", () => {
        console.log("Connecté au serveur de suivi");
        socket.emit("join-order", orderId);
        });

        // Écouter les mises à jour de position du livreur
        socket.on("location-update", (coords) => {
        // coords = [lat, lng]
        setDeliveryPos(coords);
        });

        return () => socket.disconnect();
    }, [orderId]);

    return deliveryPos;
};