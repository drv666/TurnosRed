import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'Informe tecnico - TurnosRed.pdf'
RESULTADOS = json.loads((ROOT / 'evidencias' / 'resultados-api.json').read_text(encoding='utf-8'))

bordo = colors.HexColor('#59383D')
oscuro = colors.HexColor('#172033')
claro = colors.HexColor('#F3EEEE')
verde = colors.HexColor('#16794B')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TituloPropio', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=24, leading=29, textColor=oscuro, alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name='Subtitulo', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=bordo, spaceBefore=8, spaceAfter=10))
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

def captura(nombre, pie_texto):
    imagen = Image(str(ROOT / 'evidencias' / nombre), width=16.4*cm, height=10.93*cm)
    return [imagen, Spacer(1, .15*cm), Paragraph(pie_texto, ParagraphStyle(name=f'Pie-{nombre}', parent=styles['Cuerpo'], fontSize=8.5, leading=11, textColor=colors.HexColor('#555555'), alignment=TA_CENTER))]

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=1.8*cm, bottomMargin=1.8*cm)
story = [Spacer(1, 2.3*cm), Paragraph('TurnosRed', styles['TituloPropio']), Paragraph('Informe técnico - Actividad 1', ParagraphStyle(name='PortadaSub', parent=styles['Heading2'], alignment=TA_CENTER, textColor=oscuro)), Spacer(1, 1.2*cm), Paragraph('<b>Asignatura:</b> Integraciones Web', styles['Cuerpo']), Paragraph('<b>Fecha de ejecución:</b> 3 de septiembre de 2026', styles['Cuerpo']), Spacer(1, .8*cm), Paragraph('Backend profesional para normalizar, administrar y comunicar en tiempo real turnos médicos provenientes de fuentes JSON heterogéneas.', ParagraphStyle(name='Bajada', parent=styles['Cuerpo'], fontSize=13, leading=19, alignment=TA_CENTER)), PageBreak()]

story += [Paragraph('1. Solución implementada', styles['Subtitulo']), Paragraph('Para resolver la actividad partí del proyecto base y lo reorganizé por responsabilidades. Separé los modelos, la lógica de negocio, los controladores, las rutas y los eventos para que cada parte pueda entenderse y probarse de manera independiente.', styles['Cuerpo']), Paragraph('La lectura inicial utiliza <b>node:fs/promises</b> con async/await y try/catch. Durante la carga se limpian los nombres, se convierten los identificadores y documentos, se unifican fecha y hora, y se interpretan las distintas formas de indicar si un turno está confirmado. Los registros incompletos o inválidos no ingresan al sistema.', styles['Cuerpo']), Paragraph('Captura de la ejecución inicial', styles['Subtitulo'])]
story += captura('captura-ejecucion-servidor.png', 'Captura 1. Compilación, control de estilo y carga inicial del servidor.')
story += [Spacer(1, .25*cm), Paragraph('La salida confirma que dos registros fueron normalizados y que el registro con identificador inválido fue rechazado. La configuración .vscode/launch.json permite repetir la depuración paso a paso.', styles['Cuerpo']), PageBreak()]

story += [Paragraph('2. Pruebas de la API REST', styles['Subtitulo']), Paragraph('Los cinco endpoints se ejecutaron contra el servidor local. La colección importable se encuentra en postman/TurnosRed.postman_collection.json y los resultados completos en evidencias/resultados-api.json.', styles['Cuerpo'])]
filas = [['Prueba', 'Método', 'Estado', 'Tiempo']]
for r in RESULTADOS['resultados']:
    filas.append([r['nombre'], r['metodo'], str(r['estado']), f"{r['duracionMs']} ms"])
t = Table(filas, colWidths=[7.6*cm, 3*cm, 2.5*cm, 3.3*cm], repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),bordo),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(-1,-1),'Helvetica'),('FONTSIZE',(0,0),(-1,-1),9.5),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#C8B9BB')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,claro]),('ALIGN',(1,1),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
story += [t, Spacer(1,.35*cm), Paragraph('<b>Resultado general: APROBADO.</b> Los cinco recorridos principales respondieron con el código esperado. La colección preparada puede importarse en Postman para repetir cada solicitud.', styles['Cuerpo']), Paragraph('Captura de las pruebas', styles['Subtitulo'])]
story += captura('captura-pruebas-api.png', 'Captura 2. Ejecución reproducible de los cinco endpoints REST.')
story += [PageBreak()]

story += [Paragraph('3. Eventos y comunicación en tiempo real', styles['Subtitulo']), Paragraph('En las operaciones de alta, modificación y baja, el servicio emite un evento interno mediante EventEmitter. Socket.IO recibe esa notificación y la envía a los clientes conectados, por lo que la pantalla puede actualizarse sin recargas ni consultas periódicas.', styles['Cuerpo']), Table([['Operación', 'Evento interno', 'Evento Socket.IO'], ['POST', 'turno:creado', 'turno:nuevo'], ['PUT', 'turno:actualizado', 'turno:actualizado'], ['DELETE', 'turno:eliminado', 'turno:eliminado']], colWidths=[4*cm,6.2*cm,6.2*cm], style=TableStyle([('BACKGROUND',(0,0),(-1,0),bordo),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#C8B9BB')),('FONTSIZE',(0,0),(-1,-1),9.5),('ALIGN',(0,0),(-1,-1),'CENTER'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])), Spacer(1,.35*cm), Paragraph('La siguiente captura corresponde al cliente incluido en evidencias/cliente-socket.html. Se observa la recepción de un turno nuevo y su posterior actualización durante la misma conexión.', styles['Cuerpo'])]
story += captura('captura-socket-io.png', 'Captura 3. Eventos recibidos por Socket.IO sin recargar la página.')
story += [Spacer(1,.25*cm), Paragraph('4. Cierre y entrega', styles['Subtitulo']), Paragraph('El proyecto quedó publicado en GitHub con un historial progresivo de cambios. El README explica cómo instalarlo y ejecutarlo, mientras que la colección Postman, el cliente Socket.IO y los archivos JSON permiten repetir las comprobaciones.', styles['Cuerpo']), Paragraph('<b>Conclusión.</b> La actividad me permitió integrar lectura asíncrona, tipado, validación, diseño REST y eventos en tiempo real dentro de una solución ordenada y verificable.', styles['Cuerpo'])]

doc.build(story, onFirstPage=pie, onLaterPages=pie)
print(OUT)
