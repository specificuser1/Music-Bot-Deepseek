const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const EmbedManager = require('../../utils/embeds');
const emojis = require('../../utils/emojis');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' },
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.client.player;
        const queue = player.nodes.get(interaction.guildId);
        const mode = interaction.options.getString('mode');

        if (!queue || !queue.node.isPlaying()) {
            return interaction.editReply({
                embeds: [EmbedManager.error('No music is currently playing!')]
            });
        }

        const modeMap = {
            off: QueueRepeatMode.OFF,
            track: QueueRepeatMode.TRACK,
            queue: QueueRepeatMode.QUEUE,
        };

        const repeatMode = modeMap[mode];
        const success = queue.setRepeatMode(repeatMode);

        if (!success) {
            return interaction.editReply({
                embeds: [EmbedManager.error('Failed to set loop mode!')]
            });
        }

        const modeMessages = {
            off: 'Loop disabled',
            track: '🔂 Looping current track',
            queue: '🔁 Looping queue',
        };

        return interaction.editReply({
            embeds: [EmbedManager.success(modeMessages[mode])]
        });
    }
};
