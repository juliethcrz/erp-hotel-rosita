import ExcelJS from 'exceljs';
import { fechaParaExcel, textoPeriodo } from './formato.js';

const FORMATO_CELDA = {
  pesos: '"$" #,##0',
  numero: '#,##0',
  porcentaje: '0.0%',
  fecha: 'dd/mm/yyyy',
  fechaHora: 'dd/mm/yyyy hh:mm',
};
const VERDE_OSCURO = 'FF0B2B26';
const VERDE_CLARO = 'FFDAF1DE';

const nombreHoja = (titulo) => titulo.replace(/[\\/?*[\]:]/g, '').slice(0, 31);

function hojaResumen(libro, documento) {
  const hoja = libro.addWorksheet('Resumen');
  hoja.columns = [{ width: 38 }, { width: 22 }];

  hoja.addRow(['Hotel Rosita']).font = { bold: true, size: 11, color: { argb: 'FF235347' } };
  hoja.addRow([documento.titulo]).font = { bold: true, size: 16 };
  hoja.addRow([`Periodo: ${textoPeriodo(documento.periodo)}`]).font = {
    color: { argb: 'FF6B7F78' },
  };
  hoja.addRow([]);

  for (const cifra of documento.cifras) {
    const fila = hoja.addRow([cifra.etiqueta, cifra.valor]);
    fila.getCell(2).numFmt = FORMATO_CELDA[cifra.formato] ?? 'General';
    fila.getCell(2).font = { bold: true };
  }
}

function hojaTabla(libro, { titulo, columnas, filas }) {
  const hoja = libro.addWorksheet(nombreHoja(titulo), {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  hoja.columns = columnas.map((columna) => ({
    header: columna.titulo,
    key: columna.clave,
    width: Math.max(12, (columna.ancho ?? 1) * 9),
    style: { numFmt: FORMATO_CELDA[columna.formato] },
  }));

  for (const fila of filas) {
    hoja.addRow(
      Object.fromEntries(
        columnas.map((columna) => [
          columna.clave,
          fechaParaExcel(fila[columna.clave], columna.formato),
        ]),
      ),
    );
  }

  const encabezado = hoja.getRow(1);
  encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE_OSCURO } };
  encabezado.height = 20;

  hoja.eachRow((fila, numero) => {
    if (numero > 1 && numero % 2 === 1) {
      fila.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE_CLARO } };
    }
  });
  if (filas.length > 0) {
    hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columnas.length } };
  }
}

/** Arma un libro de Excel con una hoja de resumen y una hoja por tabla. */
export async function generarExcel(documento) {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Hotel Rosita · ERP';
  libro.created = new Date();

  hojaResumen(libro, documento);
  documento.tablas.forEach((datos) => hojaTabla(libro, datos));

  return Buffer.from(await libro.xlsx.writeBuffer());
}
