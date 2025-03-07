// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postControllers = require('../controllers/postControllers');

// GET all posts
router.get('/', postControllers.getAllPosts);

// GET posts by category ID
router.get('/category/:categoryId', postControllers.getPostsByCategoryId);

// GET post by ID
router.get('/:id', postControllers.getPostById);

// CREATE a new post
router.post('/', postControllers.createPost);

// UPDATE an existing post
router.put('/:id', postControllers.updatePost);

// DELETE a post
router.delete('/:id', postControllers.deletePost);

module.exports = router;
