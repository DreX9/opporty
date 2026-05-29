import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Datos necesarios para generar la constancia.
 * Todos los campos provienen de fuentes existentes en el sistema:
 *   - Participante: JwtPayload (auth/state.ts)
 *   - Evento: EventoBackend (types/api.ts)
 *   - Inscripción: RegistrationMeta (event/state.ts)
 *
 * RESTRICCIÓN: No se inventa ningún campo nuevo. Solo se usa lo disponible.
 */
export interface ConstanciaData {
    // --- Participante (del JWT de la sesión activa) ---
    participanteNombre: string;   // payload.firstName + ' ' + payload.lastName
    participanteUsername: string; // payload.sub

    // --- Evento (de EventoBackend) ---
    eventoId: string;
    eventoTitulo: string;
    eventoFecha: string;          // fecha de inicio formateada (ej. "12 Jun")
    eventoHora: string;           // hora de inicio formateada (ej. "09:00 AM")
    eventoLugar: string;
    eventoModalidad: string;      // PRESENCIAL | VIRTUAL | HIBRIDO
    eventoCategoria: string;
    organizadorUsername: string;  // createdByUsername del backend

    // --- Inscripción (de RegistrationMeta) ---
    registrationId: number;
    checkInAt: string | null;
    checkOutAt: string | null;
}

/**
 * Formatea una fecha ISO datetime a un string legible.
 * Ejemplo: "2026-05-28T14:30:00" → "28/05/2026 02:30 PM"
 */
function formatDatetime(isoStr: string | null): string {
    if (!isoStr) return 'No registrado';
    try {
        // El backend devuelve LocalDateTime serializado como array o string ISO
        // Manejamos ambos formatos por seguridad
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return 'No registrado';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch {
        return 'No registrado';
    }
}

/**
 * Genera el HTML del diploma de constancia usando solo los datos del sistema.
 */
function buildConstanciaHTML(data: ConstanciaData): string {
    const codigoVerificacion = `REG-${data.registrationId}-EV-${data.eventoId}`;
    const fechaEmision = new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const modalidadLabel =
        data.eventoModalidad === 'PRESENCIAL' ? 'Presencial' :
        data.eventoModalidad === 'VIRTUAL' ? 'Virtual' :
        data.eventoModalidad === 'HIBRIDO' ? 'Híbrido' :
        data.eventoModalidad;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Constancia de Participación — ${data.eventoTitulo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background: #f0f4f8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
    }

    .diploma {
      background: #ffffff;
      width: 700px;
      padding: 0;
      border-radius: 4px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      overflow: hidden;
    }

    /* Banda superior decorativa */
    .header-band {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6D28D9 100%);
      padding: 28px 40px 24px;
      text-align: center;
      position: relative;
    }

    .header-band::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #EAB308, #F59E0B, #EAB308);
    }

    .header-label {
      color: rgba(255,255,255,0.75);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .header-subtitle {
      color: rgba(255,255,255,0.8);
      font-size: 11px;
      margin-top: 4px;
      letter-spacing: 1.5px;
    }

    /* Cuerpo */
    .body {
      padding: 36px 48px;
      text-align: center;
      border: 2px solid #E5E7EB;
      border-top: none;
      border-bottom: none;
    }

    .certifies-text {
      color: #6B7280;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .participant-name {
      color: #1E1B4B;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #EAB308;
      display: inline-block;
      padding-bottom: 6px;
      margin-bottom: 18px;
    }

    .participant-username {
      color: #6B7280;
      font-size: 12px;
      margin-bottom: 20px;
    }

    .body-text {
      color: #374151;
      font-size: 13px;
      line-height: 1.7;
      max-width: 500px;
      margin: 0 auto 20px;
    }

    .event-title {
      color: #4F46E5;
      font-size: 16px;
      font-weight: 700;
      font-style: italic;
      margin: 16px auto;
      padding: 12px 20px;
      background: #EEF2FF;
      border-left: 4px solid #4F46E5;
      border-radius: 4px;
      text-align: left;
    }

    /* Tabla de detalles */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
      text-align: left;
    }

    .detail-cell {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 12px 14px;
    }

    .detail-label {
      font-size: 9px;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 12px;
      font-weight: 600;
      color: #1F2937;
    }

    /* Footer del diploma */
    .footer-band {
      background: #1E1B4B;
      padding: 20px 40px;
    }

    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left {
      text-align: left;
    }

    .footer-right {
      text-align: right;
    }

    .footer-label {
      color: rgba(255,255,255,0.5);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 3px;
    }

    .footer-value {
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
    }

    .verification-code {
      color: #EAB308;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-top: 10px;
      text-align: center;
    }

    .organizer-section {
      margin: 16px 0 8px;
      padding: 12px 16px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 8px;
      text-align: left;
    }

    .organizer-label {
      font-size: 9px;
      font-weight: 700;
      color: #92400E;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 3px;
    }

    .organizer-value {
      font-size: 12px;
      font-weight: 600;
      color: #78350F;
    }
  </style>
</head>
<body>
  <div class="diploma">
    <!-- Cabecera -->
    <div class="header-band">
      <div class="header-label">Sistema UniRadar</div>
      <div class="header-title">Constancia de Participación</div>
      <div class="header-subtitle">Documento Oficial de Asistencia Académica</div>
    </div>

    <!-- Cuerpo -->
    <div class="body">
      <p class="certifies-text">Se certifica que:</p>

      <div class="participant-name">${data.participanteNombre || data.participanteUsername}</div>
      <div class="participant-username">@${data.participanteUsername}</div>

      <p class="body-text">
        Ha completado exitosamente su asistencia al evento académico, registrando
        tanto su <strong>ingreso</strong> como su <strong>salida</strong> mediante
        el sistema de verificación QR:
      </p>

      <div class="event-title">${data.eventoTitulo}</div>

      <!-- Tabla de detalles del evento -->
      <div class="details-grid">
        <div class="detail-cell">
          <div class="detail-label">📅 Fecha</div>
          <div class="detail-value">${data.eventoFecha}</div>
        </div>
        <div class="detail-cell">
          <div class="detail-label">🕐 Hora de inicio</div>
          <div class="detail-value">${data.eventoHora}</div>
        </div>
        <div class="detail-cell">
          <div class="detail-label">📍 Lugar</div>
          <div class="detail-value">${data.eventoLugar}</div>
        </div>
        <div class="detail-cell">
          <div class="detail-label">🎓 Categoría</div>
          <div class="detail-value">${data.eventoCategoria} · ${modalidadLabel}</div>
        </div>
        <div class="detail-cell">
          <div class="detail-label">✅ Check-in registrado</div>
          <div class="detail-value">${formatDatetime(data.checkInAt)}</div>
        </div>
        <div class="detail-cell">
          <div class="detail-label">🏁 Check-out registrado</div>
          <div class="detail-value">${formatDatetime(data.checkOutAt)}</div>
        </div>
      </div>

      <!-- Organizador (solo username, que es el único dato disponible) -->
      <div class="organizer-section">
        <div class="organizer-label">Organizado por</div>
        <div class="organizer-value">@${data.organizadorUsername}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-band">
      <div class="footer-row">
        <div class="footer-left">
          <div class="footer-label">Fecha de emisión</div>
          <div class="footer-value">${fechaEmision}</div>
        </div>
        <div class="footer-right">
          <div class="footer-label">Generado por</div>
          <div class="footer-value">UniRadar v1.0</div>
        </div>
      </div>
      <div class="verification-code">
        Código de verificación: ${codigoVerificacion}
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Genera el PDF de la constancia y abre el diálogo de compartir/guardar del sistema.
 *
 * GARANTÍA DE SESIÓN: Esta función nunca accede al estado global directamente.
 * Recibe los datos como parámetro, que deben ser proporcionados por el componente
 * a partir del JWT de la sesión activa + eventStateManager.getRegistrationMeta()
 * del usuario actual. El llamador es responsable de pasar los datos correctos.
 *
 * @throws Error si expo-print o expo-sharing no están disponibles
 */
export async function exportConstanciaPDF(data: ConstanciaData): Promise<void> {
    const html = buildConstanciaHTML(data);

    const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Constancia — ${data.eventoTitulo}`,
            UTI: 'com.adobe.pdf',
        });
    } else {
        // Fallback: impresión directa si el dispositivo no tiene Share Sheet
        await Print.printAsync({ uri });
    }
}
