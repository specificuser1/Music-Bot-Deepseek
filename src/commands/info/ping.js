const { SlashCommandBuilder } = require('discord.js');
const EmbedManager = require('../../utils/embeds');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'info',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    async execute(interaction) {
        await interaction.deferReply();

        const sent = await interaction.editReply({ 
            content: 'Pinging...', 
            fetchReply: true 
        });

        const wsLatency = interaction.client.ws.ping;
        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;

        const status = wsLatency < 100 ? emojis.get('status', 'online') :
                       wsLatency < 200 ? emojis.get('status', 'idle') :
                       emojis.get('status', 'dnd');

        const embed = EmbedManager.info('Bot Latency Information', {
            fields: [
                {
                    name: `${emojis.get('misc', 'clock')} WebSocket`,
                    value: `\`${wsLatency}ms\``,
                    inline: true
                },
                {
                    name: `${emojis.get('misc', 'discord')} API`,
                    value: `\`${apiLatency}ms\``,
                    inline: true
                },
                {
                    name: `${emojis.get('status', 'online')} Status`,
                    value: `${status} ${wsLatency < 100 ? 'Excellent' : 
                                    wsLatency < 200 ? 'Good' : 'Poor'}`,
                    inline: true
                }
            ]
        });

        return interaction.editReply({ embeds: [embed] });
    }
};
