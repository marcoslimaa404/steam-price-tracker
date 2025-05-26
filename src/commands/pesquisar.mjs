import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('pesquisar')
  .setDescription('Pesquisar um jogo na Steam');

export async function execute(interaction) {
  await interaction.reply('Funcionalidade de pesquisa ainda não implementada.');
}
