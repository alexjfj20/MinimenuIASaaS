import { supabase } from '../lib/supabaseClient';

export const storageService = {
    /**
     * Sube un archivo a Supabase Storage y devuelve la URL pública.
     * @param file El archivo a subir.
     * @param bucket El nombre del bucket (por defecto 'business-assets').
     * @param path La ruta dentro del bucket.
     */
    async uploadFile(file: File, bucket: string = 'business-assets', path?: string): Promise<string> {
        // Validación de archivo
        if (!file) {
            throw new Error('No se proporcionó un archivo');
        }

        // Validación de tipo de archivo
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            throw new Error(`Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP). Tipo recibido: ${file.type}`);
        }

        // Validación de tamaño (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error(`El archivo es demasiado grande. Tamaño máximo: 5MB. Tamaño del archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);

            // Proporcionar mensajes de error más específicos
            if (error.message.includes('not found')) {
                throw new Error(`El bucket '${bucket}' no existe en Supabase Storage. Por favor, crea el bucket ejecutando el script migration_storage_setup.sql`);
            }

            if (error.message.includes('policy')) {
                throw new Error('No tienes permisos para subir archivos. Verifica las políticas RLS del bucket.');
            }

            if (error.message.includes('size')) {
                throw new Error('El archivo es demasiado grande para ser subido.');
            }

            // Error genérico con detalles
            throw new Error(`Error al subir archivo: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
