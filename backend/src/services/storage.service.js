import 'dotenv/config'
import  ImageKit, { toFile } from '@imagekit/nodejs';

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadFile = async (fileBuffer,originalName,subfolder)=>{
    const response = await client.files.upload({
  file :await toFile( fileBuffer,originalName),
  fileName: `${Date.now()}_${originalName}`,
  folder : `spotify/${subfolder}`
});
return response
}

export default uploadFile