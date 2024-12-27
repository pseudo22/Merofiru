import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

import dotenv from 'dotenv'
dotenv.config({
    path : './.env'
})

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

        console.log('uploaded successfully' , res.secure_url);
        return res.url
    } catch (error) {
        fs.unlinkSync(localFilepath)
        console.log(error)
        return null
    }
}

export {uploadOnCloudinary}