'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase, Report } from '@/lib/supabase';

interface MapProps {
  reports?: Report[];
  selectedReport?: Report | null;
}

export const Map = ({ reports = [], selectedReport = null }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const selectedRef = useRef<Report | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const reportsRef = useRef<Report[]>(reports);
 
  useEffect(() => {
    selectedRef.current = selectedReport;
  }, [selectedReport]);

  useEffect(() => {
    reportsRef.current = reports;
    if (!map.current) return;
    const source = map.current.getSource('reports') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: 'FeatureCollection',
      features: reports.map((r) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(r.lng), Number(r.lat)] },
        properties: r,
      })),
    });
  }, [reports]);

  useEffect(() => {
    let cancelled = false;
    // let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      if (map.current) return;
      if (!mapContainer.current) return;

      const defaultCenter: [number, number] = [106.8456, -6.2088];
      const defaultZoom = 16;

      let center = defaultCenter;
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          center = await new Promise<[number, number]>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 2500, maximumAge: 60_000 }
            );
          });
        } catch {
          center = defaultCenter;
        }
      }

      if (cancelled) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center,
        zoom: defaultZoom,
      });

      if (selectedRef.current) {
        const lng = Number(selectedRef.current.lng);
        const lat = Number(selectedRef.current.lat);
        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          map.current.flyTo({ center: [lng, lat], zoom: 16, essential: true });
        }
      }

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        if (!map.current) return;

        map.current.addSource('reports', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
          cluster: false,
          clusterMaxZoom: 10,
          clusterRadius: 50,
        });

        const source = map.current.getSource('reports') as maplibregl.GeoJSONSource | undefined;
        source?.setData({
          type: 'FeatureCollection',
          features: reportsRef.current.map((r) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [Number(r.lng), Number(r.lat)] },
            properties: r,
          })),
        });

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

        map.current.addLayer({
          id: 'potholes',
          type: 'circle',
          source: 'reports',
          filter: ['all', ['!has', 'point_count'], ['==', 'category', 'pothole']],
          paint: {
            'circle-color': '#F97316',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });

        map.current.addLayer({
          id: 'crimes',
          type: 'circle',
          source: 'reports',
          filter: ['all', ['!has', 'point_count'], ['==', 'category', 'crime']],
          paint: {
            'circle-color': '#EF4444',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });
      });

      // channel = supabase
      //   .channel('reports-realtime')
      //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, () => {
      //     supabase.from('reports').select('*').then(({ data }) => {
      //       if (!data) return;
      //       if (!map.current) return;
      //       const source = map.current.getSource('reports') as maplibregl.GeoJSONSource | undefined;
      //       if (!source) return;
      //       source.setData({
      //         type: 'FeatureCollection',
      //         features: data.map((r) => ({
      //           type: 'Feature',
      //           geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      //           properties: r,
      //         })),
      //       });
      //     });
      //   })
      //   .subscribe();
    };

    init();

    return () => {
      cancelled = true;
      // channel?.unsubscribe();
      markerRef.current?.remove();
      markerRef.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    markerRef.current?.remove();
    markerRef.current = null;
    if (!selectedReport) return;

    const lng = Number(selectedReport.lng);
    const lat = Number(selectedReport.lat);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return;

    map.current.flyTo({ center: [lng, lat], zoom: 15, essential: true });

    const el = document.createElement('div');
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '9999px';
    el.style.border = '3px solid #ffffff';
    el.style.boxShadow = '0 0 0 6px rgba(79,142,247,0.22)';
    el.style.background = selectedReport.category === 'crime' ? '#EF4444' : '#F97316';

    markerRef.current = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map.current);
  }, [selectedReport]);

  return (
    <div ref={mapContainer} className="w-full h-full min-h-[420px]" />
  );
};
