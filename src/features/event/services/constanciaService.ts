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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background: #FFFFFF;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 40px;
    }

    /* Contenedor principal = Borde Dorado Exterior */
    .diploma-outer {
      width: 800px;
      background: #FFFFFF;
      border: 3px solid #FDE68A;
      border-radius: 20px;
      padding: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    }

    /* Borde Dorado Interior */
    .diploma-inner {
      border: 1.5px solid #FCD34D;
      border-radius: 12px;
      padding: 50px 60px 40px;
      text-align: center;
      position: relative;
    }

    /* Encabezado */
    .icon-cap {
      color: #D97706;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .uni-name {
      color: #1E1B4B;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }

    .diploma-sub {
      color: #6B7280;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .divider {
      height: 1px;
      background-color: #E5E7EB;
      width: 60px;
      margin: 24px auto;
    }

    /* Título Oficial */
    .const-name {
      color: #D97706;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    .body-text {
      color: #4B5563;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    /* Participante */
    .student-name {
      color: #1E1B4B;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 1px;
      border-bottom: 3px solid #FCD34D;
      display: inline-block;
      padding-bottom: 6px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .student-username {
      color: #6B7280;
      font-size: 12px;
      margin-bottom: 24px;
    }

    /* Evento */
    .event-title {
      color: #111827;
      font-size: 20px;
      font-weight: 800;
      font-style: italic;
      margin: 16px 0;
    }

    .event-details {
      color: #6B7280;
      font-size: 12px;
      line-height: 1.8;
      margin-bottom: 40px;
    }

    /* Firmas y Sello */
    .signatures-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 60px;
      margin-top: 50px;
      padding: 0 20px;
    }

    .signature-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 180px;
    }

    .sign-line {
      width: 100%;
      height: 1px;
      background-color: #9CA3AF;
      margin-bottom: 12px;
    }

    .sign-name {
      color: #111827;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .sign-role {
      color: #6B7280;
      font-size: 9px;
      font-weight: 600;
    }

    .seal-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border: 2px solid #F59E0B;
      border-radius: 50%;
      background: #FFFBEB;
    }

    .seal-icon {
      color: #D97706;
      width: 20px;
      height: 20px;
      margin-bottom: 2px;
    }

    .seal-text {
      color: #D97706;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    /* Footer / ID */
    .verification-code {
      margin-top: 40px;
      color: #9CA3AF;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
    }

  </style>
</head>
<body>
  <div class="diploma-outer">
    <div class="diploma-inner">
      
      <!-- Icono SVG GraduationCap (Lucide) -->
      <svg class="icon-cap" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>

      <div class="uni-name">ECHO</div>
      <div class="diploma-sub">CONSTANCIA DE PARTICIPACIÓN</div>

      <div class="divider"></div>

      <div class="const-name">CONSTANCIA OFICIAL</div>

      <div class="body-text">Se certifica que:</div>

      <div class="student-name">
        ${data.participanteNombre || data.participanteUsername}
      </div>
      <div class="student-username">@${data.participanteUsername}</div>

      <div class="body-text">
        Por haber participado en el evento académico:
      </div>

      <div class="event-title">"${data.eventoTitulo}"</div>

      <div class="event-details">
        ${data.eventoLugar} · ${data.eventoFecha} · ${data.eventoHora}<br/>
        Organizado por @${data.organizadorUsername}
      </div>

      <div class="signatures-row">
        <!-- Firma Organizador -->
        <div class="signature-box">
          <div class="sign-line"></div>
          <div class="sign-name">Firma del Organizador</div>
          <div class="sign-role">@${data.organizadorUsername}</div>
        </div>

        <!-- Sello Central -->
        <div class="seal-box">
          <!-- Icono SVG Star (Lucide) -->
          <svg class="seal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <div class="seal-text">SELLO</div>
        </div>
      </div>

      <div class="verification-code">
        ID: ${codigoVerificacion}
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
