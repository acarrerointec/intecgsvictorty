/*
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Estilos para el PDF
const styles = {
  title: { fontSize: 24, bold: true, color: '#2E86AB' },
  subtitle: { fontSize: 16, color: '#555' },
  header: { fontSize: 14, bold: true, color: '#333', margin: [0, 10, 0, 5] },
  metric: { fontSize: 36, bold: true, color: '#2E86AB' },
  metricLabel: { fontSize: 12, color: '#666' },
  tableHeader: { 
    fillColor: '#2E86AB', 
    textColor: 'white', 
    fontSize: 10, 
    bold: true,
    halign: 'center' 
  },
  tableRow: { 
    fontSize: 9,
    cellPadding: 4,
    overflow: 'linebreak'
  },
  footer: { fontSize: 10, color: '#999' }
};

/**
 * Exporta datos a un PDF profesional con métricas, gráficos y tablas
 * @param {Array} elements - Array de secciones a incluir en el PDF
 * @param {String} title - Título del documento
 *//*
export const exportToPDF = async (elements, title = 'Program Report') => {
 try {
   // 1. Inicializar documento PDF
   const doc = new jsPDF('p', 'pt', 'a4');
   const pageWidth = doc.internal.pageSize.getWidth();
   const margin = 40;
   let yPosition = margin;

   // 2. Verificar que el plugin está disponible
   if (typeof autoTable !== 'function') {
     throw new Error('jspdf-autotable plugin not loaded correctly');
   }

   // 3. Función para agregar nueva página si es necesario
   const checkAddPage = (heightNeeded) => {
     if (yPosition + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
       doc.addPage();
       yPosition = margin;
       return true;
     }
     return false;
   };

   // 4. Portada profesional
   doc.setFillColor(46, 134, 171);
   doc.rect(0, 0, pageWidth, 100, 'F');
   doc.setTextColor(255, 255, 255);
   doc.setFontSize(styles.title.fontSize);
   doc.text(title, margin, 70);
   doc.setFontSize(styles.subtitle.fontSize);
   doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 90);
   doc.addPage();

   // 5. Procesar cada sección
   for (const section of elements) {
     if (!section || !section.type) {
       console.warn('Invalid section skipped:', section);
       continue;
     }

     // Encabezado de sección
     checkAddPage(50);
     doc.setTextColor(styles.header.color);
     doc.setFontSize(styles.header.fontSize);
     doc.setFont(undefined, 'bold');
     doc.text(section.title, margin, yPosition);
     yPosition += 30;

     switch (section.type) {
       case 'metrics':
         // Diseño de métricas en cuadrícula
         const metricsPerRow = 3;
         const metricWidth = (pageWidth - margin * 2) / metricsPerRow;
         const metricHeight = 80;
         
         section.data.forEach((metric, index) => {
           if (index % metricsPerRow === 0 && index !== 0) {
             yPosition += metricHeight;
             checkAddPage(metricHeight);
           }
           
           const xPos = margin + (index % metricsPerRow) * metricWidth;
           
           // Valor de la métrica
           doc.setTextColor(styles.metric.color);
           doc.setFontSize(styles.metric.fontSize);
           doc.text(
             metric.value.toString(), 
             xPos + metricWidth/2, 
             yPosition + 30, 
             { align: 'center' }
           );
           
           // Etiqueta
           doc.setTextColor(styles.metricLabel.color);
           doc.setFontSize(styles.metricLabel.fontSize);
           doc.text(
             metric.label, 
             xPos + metricWidth/2, 
             yPosition + 50, 
             { align: 'center' }
           );
         });
         
         yPosition += metricHeight;
         break;

       case 'chart':
         // Capturar gráfico como imagen
         try {
           if (!section.node) {
             console.warn('Chart node missing for section:', section.title);
             break;
           }

           // Asegurar visibilidad del elemento
           const originalDisplay = section.node.style.display;
           section.node.style.display = 'block';

           const canvas = await html2canvas(section.node, {
             scale: 2,
             useCORS: true,
             logging: false,
             backgroundColor: '#FFFFFF',
             scrollX: 0,
             scrollY: 0,
             windowWidth: section.node.scrollWidth,
             windowHeight: section.node.scrollHeight
           });

           // Restaurar estilo original
           section.node.style.display = originalDisplay;

           if (!canvas) {
             throw new Error('Canvas not created');
           }

           const imgData = canvas.toDataURL('image/png');
           
           if (!imgData || imgData === 'data:,') {
             throw new Error('Failed to get image data from canvas');
           }

           const imgProps = doc.getImageProperties(imgData);
           const pdfWidth = pageWidth - 2 * margin;
           const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
           
           checkAddPage(pdfHeight);
           doc.addImage(imgData, 'PNG', margin, yPosition, pdfWidth, pdfHeight);
           yPosition += pdfHeight + 20;
         } catch (chartError) {
           console.error(`Error processing chart "${section.title}":`, chartError);
           doc.setTextColor('#ff0000');
           doc.text(`[Chart "${section.title}" failed to render]`, margin, yPosition);
           yPosition += 30;
         }
         break;

       case 'table':
         // Generar tabla con autoTable
         try {
           if (!section.headers || !section.rows) {
             throw new Error('Missing table headers or rows');
           }

           autoTable(doc, {
             startY: yPosition,
             head: [section.headers],
             body: section.rows,
             margin: { left: margin, right: margin },
             headStyles: styles.tableHeader,
             bodyStyles: styles.tableRow,
             styles: {
               overflow: 'linebreak',
               cellPadding: 4,
               fontSize: 9,
               valign: 'middle'
             },
             didDrawPage: (data) => {
               yPosition = data.cursor.y;
             }
           });

           yPosition += 20;
         } catch (tableError) {
           console.error(`Error processing table "${section.title}":`, tableError);
           doc.setTextColor('#ff0000');
           doc.text(`[Table "${section.title}" failed to render]`, margin, yPosition);
           yPosition += 30;
         }
         break;

       default:
         console.warn('Unknown section type:', section.type);
     }
   }

   // 6. Pie de página en todas las páginas
   const totalPages = doc.internal.getNumberOfPages();
   for (let i = 1; i <= totalPages; i++) {
     doc.setPage(i);
     doc.setFontSize(styles.footer.fontSize);
     doc.setTextColor(styles.footer.color);
     doc.text(
       `Page ${i} of ${totalPages}`,
       pageWidth - margin,
       doc.internal.pageSize.getHeight() - 20,
       { align: 'right' }
     );
     doc.text(
       '© Executive Dashboard',
       margin,
       doc.internal.pageSize.getHeight() - 20
     );
   }

   // 7. Guardar el PDF
   const fileName = `${title.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
   doc.save(fileName);
   return fileName;
 } catch (error) {
   console.error('PDF generation failed:', error);
   throw error;
 }
};

*/

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const styles = {

  title: { fontSize: 24, bold: true, color: '#2E86AB' },
  subtitle: { fontSize: 16, color: '#555' },
  header: { fontSize: 14, bold: true, color: '#333', margin: [0, 10, 0, 5] },
  metric: { fontSize: 36, bold: true, color: '#2E86AB' },
  metricLabel: { fontSize: 12, color: '#666' },
  tableHeader: {
    fillColor: '#2E86AB',
    textColor: 'white',
    fontSize: 10,
    bold: true,
    halign: 'center'
  },
  tableRow: {
    fontSize: 9,
    cellPadding: 4,
    overflow: 'linebreak'
  },
  footer: { fontSize: 10, color: '#999' }
};

export const exportToPDF = async (elements, title = 'Program Report') => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let yPosition = margin;

  // 1. Portada mejorada
  doc.setFillColor(30, 50, 80);
  doc.rect(0, 0, pageWidth, 120, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(title, margin, 80);
  doc.setFontSize(16);
  doc.text(`Generated: ${new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric'
  })}`, margin, 100);
  doc.addPage();

  // 2. Función para asegurar la visibilidad de elementos
  const prepareElementForCapture = (element) => {
    const originalStyles = {
      position: element.style.position,
      visibility: element.style.visibility,
      opacity: element.style.opacity,
      zIndex: element.style.zIndex,
      overflow: element.style.overflow
    };

    element.style.position = 'absolute';
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    element.style.zIndex = '9999';
    element.style.overflow = 'visible';

    return () => {
      Object.assign(element.style, originalStyles);
    };
  };

  // 3. Procesar secciones
  for (const section of elements) {
    // Encabezado de sección
    doc.setFontSize(18);
    doc.setTextColor(30, 50, 80);
    doc.text(section.title, margin, yPosition);
    yPosition += 30;

    switch (section.type) {
      case 'metrics':
        // Diseño de métricas mejorado
        const cols = 3;
        const boxWidth = (pageWidth - margin * 2) / cols;
        const boxHeight = 90;

        section.data.forEach((metric, i) => {
          if (i % cols === 0 && i !== 0) {
            yPosition += boxHeight + 20;
            if (yPosition + boxHeight > doc.internal.pageSize.height - margin) {
              doc.addPage();
              yPosition = margin;
            }
          }

          const x = margin + (i % cols) * boxWidth;

          // Caja de fondo
          doc.setFillColor(240, 245, 250);
          doc.rect(x, yPosition, boxWidth, boxHeight, 'F');

          // Valor
          doc.setFontSize(32);
          doc.setTextColor(30, 50, 80);
          doc.text(
            metric.value.toString(),
            x + boxWidth / 2,
            yPosition + 50,
            { align: 'center' }
          );

          // Etiqueta
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(
            metric.label,
            x + boxWidth / 2,
            yPosition + 70,
            { align: 'center' }
          );
        });

        yPosition += boxHeight + 40;
        break;

      case 'chart':
        try {
          const restoreStyles = prepareElementForCapture(section.node);

          // Aumentar calidad de captura
          const canvas = await html2canvas(section.node, {
            scale: 3, // Mayor resolución
            useCORS: true,
            logging: true,
            backgroundColor: null,
            allowTaint: true,
            windowWidth: section.node.scrollWidth + 100,
            windowHeight: section.node.scrollHeight + 100
          });

          restoreStyles();

          const imgData = canvas.toDataURL('image/png', 1.0);
          const imgProps = doc.getImageProperties(imgData);
          const pdfWidth = pageWidth - margin * 2;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          if (yPosition + pdfHeight > doc.internal.pageSize.height - margin) {
            doc.addPage();
            yPosition = margin;
          }

          doc.addImage(imgData, 'PNG', margin, yPosition, pdfWidth, pdfHeight);
          yPosition += pdfHeight + 30;
        } catch (error) {
          console.error(`Error capturing chart: ${error}`);
          doc.setFontSize(12);
          doc.setTextColor(200, 0, 0);
          doc.text('Chart could not be rendered', margin, yPosition);
          yPosition += 30;
        }
        break;

      case 'table':
        try {
          // Tabla con scroll horizontal si es necesario
          autoTable(doc, {
            startY: yPosition,
            head: [section.headers.map(h => h.toUpperCase())],
            body: section.rows,
            margin: { left: margin, right: margin },
            headStyles: {
              fillColor: [30, 50, 80],
              textColor: 255,
              fontSize: 10,
              cellPadding: 6
            },
            bodyStyles: {
              fontSize: 9,
              cellPadding: 4,
              overflow: 'linebreak'
            },
            styles: {
              valign: 'middle',
              halign: 'left'
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 'auto' },
              // Ajusta según tus columnas
            },
            didDrawPage: (data) => {
              yPosition = data.cursor.y + 20;
            }
          });
        } catch (error) {
          console.error(`Error generating table: ${error}`);
          doc.setFontSize(12);
          doc.setTextColor(200, 0, 0);
          doc.text('Table could not be generated', margin, yPosition);
          yPosition += 30;
        }
        break;
    }

    // Espacio entre secciones
    yPosition += 30;
  }

  // Pie de página en todas las páginas
  const totalPages = doc.internal.getNumberOfPages();
  const footerText = `© ${new Date().getFullYear()} Program Report | Generated by NCS Lite Web`;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    // Número de página
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      doc.internal.pageSize.height - 20,
      { align: 'right' }
    );

    // Texto del footer
    doc.text(
      footerText,
      margin,
      doc.internal.pageSize.height - 20
    );
  }

  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};