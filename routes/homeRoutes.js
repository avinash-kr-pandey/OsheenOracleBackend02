import express from 'express';
import * as homeController from '../controllers/homeController.js';

const router = express.Router();

// All routes are public - No auth middleware anywhere
router.get('/', homeController.getHomeData);
router.put('/hero', homeController.updateHeroSection);
router.post('/hero/image', homeController.uploadHeroImage);
router.put('/about', homeController.updateAboutSection);
router.post('/about/image', homeController.uploadAboutImage);
router.put('/services', homeController.updateServices);
router.post('/gallery', homeController.addGalleryImage);
router.delete('/gallery/:imageId', homeController.deleteGalleryImage);
router.put('/contact', homeController.updateContactSection);
router.put('/seo', homeController.updateMetaTags);
router.put('/footer', homeController.updateFooterSection);

export default router;