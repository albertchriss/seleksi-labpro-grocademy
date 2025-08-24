import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as wkhtmltopdf from 'wkhtmltopdf';
import * as ejs from 'ejs';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePdfFromHtml(
    templateName: string,
    data: object,
  ): Promise<Buffer> {
    const templatePath = path.join(
      process.cwd(),
      'views', // Pastikan path ini benar setelah build
      'templates',
      templateName,
    );
    const templateString = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(templateString, data);

    try {
      // wkhtmltopdf menghasilkan Buffer secara langsung
      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const stream = wkhtmltopdf(html, {
          pageSize: 'A4',
          orientation: 'Landscape',
          disableSmartShrinking: true,
          zoom: 1,
          marginLeft: '0mm',
          marginRight: '0mm',
          marginTop: '0mm',
          marginBottom: '0mm',
        });

        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err) => reject(err));
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error generating PDF with wkhtmltopdf: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }
}
