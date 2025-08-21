import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer'; // Import Browser type
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
      'views',
      'templates',
      templateName,
    );
    const templateString = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(templateString, data);

    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      });
      return Buffer.from(pdfBuffer);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error generating PDF: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Could not generate PDF');
    } finally {
      // Ensure the browser is closed even if an error occurred
      if (browser) {
        await browser.close();
      }
    }
  }
}
