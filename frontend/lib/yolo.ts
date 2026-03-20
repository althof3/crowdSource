const YOLO_SERVICE_URL = process.env.NEXT_PUBLIC_YOLO_SERVICE_URL || 'http://localhost:8000';

export type ValidationResult = {
  valid: boolean;
  confidence?: number;
  reason?: string;
  error?: string;
};

export const validatePothole = async (file: File): Promise<ValidationResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${YOLO_SERVICE_URL}/validate/pothole`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (err) {
    console.error('Pothole validation error:', err);
    return { valid: false, error: 'Could not connect to AI service' };
  }
};

export const validateCrime = async (file: File): Promise<ValidationResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${YOLO_SERVICE_URL}/validate/crime`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (err) {
    console.error('Crime validation error:', err);
    return { valid: false, error: 'Could not connect to AI service' };
  }
};
