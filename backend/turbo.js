import { TurboFactory } from '@ardrive/turbo-sdk';
import fs from 'fs';
import fsPromises from "fs/promises";
import mime from 'mime-types';
import path from 'path';
import { Readable } from 'stream';

// Gets MIME types for each file to tag the upload
async function getContentType(filePath) {
    console.log(`Getting MIME type for: ${filePath}`);
    const mimeType = mime.lookup(filePath);
    console.log(`MIME type detected: ${mimeType}`);
    return mimeType;
}

export default async function deployFolder(folderPath) {
    console.log(`Starting deployment for folder: ${folderPath}`);
    
    // Load your JWK
    console.log('Attempting to load JWK...');
    const jwk = JSON.parse(await fsPromises.readFile("wallet.json", "utf-8"));
    console.log("JWK loaded successfully");
 
    console.log('Initializing Turbo instance...');
    const turbo = TurboFactory.authenticated({ privateKey: jwk });
    console.log('Turbo instance created');

    const deployFolder = folderPath;
    console.log(`Deploy folder set to: ${deployFolder}`);

    //Uses Arweave manifest version 0.2.0, which supports fallbacks
    console.log('Initializing manifest structure...');
    let newManifest = {
        manifest: 'arweave/paths',
        version: '0.2.0',
        index: { path: 'index.html' },
        fallback: {},
        paths: {},
    };
    console.log('Manifest structure initialized:', newManifest);

    async function processFiles(dir) {
        console.log(`\nProcessing directory: ${dir}`);
        const files = fs.readdirSync(dir);
        console.log(`Found ${files.length} files/directories in ${dir}`);

        for (const file of files) {
            try {
                const filePath = path.join(dir, file);
                const relativePath = path.relative(deployFolder, filePath);
                console.log(`\nProcessing: ${relativePath}`);

                if (fs.statSync(filePath).isDirectory()) {
                    console.log(`${relativePath} is a directory, processing recursively...`);
                    await processFiles(filePath);
                } else {
                    console.log(`Starting upload for file: ${relativePath}`);
                    try {
                        const fileSize = fs.statSync(filePath).size;
                        console.log(`File size: ${fileSize} bytes`);
                        
                        const contentType = await getContentType(filePath);
                        console.log(`Content type determined: ${contentType}`);
                        
                        console.log('Initiating upload to Turbo...');
                        const uploadResult = await turbo.uploadFile({
                            fileStreamFactory: () => fs.createReadStream(filePath),
                            fileSizeFactory: () => fileSize,
                            signal: AbortSignal.timeout(1000_000),
                            dataItemOpts: {
                                tags: [
                                    { name: 'Content-Type', value: contentType },
                                    { name: 'App-Name', value: 'ARlink' },
                                ],
                            },
                        });

                        console.log(`✅ Successfully uploaded ${relativePath}`);
                        console.log(`Transaction ID: ${uploadResult.id}`);
                        
                        // adds uploaded file txId to the new manifest json
                        newManifest.paths[relativePath] = { id: uploadResult.id };
                        console.log(`Added to manifest paths:`, newManifest.paths[relativePath]);

                        if (file === '404.html') {
                            console.log('404.html found, setting as manifest fallback');
                            newManifest.fallback.id = uploadResult.id;
                            console.log('Fallback ID set:', newManifest.fallback.id);
                        }
                    } catch (err) {
                        console.error(`❌ Error uploading file ${relativePath}:`);
                        console.error('Error details:', err);
                    }
                }
            } catch (err) {
                console.error('❌ CRITICAL ERROR:');
                console.error('Error details:', err);
            }
        }
    }
    
    async function uploadManifest(manifest) {
        console.log('\nPreparing to upload manifest...');
        try {
            const manifestString = JSON.stringify(manifest);
            console.log('Manifest content:', manifestString);
            console.log('Manifest size:', Buffer.byteLength(manifestString), 'bytes');
            
            console.log('Initiating manifest upload...');
            const uploadResult = await turbo.uploadFile({
                fileStreamFactory: () => Readable.from(Buffer.from(manifestString)),
                fileSizeFactory: () => Buffer.byteLength(manifestString),
                signal: AbortSignal.timeout(1000_000),
                dataItemOpts: {
                    tags: [
                        {
                            name: 'Content-Type',
                            value: 'application/x.arweave-manifest+json',
                        },
                        {
                            name: 'App-Name',
                            value: 'ARlink',
                        },
                    ],
                },
            });

            console.log('✅ Manifest uploaded successfully');
            return uploadResult.id;
            
        } catch (error) {
            console.error('❌ Error uploading manifest:');
            console.error('Error details:', error);
            return null;
        }
    }

    console.log('\nStarting file processing...');
    await processFiles(deployFolder);

    if (!newManifest.fallback.id) {
        console.log('No 404.html found, using index.html as fallback');
        newManifest.fallback.id = newManifest.paths['index.html'].id;
        console.log('Fallback ID set to:', newManifest.fallback.id);
    }

    console.log('\nFinal manifest structure:', newManifest);
    
    console.log('Uploading final manifest...');
    const manifestId = await uploadManifest(newManifest);
    if (manifestId) {
        console.log(`✅ Deployment complete! Manifest ID: ${manifestId}`);
        return manifestId;
    } else {
        console.log('❌ Deployment failed - manifest upload unsuccessful');
    }
}