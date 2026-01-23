import QRCode from 'qrcode';

/**
 * Generate QR code from authentication hash
 * @param {string} serialCode - The serial code of the product item
 * @param {string} authHash - The SHA256 authentication hash
 * @returns {Promise<string>} QR code as data URL (PNG)
 */
export const generateQRCode = async (serialCode, authHash) => {
    try {
        // QR content: serial code and hash combined for verification
        const qrContent = `${serialCode}#${authHash}`;
        
        // Generate QR code as data URL (PNG image)
        const qrDataUrl = await QRCode.toDataURL(qrContent, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Generate QR code as PNG buffer
 * @param {string} serialCode - The serial code of the product item
 * @param {string} authHash - The SHA256 authentication hash
 * @returns {Promise<Buffer>} QR code as PNG buffer
 */
export const generateQRCodeBuffer = async (serialCode, authHash) => {
    try {
        const qrContent = `${serialCode}#${authHash}`;
        
        const qrBuffer = await QRCode.toBuffer(qrContent, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            width: 300
        });

        return qrBuffer;
    } catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Generate QR code as SVG string
 * @param {string} serialCode - The serial code of the product item
 * @param {string} authHash - The SHA256 authentication hash
 * @returns {Promise<string>} QR code as SVG string
 */
export const generateQRCodeSVG = async (serialCode, authHash) => {
    try {
        const qrContent = `${serialCode}#${authHash}`;
        
        const qrSvg = await QRCode.toString(qrContent, {
            errorCorrectionLevel: 'H',
            type: 'svg',
            quality: 0.95,
            margin: 1,
            width: 300
        });

        return qrSvg;
    } catch (error) {
        console.error('Error generating QR code SVG:', error);
        throw new Error('Failed to generate QR code');
    }
};
