import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// Define a type for the data for better type safety
interface CertificateData {
  username: string;
  courseTitle: string;
  instructor: string;
  completionDate: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateCertificatePdf(data: CertificateData): Promise<Buffer> {
    try {
      // Define paths to your font files
      const fontPaths = {
        montserratRegular: path.join(
          process.cwd(),
          'public',
          'fonts',
          'Montserrat-Regular.ttf',
        ),
        montserratMedium: path.join(
          process.cwd(),
          'public',
          'fonts',
          'Montserrat-Medium.ttf',
        ),
        montserratSemiBold: path.join(
          process.cwd(),
          'public',
          'fonts',
          'Montserrat-SemiBold.ttf',
        ),
        montserratBold: path.join(
          process.cwd(),
          'public',
          'fonts',
          'Montserrat-Bold.ttf',
        ),
        playfairBold: path.join(
          process.cwd(),
          'public',
          'fonts',
          'PlayfairDisplay-Bold.ttf',
        ),
      };

      // Check if font files exist
      for (const key in fontPaths) {
        if (!fs.existsSync(fontPaths[key])) {
          this.logger.error(`Font file not found at: ${fontPaths[key]}`);
          throw new InternalServerErrorException(
            `Required font file is missing.`,
          );
        }
      }

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({
          layout: 'landscape', // A4 Landscape
          size: 'A4',
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        );

        // --- Register Custom Fonts ---
        doc.registerFont('Montserrat-Regular', fontPaths.montserratRegular);
        doc.registerFont('Montserrat-Medium', fontPaths.montserratMedium);
        doc.registerFont('Montserrat-SemiBold', fontPaths.montserratSemiBold);
        doc.registerFont('Montserrat-Bold', fontPaths.montserratBold);
        doc.registerFont('Playfair-Bold', fontPaths.playfairBold);

        // --- Start Building the Certificate ---

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // 1. Draw the light grey page background
        doc.rect(0, 0, pageWidth, pageHeight).fill('#f1f5f9');

        // 2. Define certificate dimensions and draw the container
        const boxMargin = 50;
        const boxWidth = pageWidth - boxMargin * 2;
        const boxHeight = pageHeight - boxMargin * 2;

        doc
          .roundedRect(boxMargin, boxMargin, boxWidth, boxHeight, 24)
          .fill('white');

        // 3. Draw the blue border
        doc
          .roundedRect(boxMargin, boxMargin, boxWidth, boxHeight, 24)
          .lineWidth(8)
          .stroke('#2563eb');

        // --- Certificate Content ---
        const contentWidth = boxWidth - 100; // Add some internal padding
        const contentX = boxMargin + 50;
        let currentY = 120; // Starting Y position for content

        // 4. Main Title
        doc
          .font('Playfair-Bold')
          .fontSize(42)
          .fillColor('#1d4ed8')
          .text('Certificate of Completion', contentX, currentY, {
            width: contentWidth,
            align: 'center',
          });
        currentY += 60;

        // 5. Subtitle
        doc
          .font('Montserrat-Medium')
          .fontSize(16)
          .fillColor('#64748b')
          .text(
            'This certificate is proudly presented to',
            contentX,
            currentY,
            { width: contentWidth, align: 'center' },
          );
        currentY += 40;

        // 6. Username
        doc
          .font('Montserrat-Bold')
          .fontSize(28)
          .fillColor('#1e293b')
          .text(data.username, contentX, currentY, {
            width: contentWidth,
            align: 'center',
          });
        currentY += 50;

        // 7. Completion Text
        doc
          .font('Montserrat-Regular')
          .fontSize(14)
          .fillColor('#475569')
          .text('for successfully completing the course', contentX, currentY, {
            width: contentWidth,
            align: 'center',
          });
        currentY += 25;

        // 8. Course Title
        doc
          .font('Playfair-Bold')
          .fontSize(22)
          .fillColor('#2563eb')
          .text(data.courseTitle, contentX, currentY, {
            width: contentWidth,
            align: 'center',
          });
        currentY += 35;

        // 9. Instructor Text
        const instructorText = `An intensive course taught by ${data.instructor}.`;
        doc
          .font('Montserrat-Regular')
          .fontSize(14)
          .fillColor('#334155')
          .text(instructorText, contentX, currentY, {
            width: contentWidth,
            align: 'center',
          });

        // --- Footer ---
        const footerY = pageHeight - 140;
        const footerContentY = footerY + 10;
        const signatureWidth = 250;
        const leftSignatureX = boxMargin + 80;
        const rightSignatureX = pageWidth - boxMargin - 80 - signatureWidth;

        // 10. Separator Line
        doc
          .moveTo(boxMargin + 60, footerY - 20)
          .lineTo(pageWidth - boxMargin - 60, footerY - 20)
          .lineWidth(2)
          .stroke('#e2e8f0');

        // 11. Left Signature Area (Instructor)
        doc
          .font('Playfair-Bold')
          .fontSize(16)
          .fillColor('#1e293b')
          .text(data.instructor, leftSignatureX, footerContentY, {
            width: signatureWidth,
            align: 'center',
          });
        doc
          .moveTo(leftSignatureX + 25, footerContentY + 25)
          .lineTo(leftSignatureX + signatureWidth - 25, footerContentY + 25)
          .lineWidth(1)
          .stroke('#94a3b8');
        doc
          .font('Montserrat-Medium')
          .fontSize(12)
          .fillColor('#64748b')
          .text('Instructor', leftSignatureX, footerContentY + 35, {
            width: signatureWidth,
            align: 'center',
          });

        // 12. Right Signature Area (Date)
        doc
          .font('Playfair-Bold')
          .fontSize(16)
          .fillColor('#1e293b')
          .text(data.completionDate, rightSignatureX, footerContentY, {
            width: signatureWidth,
            align: 'center',
          });
        doc
          .moveTo(rightSignatureX + 25, footerContentY + 25)
          .lineTo(rightSignatureX + signatureWidth - 25, footerContentY + 25)
          .lineWidth(1)
          .stroke('#94a3b8');
        doc
          .font('Montserrat-Medium')
          .fontSize(12)
          .fillColor('#64748b')
          .text('Date of Completion', rightSignatureX, footerContentY + 35, {
            width: signatureWidth,
            align: 'center',
          });

        // --- Finalize the PDF ---
        doc.end();
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error generating PDF with pdfkit: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }
}
