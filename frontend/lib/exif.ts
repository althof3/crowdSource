import exifr from 'exifr';

export type GPSCoords = {
  lat: number;
  lng: number;
};

export const extractGPS = async (file: File): Promise<GPSCoords | null> => {
  try {
    const gps = await exifr.gps(file);
    if (gps && gps.latitude && gps.longitude) {
      return {
        lat: gps.latitude,
        lng: gps.longitude,
      };
    }
    return null;
  } catch (err) {
    console.error('Error extracting EXIF GPS:', err);
    return null;
  }
};

export const getGoogleMapsUrl = (lat: number, lng: number) => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};
