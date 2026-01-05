import { Controller, Get, Post, Query, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('auth-url')
  getAuthUrl() {
    const authUrl = this.calendarService.getAuthUrl();
    return { success: true, authUrl };
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string) {
    if (!code) {
      return '<html><body><h2>Error: No code</h2></body></html>';
    }
    
    const tokens = await this.calendarService.getTokens(code);
    
    return `
      <html>
        <body>
          <h2> Success!</h2>
          <script>
            chrome.runtime.sendMessage('YOUR_EXTENSION_ID_HERE', {
              type: 'GOOGLE_AUTH_SUCCESS',
              accessToken: '${tokens.access_token}',
              refreshToken: '${tokens.refresh_token}'
            });
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `;
  }

  @Post('sync')
  async syncAllEvents(@Body('accessToken') accessToken: string) {
    const result = await this.calendarService.syncEvents(accessToken);
    return {
      success: true,
      message: `Synced ${result.synced} events`,
      ...result,
    };
  }
}