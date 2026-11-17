import PDFDocument from 'pdfkit';
import { aTexto, esNumerico, textoPeriodo } from './formato.js';

const COLOR = {
  marca: '#0B2B26',
  primario: '#235347',
  suave: '#DAF1DE',
  fila: '#F4F9F5',
  texto: '#1B2B27',
  tenue: '#6B7F78',
  borde: '#D5E3DA',
};
const MARGEN = 40;
const ALTO_FILA = 20;

function encabezado(doc, documento) {
  const ancho = doc.page.width;
  doc.rect(0, 0, ancho, 86).fill(COLOR.marca);
  doc.fillColor('#8EB69B').font('Helvetica').fontSize(9).text('HOTEL ROSITA', MARGEN, 26);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text(documento.titulo, MARGEN, 40);
  doc
    .fillColor(COLOR.suave)
    .font('Helvetica')
    .fontSize(9)
    .text(`Periodo: ${textoPeriodo(documento.periodo)}`, MARGEN, 40, {
      width: ancho - MARGEN * 2,
      align: 'right',
    })
    .text(`Generado: ${aTexto(new Date(), 'fechaHora')}`, MARGEN, 54, {
      width: ancho - MARGEN * 2,
      align: 'right',
    });
  doc.y = 110;
}

function cifras(doc, lista) {
  const porFila = 3;
  const separacion = 10;
  const ancho = (doc.page.width - MARGEN * 2 - separacion * (porFila - 1)) / porFila;
  const alto = 52;

  lista.forEach((cifra, indice) => {
    const columna = indice % porFila;
    if (columna === 0 && indice > 0) doc.y += alto + separacion;
    const x = MARGEN + columna * (ancho + separacion);
    const y = doc.y;
    doc.roundedRect(x, y, ancho, alto, 8).fill(indice === 0 ? COLOR.primario : COLOR.fila);
    doc
      .fillColor(indice === 0 ? COLOR.suave : COLOR.tenue)
      .font('Helvetica')
      .fontSize(8)
      .text(cifra.etiqueta.toUpperCase(), x + 12, y + 11, { width: ancho - 24 });
    doc
      .fillColor(indice === 0 ? '#FFFFFF' : COLOR.texto)
      .font('Helvetica-Bold')
      .fontSize(15)
      .text(aTexto(cifra.valor, cifra.formato), x + 12, y + 26, { width: ancho - 24 });
    doc.y = y;
  });
  doc.y += alto + 24;
}

function tabla(doc, { titulo, columnas, filas }) {
  const anchoTotal = doc.page.width - MARGEN * 2;
  const unidades = columnas.reduce((suma, columna) => suma + (columna.ancho ?? 1), 0);
  const anchos = columnas.map((columna) => (anchoTotal * (columna.ancho ?? 1)) / unidades);
  const limite = () => doc.page.height - MARGEN - 30;

  const filaEncabezado = () => {
    let x = MARGEN;
    const y = doc.y;
    doc.rect(MARGEN, y, anchoTotal, ALTO_FILA).fill(COLOR.marca);
    columnas.forEach((columna, i) => {
      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(columna.titulo, x + 6, y + 6, {
          width: anchos[i] - 12,
          align: esNumerico(columna.formato) ? 'right' : 'left',
          height: 11,
          lineBreak: false,
          ellipsis: true,
        });
      x += anchos[i];
    });
    doc.y = y + ALTO_FILA;
  };

  if (doc.y + 60 > limite()) doc.addPage();
  doc.fillColor(COLOR.texto).font('Helvetica-Bold').fontSize(12).text(titulo, MARGEN, doc.y);
  doc.y += 6;
  filaEncabezado();

  if (filas.length === 0) {
    doc
      .fillColor(COLOR.tenue)
      .font('Helvetica-Oblique')
      .fontSize(9)
      .text('Sin registros en el periodo.', MARGEN + 6, doc.y + 6);
    doc.y += ALTO_FILA + 18;
    return;
  }

  filas.forEach((fila, indice) => {
    if (doc.y + ALTO_FILA > limite()) {
      doc.addPage();
      doc.y = MARGEN;
      filaEncabezado();
    }
    const y = doc.y;
    if (indice % 2 === 1) doc.rect(MARGEN, y, anchoTotal, ALTO_FILA).fill(COLOR.fila);
    let x = MARGEN;
    columnas.forEach((columna, i) => {
      doc
        .fillColor(COLOR.texto)
        .font('Helvetica')
        .fontSize(8.5)
        .text(aTexto(fila[columna.clave], columna.formato), x + 6, y + 6, {
          width: anchos[i] - 12,
          align: esNumerico(columna.formato) ? 'right' : 'left',
          height: 11,
          lineBreak: false,
          ellipsis: true,
        });
      x += anchos[i];
    });
    doc.y = y + ALTO_FILA;
  });

  doc
    .moveTo(MARGEN, doc.y)
    .lineTo(MARGEN + anchoTotal, doc.y)
    .strokeColor(COLOR.borde)
    .stroke();
  doc.y += 22;
}

function piesDePagina(doc) {
  const { start, count } = doc.bufferedPageRange();
  for (let i = start; i < start + count; i += 1) {
    doc.switchToPage(i);
    const y = doc.page.height - MARGEN + 10;
    doc
      .fillColor(COLOR.tenue)
      .font('Helvetica')
      .fontSize(8)
      .text('Hotel Rosita · ERP', MARGEN, y, { lineBreak: false })
      .text(`Página ${i + 1} de ${count}`, MARGEN, y, {
        width: doc.page.width - MARGEN * 2,
        align: 'right',
        lineBreak: false,
      });
  }
}

/** Dibuja el documento en un PDF tamaño carta y lo devuelve como Buffer. */
export function generarPdf(documento) {
  return new Promise((resolver, rechazar) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: MARGEN, bottom: 0, left: MARGEN, right: MARGEN },
      bufferPages: true,
      info: { Title: documento.titulo, Author: 'Hotel Rosita' },
    });
    const partes = [];
    doc.on('data', (parte) => partes.push(parte));
    doc.on('end', () => resolver(Buffer.concat(partes)));
    doc.on('error', rechazar);

    encabezado(doc, documento);
    cifras(doc, documento.cifras);
    documento.tablas.forEach((datos) => tabla(doc, datos));
    piesDePagina(doc);
    doc.end();
  });
}
