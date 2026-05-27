const CLOUD_NAME = 'dvhxte2gy';
const UPLOAD_PRESET = 'preset_eventos';

/**
 * Sube una imagen local a Cloudinary utilizando el Preset No Firmado (Unsigned).
 * 
 * @param localUri URI local de la imagen (obtenida por ejemplo con expo-image-picker).
 * @returns Promesa que resuelve a la URL segura (https) de la imagen subida.
 */
export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  if (!localUri) {
    throw new Error('La URI de la imagen no es válida.');
  }

  const formData = new FormData();

  // Extraer el nombre de archivo de la URI local
  const filename = localUri.split('/').pop() || 'upload.jpg';
  
  // Deducir el tipo mime a partir de la extensión
  const match = /\.(\w+)$/.exec(filename);
  const extension = match ? match[1].toLowerCase() : 'jpg';
  let mimeType = 'image/jpeg';
  if (extension === 'png') {
    mimeType = 'image/png';
  } else if (extension === 'gif') {
    mimeType = 'image/gif';
  } else if (extension === 'webp') {
    mimeType = 'image/webp';
  }

  // React Native requiere estructurar el archivo con uri, name y type
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: mimeType,
  } as any);

  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Cloudinary] Error en la respuesta:', errorText);
      let errorMessage = 'Error al subir la imagen a Cloudinary.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Fallback al error por defecto si no es JSON válido
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('No se recibió la URL segura de la imagen.');
    }

    return data.secure_url;
  } catch (error: any) {
    console.error('[Cloudinary] Error de red o en la petición:', error);
    throw new Error(error.message || 'Error de conexión al subir la imagen.');
  }
}
