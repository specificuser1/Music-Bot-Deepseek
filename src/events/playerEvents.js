const Logger = require('../utils/logger');
const EmbedManager = require('../utils/embeds');
const canvasManager = require('../utils/canvas');
const emojis = require('../utils/emojis');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'playerEvents',
    async execute(player) {
        
        // Track start event
        player.events.on('playerStart', async (queue, track) => {
            Logger.music(`Started playing: ${track.title}`);
            
            try {
                const channel = queue.metadata.channel;
                
                // Create canvas image
                const imageBuffer = await canvasManager.createNowPlayingImage(track);
                const attachment = new AttachmentBuilder(imageBuffer, { 
                    name: 'nowplaying.png' 
                });

                // Create control buttons
                const controls = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('control_pause')
                            .setEmoji('⏯️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('control_skip')
                            .setEmoji('⏭️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('control_stop')
                            .setEmoji('⏹️')
                            .setStyle(ButtonStyle.Danger),
                    );

                const embed = EmbedManager.nowPlaying(track, queue);
                
                await channel.send({
                    content: `${emojis.get('music', 'play')} **Now Playing**`,
                    embeds: [embed],
                    files: [attachment],
                    components: [controls]
                });
            } catch (error) {
                Logger.error('Error in playerStart event:', error);
            }
        });

        // Queue end event
        player.events.on('emptyQueue', async (queue) => {
            Logger.music('Queue ended');
            
            try {
                const channel = queue.metadata.channel;
                await channel.send({
                    embeds: [EmbedManager.warning(
                        'Queue is empty! Add more songs with `/play`'
                    )]
                });
            } catch (error) {
                Logger.error('Error in emptyQueue event:', error);
            }
        });

        // Error event
        player.events.on('playerError', (queue, error) => {
            Logger.error(`Player error in ${queue.guild.name}:`, error);
        });

        // Connection error
        player.events.on('connectionError', (queue, error) => {
            Logger.error(`Connection error in ${queue.guild.name}:`, error);
        });

        // Track add event
        player.events.on('audioTrackAdd', (queue, track) => {
            Logger.music(`Track added: ${track.title}`);
        });

        // Tracks add event
        player.events.on('audioTracksAdd', (queue, tracks) => {
            Logger.music(`Added ${tracks.length} tracks to queue`);
        });

        // Disconnect event
        player.events.on('disconnect', (queue) => {
            Logger.music(`Disconnected from ${queue.guild.name}`);
        });
    }
};
