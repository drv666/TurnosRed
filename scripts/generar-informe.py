import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'Informe tecnico - TurnosRed.pdf'
RESULTADOS = json.loads((ROOT / 'evidencias' / 'resultados-api.json').read_text(encoding='utf-8'))

azul = colors.HexColor('#146C94')
oscuro = colors.HexColor('#172033')
claro = colors.HexColor('#EAF4FA')
verde = colors.HexColor('#16794B')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TituloPropio', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=24, leading=29, textColor=azul, alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name='Subtitulo', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=azul, spaceBefore=8, spaceAfter=10))
styles.add(ParagraphStyle(name='Cuerpo', parent=styles['BodyText'], fontName='Helvetica', fontSize=10.5, leading=15, textColor=oscuro, spaceAfter=8))
styles.add(ParagraphStyle(name='Codigo', parent=styles['Code'], fontName='Courier', fontSize=8.5, leading=12, textColor=colors.HexColor('#D7E4FF')))

def pie(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.grey)
    canvas.drawString(2 * cm, 1.2 * cm, 'Integraciones Web - Actividad 1')
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f'Página {doc.page}')
    canvas.restoreState()

def panel(texto):
    tabla = Table([[Paragraph(texto.replace('\n', '<br/>'), styles['Codigo'])]], colWidths=[16.4 * cm])
    tabla.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#101827')), ('BOX', (0,0), (-1,-1), 0.7, colors.HexColor('#32445F')), ('LEFTPADDING',(0,0),(-1,-1),12), ('RIGHTPADDING',(0,0),(-1,-1),12), ('TOPPADDING',(0,0),(-1,-1),10), ('BOTTOMPADDING',(0,0),(-1,-1),10)]))
    return tabla

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=1.8*cm, bottomMargin=1.8*cm)
story = [Spacer(1, 2.3*cm), Paragraph('TurnosRed', styles['TituloPropio']), Paragraph('Informe técnico - Actividad 1', ParagraphStyle(name='PortadaSub', parent=styles['Heading2'], alignment=TA_CENTER, textColor=oscuro)), Spacer(1, 1.2*cm), Paragraph('<b>Asignatura:</b> Integraciones Web', styles['Cuerpo']), Paragraph('<b>Fecha de ejecución:</b> 3 de septiembre de 2026', styles['Cuerpo']), Spacer(1, .8*cm), Paragraph('Backend profesional para normalizar, administrar y comunicar en tiempo real turnos médicos provenientes de fuentes JSON heterogéneas.', ParagraphStyle(name='Bajada', parent=styles['Cuerpo'], fontSize=13, leading=19, alignment=TA_CENTER)), PageBreak()]

story += [Paragraph('1. Solución implementada', styles['Subtitulo']), Paragraph('El proyecto utiliza Node.js 24 LTS, TypeScript en modo estricto, Express y Socket.IO. La arquitectura separa modelos, servicios, controladores, rutas y eventos. La lectura inicial usa <b>node:fs/promises</b>, async/await y try/catch.', styles['Cuerpo']), Paragraph('La normalización convierte el ID a entero, el documento a texto, elimina espacios redundantes del paciente, transforma fechas DD/MM/AAAA a AAAA-MM-DD, cambia horas con punto a HH:MM y convierte variantes de sí/no en booleanos. Los registros sin la estructura mínima son descartados.', styles['Cuerpo']), Paragraph('Evidencia de depuración y carga inicial', styles['Subtitulo']), panel('Punto de observación: TurnosService.cargar()\nCarga inicial: 2 aceptados, 1 rechazados.\nTurnosRed disponible en http://localhost:3000\nVerificación TypeScript strict: APROBADA\nVerificación ESLint: APROBADA'), Spacer(1, .4*cm), Paragraph('El archivo .vscode/launch.json permite repetir esta sesión con la configuración “Depurar TurnosRed”.', styles['Cuerpo']), PageBreak()]

story += [Paragraph('2. Pruebas de la API REST', styles['Subtitulo']), Paragraph('Los cinco endpoints se ejecutaron contra el servidor local. La colección importable se encuentra en postman/TurnosRed.postman_collection.json y los resultados completos en evidencias/resultados-api.json.', styles['Cuerpo'])]
filas = [['Prueba', 'Método', 'Estado', 'Tiempo']]
for r in RESULTADOS['resultados']:
    filas.append([r['nombre'], r['metodo'], str(r['estado']), f"{r['duracionMs']} ms"])
t = Table(filas, colWidths=[7.6*cm, 3*cm, 2.5*cm, 3.3*cm], repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),azul),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),9.5),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#B9CBD7')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,claro]),('ALIGN',(1,1),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
story += [t, Spacer(1,.5*cm), Paragraph('<font color="#16794B"><b>Resultado general: APROBADO.</b></font> GET devolvió 200, POST devolvió 201, PUT y DELETE devolvieron 200. También se comprobó previamente el 404 para un recurso inexistente.', styles['Cuerpo']), Paragraph('Ejemplo de respuesta normalizada', styles['Subtitulo']), panel('{\n  "id": 102,\n  "paciente": "Carlos Ruiz",\n  "documento": "31654210",\n  "especialidad": "Pediatría",\n  "fecha": "2026-08-14",\n  "hora": "10:00",\n  "confirmado": true\n}'), PageBreak()]

story += [Paragraph('3. Eventos y comunicación en tiempo real', styles['Subtitulo']), Paragraph('Cada alta, modificación o baja exitosa emite primero un evento interno desacoplado mediante EventEmitter. El servidor Socket.IO escucha esos eventos y los retransmite a los clientes conectados.', styles['Cuerpo']), Table([['Operación', 'Evento interno', 'Evento Socket.IO'], ['POST', 'turno:creado', 'turno:nuevo'], ['PUT', 'turno:actualizado', 'turno:actualizado'], ['DELETE', 'turno:eliminado', 'turno:eliminado']], colWidths=[4*cm,6.2*cm,6.2*cm], style=TableStyle([('BACKGROUND',(0,0),(-1,0),azul),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#B9CBD7')),('FONTSIZE',(0,0),(-1,-1),9.5),('ALIGN',(0,0),(-1,-1),'CENTER'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])), Spacer(1,.5*cm), Paragraph('El archivo evidencias/cliente-socket.html funciona como cliente de demostración sin polling. Al abrirlo mientras el servidor está activo, muestra la conexión y cada evento recibido sin recargar la página.', styles['Cuerpo']), Paragraph('4. Reproducibilidad y entrega', styles['Subtitulo']), Paragraph('El repositorio local contiene cuatro commits claros: configuración, implementación del backend, documentación y evidencias. El README explica instalación, variables de entorno, scripts, API, eventos y estructura de carpetas.', styles['Cuerpo']), panel('nvm use\nnpm install\ncopy .env.example .env\nnpm run lint\nnpm run build\nnpm start\n\nImportar en Postman:\npostman/TurnosRed.postman_collection.json\n\nCliente en tiempo real:\nevidencias/cliente-socket.html'), Spacer(1,.4*cm), Paragraph('<b>Conclusión.</b> La solución satisface los requisitos técnicos: tipado estricto, normalización y validación, CRUD con códigos HTTP, persistencia, eventos internos, Socket.IO, herramientas de calidad y documentación.', styles['Cuerpo'])]

doc.build(story, onFirstPage=pie, onLaterPages=pie)
print(OUT)
