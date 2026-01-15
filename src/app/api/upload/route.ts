import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // We need to convert buffer to base64 string for cloudinary upload if we use the same method as before
        // OR we can use upload_stream.
        // The previous implementation used dataURI: `data:${req.file.mimetype};base64,${fileBase64}`

        const fileBase64 = buffer.toString('base64');
        const mimeType = file.type;
        const dataURI = `data:${mimeType};base64,${fileBase64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
        });

        return NextResponse.json({ url: result.secure_url }, { status: 200 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
