const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');

module.exports = {
    category: 'info',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),

    async execute(interaction) {
        await interaction.deferReply();

        const commands = interaction.client.commands;
        const embed = EmbedManager.help(commands);

        return interaction.editReply({ embeds: [embed] });
    }
};
