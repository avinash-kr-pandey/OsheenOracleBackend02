import Home from '../models/home.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/home/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'home-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('image');

// ============ PUBLIC CONTROLLERS ============
export const getHomeData = async (req, res) => {
    try {
        const homeData = await Home.getHomeData();
        res.status(200).json({
            success: true,
            data: homeData
        });
    } catch (error) {
        console.error('Error fetching home data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching home data',
            error: error.message
        });
    }
};

// ============ ADMIN CONTROLLERS ============

export const updateHeroSection = async (req, res) => {
    try {
        const { title, subtitle, ctaText, ctaLink } = req.body;
        const homeData = await Home.getHomeData();
        
        if (title !== undefined) homeData.heroSection.title = title;
        if (subtitle !== undefined) homeData.heroSection.subtitle = subtitle;
        if (ctaText !== undefined) homeData.heroSection.ctaButton.text = ctaText;
        if (ctaLink !== undefined) homeData.heroSection.ctaButton.link = ctaLink;
        
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "Hero section updated successfully",
            data: homeData.heroSection
        });
    } catch (error) {
        console.error('Error updating hero section:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const uploadHeroImage = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No image file uploaded"
                });
            }
            
            const homeData = await Home.getHomeData();
            
            if (homeData.heroSection.backgroundImage) {
                const oldImagePath = path.join(__dirname, '..', homeData.heroSection.backgroundImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            const imageUrl = '/uploads/home/' + req.file.filename;
            homeData.heroSection.backgroundImage = imageUrl;
            await homeData.save();
            
            res.status(200).json({
                success: true,
                message: "Hero image uploaded successfully",
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error('Error uploading hero image:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
};

export const updateAboutSection = async (req, res) => {
    try {
        const { title, content } = req.body;
        const homeData = await Home.getHomeData();
        
        if (title !== undefined) homeData.aboutSection.title = title;
        if (content !== undefined) homeData.aboutSection.content = content;
        
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "About section updated successfully",
            data: homeData.aboutSection
        });
    } catch (error) {
        console.error('Error updating about section:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const uploadAboutImage = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No image file uploaded"
                });
            }
            
            const homeData = await Home.getHomeData();
            
            if (homeData.aboutSection.image) {
                const oldImagePath = path.join(__dirname, '..', homeData.aboutSection.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            const imageUrl = '/uploads/home/' + req.file.filename;
            homeData.aboutSection.image = imageUrl;
            await homeData.save();
            
            res.status(200).json({
                success: true,
                message: "About image uploaded successfully",
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error('Error uploading about image:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
};

export const updateServices = async (req, res) => {
    try {
        const { title, services } = req.body;
        const homeData = await Home.getHomeData();
        
        if (title !== undefined) homeData.servicesSection.title = title;
        if (services !== undefined) {
            homeData.servicesSection.services = typeof services === 'string' 
                ? JSON.parse(services) 
                : services;
        }
        
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "Services updated successfully",
            data: homeData.servicesSection
        });
    } catch (error) {
        console.error('Error updating services:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addGalleryImage = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No image file uploaded"
                });
            }
            
            const { caption } = req.body;
            const homeData = await Home.getHomeData();
            const imageUrl = '/uploads/home/' + req.file.filename;
            
            homeData.gallerySection.images.push({
                url: imageUrl,
                caption: caption || "",
                order: homeData.gallerySection.images.length
            });
            
            await homeData.save();
            
            res.status(200).json({
                success: true,
                message: "Gallery image added successfully",
                data: homeData.gallerySection.images
            });
        } catch (error) {
            console.error('Error adding gallery image:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
};

export const deleteGalleryImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const homeData = await Home.getHomeData();
        
        const imageIndex = homeData.gallerySection.images.findIndex(img => img._id.toString() === imageId);
        
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }
        
        const imagePath = path.join(__dirname, '..', homeData.gallerySection.images[imageIndex].url);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        homeData.gallerySection.images.splice(imageIndex, 1);
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "Gallery image deleted successfully",
            data: homeData.gallerySection.images
        });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateContactSection = async (req, res) => {
    try {
        const { title, address, phone, email, mapEmbed } = req.body;
        const homeData = await Home.getHomeData();
        
        if (title !== undefined) homeData.contactSection.title = title;
        if (address !== undefined) homeData.contactSection.address = address;
        if (phone !== undefined) homeData.contactSection.phone = phone;
        if (email !== undefined) homeData.contactSection.email = email;
        if (mapEmbed !== undefined) homeData.contactSection.mapEmbed = mapEmbed;
        
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "Contact section updated successfully",
            data: homeData.contactSection
        });
    } catch (error) {
        console.error('Error updating contact section:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateMetaTags = async (req, res) => {
    try {
        const { title, description, keywords } = req.body;
        const homeData = await Home.getHomeData();
        
        if (title !== undefined) homeData.metaTags.title = title;
        if (description !== undefined) homeData.metaTags.description = description;
        if (keywords !== undefined) {
            homeData.metaTags.keywords = typeof keywords === 'string' 
                ? keywords.split(',').map(k => k.trim()) 
                : keywords;
        }
        
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "Meta tags updated successfully",
            data: homeData.metaTags
        });
    } catch (error) {
        console.error('Error updating meta tags:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateFooterSection = async (req, res) => {
    try {
        const { copyright, socialLinks } = req.body;
        const homeData = await Home.getHomeData();
        
        if (copyright !== undefined) homeData.footerSection.copyright = copyright;
        if (socialLinks !== undefined) {
            homeData.footerSection.socialLinks = typeof socialLinks === 'string' 
                ? JSON.parse(socialLinks) 
                : socialLinks;
        }
        
        await homeData.save();
        
        res.status(200).json({
            success: true,
            message: "Footer section updated successfully",
            data: homeData.footerSection
        });
    } catch (error) {
        console.error('Error updating footer section:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllHomeData = async (req, res) => {
    try {
        const homeData = await Home.getHomeData();
        res.status(200).json({
            success: true,
            data: homeData
        });
    } catch (error) {
        console.error('Error fetching all home data:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};