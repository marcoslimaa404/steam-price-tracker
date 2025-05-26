import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheFilePath = path.join(__dirname, '../../data/eventCache.json');

export async function checkForNewEvent(client) {
  try {
    const response = await fetch('https://steamdb.info/sales/history/');
    const html = await response.text();
    console.log(html);
    const $ = cheerio.load(html);

    const firstEvent = $('div#main .container > .row > .col-lg-9 .sales:nth-of-type(1) .card').first();

    const title = firstEvent.find('.card-header h5').text().trim();
    const dateRange = firstEvent.find('.card-header small').text().trim();
    const [startDate, endDate] = dateRange.split(' – ').map(date => date.trim());
    const imageUrl = firstEvent.find('img').attr('src') || null;
    const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const newEvent = { id, title, startDate, endDate, imageUrl };

    let savedEvent = null;
    try {
      const savedData = await fs.readFile(cacheFilePath, 'utf-8');
      savedEvent = JSON.parse(savedData);
    } catch {}

    if (!savedEvent || savedEvent.id !== newEvent.id) {
      await fs.writeFile(cacheFilePath, JSON.stringify(newEvent, null, 2), 'utf-8');

      const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
      if (channel && channel.isTextBased()) {
        await channel.send(`Novo evento detectado: **${title}**
Início: ${startDate}
Fim: ${endDate}${imageUrl ? `
${imageUrl}` : ''}`);
      }
    }
  } catch (error) {
    console.error('Erro no scraper:', error);
  }
}
