'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Report } from '@/lib/supabase';

interface MapProps {
  reports?: Report[];
  selectedReport?: Report | null;
  onSelectReport?: (id: string | null) => void;
  onMove?: (viewState: { lat: number; lng: number; zoom: number }) => void;
}

export const Map = ({ reports = [], selectedReport = null, onSelectReport, onMove }: MapProps) => {
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

    const init = async () => {
      if (map.current) return;
      if (!mapContainer.current) return;

      const defaultCenter: [number, number] = [117.5423, -4.5878]; 
      const defaultZoom = 4.19;

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

      map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'bottom-right'
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

        // Add Click Handlers
        ['potholes', 'crimes'].forEach((layerId) => {
          if (!map.current) return;
          
          map.current.on('click', layerId, (e) => {
            if (e.features && e.features[0]) {
              const props = e.features[0].properties as Report;
              if (onSelectReport) onSelectReport(props.id);
            }
          });

          map.current.on('mouseenter', layerId, () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });

          map.current.on('mouseleave', layerId, () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
          });
        });

        map.current.on('move', () => {
          if (map.current && onMove) {
            const center = map.current.getCenter();
            onMove({
              lat: center.lat,
              lng: center.lng,
              zoom: map.current.getZoom(),
            });
          }
        });
      });

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
