'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase, Report } from '@/lib/supabase';

interface MapProps {
  reports?: Report[];
}

export const Map = ({ reports = [] }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng, setLng] = useState(106.8456); // Jakarta
  const [lat, setLat] = useState(-6.2088);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add reports source
      map.current.addSource('reports', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: reports.map(r => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
            properties: r,
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster layers
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'reports',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 20, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 20, 40],
        },
      });

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'reports',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      // Pothole layer
      map.current.addLayer({
        id: 'potholes',
        type: 'circle',
        source: 'reports',
        filter: ['all', ['!has', 'point_count'], ['==', ['get', 'category'], 'pothole']],
        paint: {
          'circle-color': '#F97316',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Crime layer
      map.current.addLayer({
        id: 'crimes',
        type: 'circle',
        source: 'reports',
        filter: ['all', ['!has', 'point_count'], ['==', ['get', 'category'], 'crime']],
        paint: {
          'circle-color': '#EF4444',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });
    });

    // Realtime updates
    const channel = supabase
      .channel('reports-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        if (!map.current) return;
        const source = map.current.getSource('reports') as maplibregl.GeoJSONSource;
        if (source) {
          // This is a simplified update. In a real app, you'd fetch latest or update current GeoJSON.
          supabase.from('reports').select('*').then(({ data }) => {
            if (data) {
              source.setData({
                type: 'FeatureCollection',
                features: data.map(r => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
                  properties: r,
                })),
              });
            }
          });
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};
