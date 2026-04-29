const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

class CanvasManager {
    constructor() {
        this.width = 800;
        this.height = 400;
    }

    /**
     * Create now playing image
     * @param {Object} track - Track information
     * @returns {Buffer} Image buffer
     */
    async createNowPlayingImage(track) {
        try {
            const canvas = createCanvas(this.width, this.height);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, '#2b2d31');
            gradient.addColorStop(1, '#1a1b1e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);

            // Load and draw thumbnail
            if (track.thumbnail) {
                const thumbnail = await loadImage(track.thumbnail);
                
                // Thumbnail with rounded corners
                ctx.save();
                const thumbX = 50;
                const thumbY = 50;
                const thumbSize = 300;
                
                // Create rounded rectangle clip
                this.roundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 20);
                ctx.clip();
                ctx.drawImage(thumbnail, thumbX, thumbY, thumbSize, thumbSize);
                ctx.restore();
            }

            // Song title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            const title = this.truncateText(ctx, track.title || 'Unknown', 400);
            ctx.fillText(title, 400, 80);

            // Artist
            ctx.fillStyle = '#b9bbbe';
            ctx.font = '20px Arial';
            const artist = this.truncateText(ctx, track.author || 'Unknown Artist', 400);
            ctx.fillText(`by ${artist}`, 400, 120);

            // Source/Platform
            ctx.fillStyle = '#57F287';
            ctx.font = '16px Arial';
            ctx.fillText(`🎵 ${track.source || 'Unknown'}`, 400, 160);

            // Duration
            ctx.fillStyle = '#b9bbbe';
            ctx.font = '16px Arial';
            ctx.fillText(`⏱️ ${track.duration || '00:00'}`, 400, 195);

            // Requested by
            ctx.fillStyle = '#b9bbbe';
            ctx.font = '16px Arial';
            ctx.fillText(`👤 ${track.requestedBy?.tag || 'Unknown'}`, 400, 225);

            // Progress bar background
            const progressBarY = 320;
            const progressBarWidth = 700;
            const progressBarHeight = 6;
            
            ctx.fillStyle = '#4f545c';
            this.roundRect(ctx, 50, progressBarY, progressBarWidth, progressBarHeight, 3);
            ctx.fill();

            // Progress bar fill
            const progress = (track.position || 0) / (track.durationMS || 1);
            const progressFill = progressBarWidth * Math.min(Math.max(progress, 0), 1);
            
            if (progressFill > 0) {
                const progressGradient = ctx.createLinearGradient(50, 0, 50 + progressFill, 0);
                progressGradient.addColorStop(0, '#5865F2');
                progressGradient.addColorStop(1, '#57F287');
                ctx.fillStyle = progressGradient;
                this.roundRect(ctx, 50, progressBarY, progressFill, progressBarHeight, 3);
                ctx.fill();
            }

            // Music note decoration
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.font = '200px Arial';
            ctx.fillText('🎵', 550, 380);

            // Footer text
            ctx.fillStyle = '#72767d';
            ctx.font = '14px Arial';
            ctx.fillText('Music Bot • Powered by Discord Player', 50, 380);

            return canvas.toBuffer('image/png');
        } catch (error) {
            console.error('[CANVAS ERROR]', error);
            throw error;
        }
    }

    /**
     * Create queue image
     * @param {Array} tracks - Queue tracks
     * @param {number} page - Page number
     * @returns {Buffer} Image buffer
     */
    async createQueueImage(tracks, page = 1) {
        try {
            const itemsPerPage = 5;
            const height = 200 + (itemsPerPage * 60);
            const canvas = createCanvas(this.width, height);
            const ctx = canvas.getContext('2d');

            // Background
            const gradient = ctx.createLinearGradient(0, 0, this.width, height);
            gradient.addColorStop(0, '#2b2d31');
            gradient.addColorStop(1, '#1a1b1e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, height);

            // Header
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('📋 Queue List', 50, 50);

            // Track count
            ctx.fillStyle = '#b9bbbe';
            ctx.font = '16px Arial';
            ctx.fillText(`Page ${page} • ${tracks.length} tracks`, 50, 80);

            // Draw tracks
            const start = (page - 1) * itemsPerPage;
            const pageTracks = tracks.slice(start, start + itemsPerPage);

            for (let i = 0; i < pageTracks.length; i++) {
                const track = pageTracks[i];
                const y = 130 + (i * 60);

                // Track number
                ctx.fillStyle = '#5865F2';
                ctx.font = 'bold 18px Arial';
                ctx.fillText(`${start + i + 1}.`, 50, y);

                // Track info
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                const trackTitle = this.truncateText(ctx, track.title, 500);
                ctx.fillText(trackTitle, 90, y);

                // Duration
                ctx.fillStyle = '#b9bbbe';
                ctx.font = '14px Arial';
                ctx.fillText(track.duration || '00:00', 650, y);
            }

            // Footer
            ctx.fillStyle = '#72767d';
            ctx.font = '14px Arial';
            ctx.fillText('Music Bot • Queue View', 50, height - 30);

            return canvas.toBuffer('image/png');
        } catch (error) {
            console.error('[CANVAS ERROR]', error);
            throw error;
        }
    }

    /**
     * Draw rounded rectangle
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {number} radius 
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Truncate text to fit width
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} text 
     * @param {number} maxWidth 
     * @returns {string}
     */
    truncateText(ctx, text, maxWidth) {
        let width = ctx.measureText(text).width;
        let truncated = text;

        if (width <= maxWidth) return truncated;

        while (width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
            width = ctx.measureText(truncated + '...').width;
        }

        return truncated + '...';
    }
}

module.exports = new CanvasManager();
