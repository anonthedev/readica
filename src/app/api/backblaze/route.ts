import formidable from "formidable";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import BackblazeB2 from "backblaze-b2";
import { Readable } from "stream";
import { IncomingMessage } from "http";

const b2 = new BackblazeB2({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID as string,
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY as string,
});

async function parseFormData(req: NextRequest) {
  const form = formidable({
    maxFileSize: 15 * 1024 * 1024,
  });

  const bodyArray = await req.arrayBuffer();
  const bodyStream = new Readable();
  bodyStream.push(Buffer.from(bodyArray));
  bodyStream.push(null);

  const mockReq = Object.assign(bodyStream, {
    headers: Object.fromEntries(req.headers),
  });

  return new Promise((resolve, reject) => {
    form.parse(mockReq as IncomingMessage, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("file_id");
  if (!fileId) {
    return NextResponse.json({ error: "No fileId provided" }, { status: 400 });
  }

  try {
    await b2.authorize();

    const fileInfo = await b2.getFileInfo({ fileId });

    const { data: authData } = await b2.getDownloadAuthorization({
      bucketId: process.env.BACKBLAZE_BUCKET_ID as string,
      fileNamePrefix: fileInfo.data.fileName,
      validDurationInSeconds: 3600,
    });

    const fileUrl = `${process.env.BACKBLAZE_DOWNLOAD_URL}/file/${process.env.BACKBLAZE_BUCKET_NAME}/${fileInfo.data.fileName}?Authorization=${authData.authorizationToken}`;

    return NextResponse.json(
      {
        ...fileInfo.data,
        downloadUrl: fileUrl, // this is the actual download URL
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("B2 GET Error:", error);
    return NextResponse.json({ error: "Error fetching file" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { files } = (await parseFormData(req)) as any;
    const file = files.file?.[0];

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.mimetype !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const fileBuffer = await fs.promises.readFile(file.filepath);

    await b2.authorize();

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_BUCKET_ID as string,
    });

    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: file.originalFilename || "uploaded-file.pdf",
      data: fileBuffer,
      mime: "application/pdf",
    });

    fs.unlinkSync(file.filepath);

    return NextResponse.json({
      message: "File uploaded successfully",
      fileId: uploadResponse.data.fileId,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "No fileId provided" });
  }

  await b2.authorize();

  try {
    const fileInfo = await b2.getFileInfo({
      fileId: fileId,
    });
    const deletedFile = await b2.deleteFileVersion({
      fileId: fileId,
      fileName: fileInfo.data.fileName,
    });

    return NextResponse.json({
      message: "File deleted successfully",
      file: deletedFile,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error deleting file",
    });
  }
}
