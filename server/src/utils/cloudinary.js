import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    })

const uploadOnCloudinary = async (localFilepath) => {
    try {
        if (!localFilepath) return null
        const res = await cloudinary.uploader.upload(localFilepath , {
            resource_type : 'auto'
        }) //file uploaded

        console.log('uploaded successfully' , res.url);
        return res
    } catch (error) {
        fs.unlinkSync(localFilepath) //remove temp file because failed
        return null
    }
}

export {uploadOnCloudinary}