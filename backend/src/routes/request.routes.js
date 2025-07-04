const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { validateRequest, validatePagination } = require('../middleware/validation');

// Execute HTTP request
router.post('/execute', validateRequest, requestController.executeRequest);

// Get request history with pagination
router.get('/history', validatePagination, requestController.getHistory);

// Get specific request by ID
router.get('/history/:id', requestController.getRequestById);

// Delete request from history
router.delete('/history/:id', requestController.deleteRequest);

// Update request (name, description, favorite status)
router.patch('/history/:id', requestController.updateRequest);

// Get collections
router.get('/collections', requestController.getCollections);

// Get requests by collection
router.get('/collections/:collection', validatePagination, requestController.getRequestsByCollection);

// Get favorite requests
router.get('/favorites', validatePagination, requestController.getFavorites);

// Search requests
router.get('/search', validatePagination, requestController.searchRequests);

// Get request statistics
router.get('/stats', requestController.getStats);

// Export requests
router.get('/export', requestController.exportRequests);

// Bulk operations
router.post('/bulk/delete', requestController.bulkDelete);
router.post('/bulk/favorite', requestController.bulkFavorite);

module.exports = router;