// import { useEffect } from "react";
// import { useMap } from "react-leaflet";
// import L from "leaflet";

// const Routing = ({ start, end, onRouteInfo }) => {
//     const map = useMap();

//     useEffect(() => {
//         if (!map || !start || !end) return;

//         const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

//         fetch(url)
//         .then(res => res.json())
//         .then(data => {
//             if (data.routes && data.routes[0]) {
//             const route = data.routes[0];
//             const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
//             // Envoyer la distance et la durée au parent (App.jsx)
//             if (onRouteInfo) {
//                 onRouteInfo({
//                 distance: (route.distance / 1000).toFixed(2),
//                 duration: Math.round(route.duration / 60),
//                 coordinates: coordinates
//                 });
//             }

//             if (window.currentRoute) map.removeLayer(window.currentRoute);
//             window.currentRoute = L.polyline(coordinates, { color: '#3b82f6', weight: 5 }).addTo(map);
//             }
//         });
//     }, [map, start, end, onRouteInfo]);

//     return null;
// };

// export default Routing;

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const Routing = ({ start, end, onRouteInfo }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !start || !end) return;

        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

        fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            // Inversion [lng, lat] -> [lat, lng] pour Leaflet
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            if (onRouteInfo) {
                onRouteInfo({
                distance: (route.distance / 1000).toFixed(2),
                duration: Math.round(route.duration / 60),
                path: coordinates // On renvoie le chemin complet
                });
            }

            if (window.currentRoute) map.removeLayer(window.currentRoute);
            window.currentRoute = L.polyline(coordinates, { color: '#3b82f6', weight: 5, opacity: 0.7 }).addTo(map);
            }
        });
    }, [map, start, end]);

    return null;
};

export default Routing;