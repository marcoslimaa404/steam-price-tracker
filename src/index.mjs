
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.mjs'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(filePath);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Bot online como ${client.user.tag}`);
});

const dbPath = path.resolve('data/db.json');

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    const customId = interaction.customId;
    if (!customId.startsWith('add_')) return;

    const appId = customId.replace('add_', '');
    const userId = interaction.user.id;

    let db = {};
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    if (!db[userId]) db[userId] = [];

    if (db[userId].includes(appId)) {
      await interaction.reply({ content: 'Esse jogo já está na sua lista!', ephemeral: true });
      return;
    }

    db[userId].push(appId);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    await interaction.reply({ content: `Jogo com AppID ${appId} adicionado à sua lista!`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
