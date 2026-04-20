import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ICONS } from '@/components/icons';
import { useTheme } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACCENT_BASE = {
    primary: '#00E5FF',
    secondary: '#FF00FF',
    tertiary: '#39FF14',
    gold: '#FFD700',
    error: '#FF4D4D',
} as const;

//Categorias de los eventos
const CATEGORIAS = ['Tecnología', 'Música', 'Deporte', 'Arte', 'Educación', 'Social'] as const;
type Categoria = (typeof CATEGORIAS)[number];

//Estado inicial del formulario
const ESTADO_INICIAL = {
    titulo: '', fecha: '', hora: '', lugar: '',
    categoria: '', precio: '', asistentes: '',
    descripcion: '', destacado: false, imagenUri: '',
};

function crearEstilos(C: any, accent: any) {
    return StyleSheet.create({
        pantalla: {
            flex: 1,
            backgroundColor: C.bg900,
        },
        cabecera: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
        },
        tituloPrincipal: {
            color: C.textWhite,
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        subtitulo: {
            color: C.textGray,
            fontSize: 13,
            marginTop: 2,
        },
        botonLimpiar: {
            padding: 8,
            backgroundColor: C.bg500,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: C.outline800,
        },
        scrollContenido: {
            paddingHorizontal: 20,
            paddingVertical: 8,
        },
        seccionTitulo: {
            color: accent.primary,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 10,
            marginTop: 16,
        },
        campoContenedor: {
            marginBottom: 14,
        },
        etiquetaFila: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginBottom: 6,
        },
        etiquetaTexto: {
            color: C.textGray,
            fontSize: 12,
            fontWeight: '600',
        },
        input: {
            backgroundColor: C.bg500,
            borderWidth: 1,
            borderColor: C.outline800,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: C.textWhite,
            fontSize: 14,
            width: SCREEN_WIDTH - 40,
        },
        inputMultiline: {
            height: 100,
            paddingTop: 12,
        },
        inputError: {
            borderColor: accent.error,
        },
        errorFila: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 4,
        },
        errorTexto: {
            color: accent.error,
            fontSize: 11,
        },
        fila: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        chipsContenedor: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
        },
        chip: {
            borderWidth: 1,
            borderColor: C.outline800,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 7,
            backgroundColor: C.bg500,
        },
        chipActivo: {
            borderColor: accent.primary,
            backgroundColor: `${accent.primary}22`,
        },
        chipTexto: {
            color: C.textGray,
            fontSize: 13,
            fontWeight: '500',
        },
        chipTextoActivo: {
            color: accent.primary,
            fontWeight: '700',
        },
        switchFila: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: C.bg500,
            borderWidth: 1,
            borderColor: C.outline800,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 14,
        },
        switchEtiqueta: {
            color: C.textWhite,
            fontSize: 14,
            fontWeight: '600',
        },
        switchSubtitulo: {
            color: C.textGray,
            fontSize: 11,
            marginTop: 1,
        },
        pie: {
            marginTop: 24,
            gap: 12,
        },
        textoObligatorio: {
            color: C.textGray,
            fontSize: 11,
            textAlign: 'center',
        },
        botonCrear: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            backgroundColor: accent.primary,
            borderRadius: 14,
            paddingVertical: 15,
        },
        botonCrearDeshabilitado: {
            opacity: 0.5,
        },
        botonCrearTexto: {
            color: '#0B101B',
            fontSize: 15,
            fontWeight: '800',
        },
        botonPrevia: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: accent.primary,
            borderRadius: 14,
            paddingVertical: 13,
        },
        botonPreviaTexto: {
            color: accent.primary,
            fontSize: 14,
            fontWeight: '700',
        },
    });
}

function CampoFormulario({
    Icono, etiqueta, valor, onChange, placeholder,
    error = false, tipoTeclado = 'default', multiline = false,
    mensajeError, estilos, placeholderColor, onPress, editable = true
}: any) {
    const ComponenteContenedor = onPress ? TouchableOpacity : View;

    return (
        <ComponenteContenedor
            style={estilos.campoContenedor}
            {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
        >
            <View style={estilos.etiquetaFila}>
                <Icono size={13} color={ACCENT_BASE.primary} />
                <Text style={estilos.etiquetaTexto}>{etiqueta}</Text>
            </View>

            <View pointerEvents={onPress ? 'none' : 'auto'}>
                <TextInput
                    style={[
                        estilos.input,
                        multiline && estilos.inputMultiline,
                        error && estilos.inputError,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    value={valor}
                    onChangeText={onChange}
                    keyboardType={tipoTeclado}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    editable={editable}
                />
            </View>

            {error && mensajeError && (
                <View style={estilos.errorFila}>
                    <ICONS.AlertCircle size={11} color={ACCENT_BASE.error} />
                    <Text style={estilos.errorTexto}>{mensajeError}</Text>
                </View>
            )}
        </ComponenteContenedor>
    );
}

// Función para validar URL con regex
const esUrlValida = (url: string) => {
    if (!url || url.trim().length === 0) return true;
    const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return regex.test(url);
};

// Función para validar los campos del formulario
const validarFormulario = (form: typeof ESTADO_INICIAL) => {
    return {
        titulo: form.titulo.trim().length === 0,
        fecha: form.fecha.trim().length === 0,
        hora: form.hora.trim().length === 0,
        lugar: form.lugar.trim().length === 0,
        categoria: form.categoria === '',
        precio: form.precio.trim().length === 0,
        descripcion: form.descripcion.trim().length < 10,
        imagenUri: !esUrlValida(form.imagenUri),
    };
};

export default function Tab3() {
    const theme = useTheme();
    const isDark = theme.dark;
    const C = {
        bg900: theme.colors.background,
        bg500: theme.colors.card ?? theme.colors.background,
        outline800: isDark ? '#1E2A3A' : '#E2E8F0',
        textWhite: isDark ? '#F1F5F9' : '#0F172A',
        textGray: isDark ? '#9BA1A6' : '#64748B',
    };
    const accent = { ...ACCENT_BASE, primary: theme.colors.primary as string };

    const estilos = useMemo(() => crearEstilos(C, accent), [isDark, theme.colors.primary]);

    const placeholderColor = isDark ? C.textGray : '#94A3B8';

    const [form, setForm] = useState(ESTADO_INICIAL);
    const [enviado, setEnviado] = useState(false);

    // Estados para Date y Time Pickers
    const [dateValue, setDateValue] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const actualizarCampo = (clave: keyof typeof ESTADO_INICIAL) =>
        (valor: string) => setForm(prev => ({ ...prev, [clave]: valor }));

    const actualizarCampoNumerico = (clave: keyof typeof ESTADO_INICIAL) =>
        (valor: string) => {
            const soloNumeros = valor.replace(/[^0-9]/g, '');
            setForm(prev => ({ ...prev, [clave]: soloNumeros }));
        };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateValue(selectedDate);
            const dia = selectedDate.getDate().toString().padStart(2, '0');
            const mes = selectedDate.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
            const mesFormateado = mes.charAt(0).toUpperCase() + mes.slice(1);
            setForm(prev => ({ ...prev, fecha: `${dia} ${mesFormateado}` }));
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setDateValue(selectedDate);
            let horas = selectedDate.getHours();
            const minutos = selectedDate.getMinutes().toString().padStart(2, '0');
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12;
            horas = horas ? horas : 12;
            const strHora = horas.toString().padStart(2, '0');
            setForm(prev => ({ ...prev, hora: `${strHora}:${minutos} ${ampm}` }));
        }
    };

    const toggleDestacado = () =>
        setForm(prev => ({ ...prev, destacado: !prev.destacado }));

    const seleccionarCategoria = (cat: Categoria) =>
        setForm(prev => ({ ...prev, categoria: cat }));

    //Errores del formulario validados mediante función externa
    const errores = validarFormulario(form);
    const formularioValido = !Object.values(errores).some(Boolean);

    const crearEvento = () => {
        setEnviado(true);
        if (!formularioValido) {
            Alert.alert(
                '⚠️ Campos incompletos',
                'Por favor, completa todos los campos obligatorios antes de continuar.',
                [{ text: 'Entendido', style: 'destructive' }]
            );
            return;
        }
        Alert.alert(
            '✅ ¡Evento creado!',
            `Título: ${form.titulo}\nFecha: ${form.fecha} — ${form.hora}\nLugar: ${form.lugar}\nPrecio: ${form.precio || 'Gratis'}\nCategoría: ${form.categoria}\n\n${form.descripcion}`,
            [
                { text: 'Crear otro', onPress: () => { setForm(ESTADO_INICIAL); setEnviado(false); } },
                { text: '¡Listo!', style: 'default' },
            ]
        );
    };

    const limpiarFormulario = () => {
        Alert.alert(
            'Limpiar formulario',
            '¿Estás seguro de que deseas borrar todos los datos ingresados?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpiar', style: 'destructive', onPress: () => { setForm(ESTADO_INICIAL); setEnviado(false); } },
            ]
        );
    };

    return (
        <View style={estilos.pantalla}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={C.bg900}
            />
            <View style={estilos.cabecera}>
                <View>
                    <Text style={estilos.tituloPrincipal}>Crear Evento</Text>
                    <Text style={estilos.subtitulo}>Completa el formulario para publicar</Text>
                </View>
                <TouchableOpacity
                    style={estilos.botonLimpiar}
                    onPress={limpiarFormulario}
                    accessibilityLabel="Limpiar formulario"
                >
                    <ICONS.X size={16} color={C.textGray} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={estilos.scrollContenido}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={estilos.seccionTitulo}>Información general</Text>

                <CampoFormulario
                    Icono={ICONS.Type} etiqueta="Título del evento *"
                    valor={form.titulo} onChange={actualizarCampo('titulo')}
                    placeholder="Ej: Hackathon Tech 2025"
                    error={enviado && errores.titulo} mensajeError="El título es obligatorio"
                    estilos={estilos} placeholderColor={placeholderColor}
                />
                <CampoFormulario
                    Icono={ICONS.AlignLeft} etiqueta="Descripción *"
                    valor={form.descripcion} onChange={actualizarCampo('descripcion')}
                    placeholder="Describe el evento (mínimo 10 caracteres)..."
                    error={enviado && errores.descripcion} mensajeError="Mínimo 10 caracteres"
                    multiline estilos={estilos} placeholderColor={placeholderColor}
                />
                <CampoFormulario
                    Icono={ICONS.ImageIcon} etiqueta="URL de imagen (opcional)"
                    valor={form.imagenUri} onChange={actualizarCampo('imagenUri')}
                    placeholder="https://images.unsplash.com/..."
                    error={(!esUrlValida(form.imagenUri) && form.imagenUri.length > 0) || (enviado && errores.imagenUri)}
                    mensajeError="URL inválida. Debe ser del formato ej. https://google.com"
                    estilos={estilos} placeholderColor={placeholderColor}
                />

                <Text style={[estilos.seccionTitulo, { marginTop: 8 }]}>Fecha y hora</Text>

                <View style={estilos.fila}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <CampoFormulario
                            Icono={ICONS.CalendarDays} etiqueta="Fecha *"
                            valor={form.fecha} onChange={() => { }}
                            placeholder="Ej: 24 Abr"
                            error={enviado && errores.fecha} mensajeError="Requerida"
                            estilos={estilos} placeholderColor={placeholderColor}
                            editable={false} onPress={() => setShowDatePicker(true)}
                        />
                        {showDatePicker && (
                            <DateTimePicker
                                value={dateValue}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <CampoFormulario
                            Icono={ICONS.Clock} etiqueta="Hora *"
                            valor={form.hora} onChange={() => { }}
                            placeholder="09:00 AM"
                            error={enviado && errores.hora} mensajeError="Requerida"
                            estilos={estilos} placeholderColor={placeholderColor}
                            editable={false} onPress={() => setShowTimePicker(true)}
                        />
                        {showTimePicker && (
                            <DateTimePicker
                                value={dateValue}
                                mode="time"
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}
                    </View>
                </View>

                <Text style={[estilos.seccionTitulo, { marginTop: 8 }]}>Lugar y precio</Text>

                <CampoFormulario
                    Icono={ICONS.MapPin} etiqueta="Lugar *"
                    valor={form.lugar} onChange={actualizarCampo('lugar')}
                    placeholder="Centro de Convenciones, Lima"
                    error={enviado && errores.lugar} mensajeError="El lugar es obligatorio"
                    estilos={estilos} placeholderColor={placeholderColor}
                />

                <View style={estilos.fila}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <CampoFormulario
                            Icono={ICONS.DollarSign} etiqueta="Precio *"
                            valor={form.precio} onChange={actualizarCampoNumerico('precio')}
                            placeholder="S/ 50"
                            error={enviado && errores.precio} mensajeError="Requerido"
                            estilos={estilos} placeholderColor={placeholderColor}
                            tipoTeclado="numeric"
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <CampoFormulario
                            Icono={ICONS.Users} etiqueta="Asistentes estimados"
                            valor={form.asistentes} onChange={actualizarCampoNumerico('asistentes')}
                            placeholder="Ej: 200" tipoTeclado="numeric"
                            estilos={estilos} placeholderColor={placeholderColor}
                        />
                    </View>
                </View>

                <Text style={[estilos.seccionTitulo, { marginTop: 8 }]}>Categoría *</Text>

                <View style={estilos.chipsContenedor}>
                    {CATEGORIAS.map((cat) => {
                        const activo = form.categoria === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[estilos.chip, activo && estilos.chipActivo]}
                                onPress={() => seleccionarCategoria(cat)}
                                accessibilityLabel={`Seleccionar categoría ${cat}`}
                            >
                                <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {enviado && errores.categoria && (
                    <View style={[estilos.errorFila, { marginTop: -8, marginBottom: 4 }]}>
                        <ICONS.AlertCircle size={11} color={accent.error} />
                        <Text style={estilos.errorTexto}>Selecciona una categoría</Text>
                    </View>
                )}

                <Text style={[estilos.seccionTitulo, { marginTop: 8 }]}>Opciones</Text>

                <View style={estilos.switchFila}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ICONS.Star
                            size={16}
                            color={form.destacado ? accent.gold : C.textGray}
                            fill={form.destacado ? accent.gold : 'transparent'}
                        />
                        <View>
                            <Text style={estilos.switchEtiqueta}>Marcar como destacado</Text>
                            <Text style={estilos.switchSubtitulo}>
                                Aparecerá con badge especial en la lista
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={toggleDestacado} accessibilityLabel="Activar destacado">
                        {form.destacado
                            ? <ICONS.ToggleRight size={32} color={accent.primary} />
                            : <ICONS.ToggleLeft size={32} color={C.textGray} />
                        }
                    </TouchableOpacity>
                </View>

                <View style={estilos.pie}>
                    <Text style={estilos.textoObligatorio}>* Campos obligatorios</Text>

                    <TouchableOpacity
                        style={[estilos.botonCrear, !formularioValido && enviado && estilos.botonCrearDeshabilitado]}
                        onPress={crearEvento}
                        accessibilityLabel="Crear evento"
                    >
                        <ICONS.PlusCircle size={18} color="#0B101B" />
                        <Text style={estilos.botonCrearTexto}>Crear Evento</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={estilos.botonPrevia}
                        onPress={() =>
                            Alert.alert(
                                '👁 Vista previa',
                                form.titulo
                                    ? `"${form.titulo}" aparecerá en la pestaña Eventos una vez publicado.`
                                    : 'Ingresa al menos el título para ver una vista previa.',
                                [{ text: 'OK' }]
                            )
                        }
                        accessibilityLabel="Vista previa del evento"
                    >
                        <ICONS.FileText size={16} color={accent.primary} />
                        <Text style={estilos.botonPreviaTexto}>Vista previa</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}