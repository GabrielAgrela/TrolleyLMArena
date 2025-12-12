
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const imagesDir = path.join(process.cwd(), 'public', 'problem-images');
const files = ['one-cousin.png', 'second-cousins.png', 'one-trolley.png', 'three-trolleys.png'];

files.forEach(file => {
    const filePath = path.join(imagesDir, file);
    if (fs.existsSync(filePath)) {
        fs.createReadStream(filePath)
            .pipe(new PNG())
            .on('parsed', function () {
                console.log(`${file}: Has alpha? ${this.alpha}`);
                // Check if any pixel actually has transparency
                let hasTransparentPixel = false;
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const idx = (this.width * y + x) << 2;
                        if (this.data[idx + 3] < 255) {
                            hasTransparentPixel = true;
                            break;
                        }
                    }
                    if (hasTransparentPixel) break;
                }
                console.log(`${file}: Has transparent pixels? ${hasTransparentPixel}`);
            })
            .on('error', (err) => console.error(`${file}: Error - ${err.message}`));
    } else {
        console.log(`${file}: Not found`);
    }
});
