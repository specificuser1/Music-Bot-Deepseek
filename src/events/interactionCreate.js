const { Events } = require('discord.js');
const Logger = require('../utils/logger');
const EmbedManager = require('../utils/embeds');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    Logger.warn(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                Logger.command(interaction.user, interaction.commandName);

                try {
                    await command.execute(interaction);
                } catch (error) {
                    Logger.error(`Error executing ${interaction.commandName}:`, error);
                    
                    const errorEmbed = EmbedManager.error(
                        'There was an error while executing this command!',
                        { footer: 'Please try again later' }
                    );

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ 
                            embeds: [errorEmbed], 
                            ephemeral: true 
                        });
                    } else {
                        await interaction.reply({ 
                            embeds: [errorEmbed], 
                            ephemeral: true 
                        });
                    }
                }
            }

            // Handle button interactions
            if (interaction.isButton()) {
                const { customId } = interaction;
                
                // Queue navigation buttons
                if (customId.startsWith('queue_')) {
                    const player = interaction.client.player;
                    const queue = player.nodes.get(interaction.guildId);
                    
                    if (!queue) {
                        return interaction.reply({
                            embeds: [EmbedManager.error('No queue found!')],
                            ephemeral: true
                        });
                    }

                    const action = customId.split('_')[1];
                    let page = parseInt(interaction.message.embeds[0].footer?.text?.match(/\d+/)?.[0]) || 1;
                    
                    if (action === 'prev') page = Math.max(1, page - 1);
                    if (action === 'next') {
                        const totalPages = Math.ceil(queue.tracks.data.length / 10);
                        page = Math.min(totalPages, page + 1);
                    }

                    const queueEmbed = EmbedManager.queue(queue, page);
                    await interaction.update({ embeds: [queueEmbed] });
                }

                // Music control buttons
                if (customId.startsWith('control_')) {
                    const player = interaction.client.player;
                    const queue = player.nodes.get(interaction.guildId);
                    
                    if (!queue) {
                        return interaction.reply({
                            embeds: [EmbedManager.error('No active queue!')],
                            ephemeral: true
                        });
                    }

                    const action = customId.split('_')[1];
                    
                    switch(action) {
                        case 'pause':
                            const paused = queue.node.setPaused(!queue.node.isPaused());
                            await interaction.reply({
                                embeds: [EmbedManager.success(
                                    paused ? '⏸️ Music paused!' : '▶️ Music resumed!'
                                )],
                                ephemeral: true
                            });
                            break;
                            
                        case 'skip':
                            const skipped = queue.node.skip();
                            await interaction.reply({
                                embeds: [EmbedManager.success('⏭️ Skipped to next track!')],
                                ephemeral: true
                            });
                            break;
                            
                        case 'stop':
                            queue.delete();
                            await interaction.reply({
                                embeds: [EmbedManager.success('⏹️ Stopped music and cleared queue!')],
                                ephemeral: true
                            });
                            break;
                    }
                }
            }
        } catch (error) {
            Logger.error('Interaction error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    embeds: [EmbedManager.error('An unexpected error occurred!')],
                    ephemeral: true
                });
            }
        }
    }
};
