const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const EmbedManager = require('../../utils/embeds');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View the music queue')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number')
                .setMinValue(1)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);
        const page = interaction.options.getInteger('page') || 1;

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error(
                    'No music is currently playing!',
                    { footer: 'Use /play to start music' }
                )]
            });
        }

        if (!queue.tracks.data.length) {
            return interaction.editReply({
                embeds: [EmbedManager.warning(
                    'Queue is empty! Add songs with /play'
                )]
            });
        }

        const totalPages = Math.ceil(queue.tracks.data.length / 10);
        
        if (page > totalPages) {
            return interaction.editReply({
                embeds: [EmbedManager.error(
                    `Invalid page! There are only ${totalPages} pages.`
                )]
            });
        }

        const embed = EmbedManager.queue(queue, page);

        // Queue navigation buttons
        if (totalPages > 1) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('queue_prev')
                        .setLabel('◀️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId('queue_next')
                        .setLabel('Next ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages),
                );

            return interaction.editReply({
                embeds: [embed],
                components: [row]
            });
        }

        return interaction.editReply({ embeds: [embed] });
    }
};
