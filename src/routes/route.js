const express = require('express');
const router = express.Router();
const authorController = require('../controller/authorController')
const blogController = require('../controller/blogController')
const {authentication,authorization}=require("../middleware/auth")

router.post('/authors',authorController.createAuthor)

router.post('/login' , authorController.login)

router.post('/blogs',authentication, blogController.createBlog)

router.get('/blogs', authentication, blogController.getBlog)

router.put('/blogs/:blogId' , authentication,authorization, blogController.updateBlog)

router.delete('/blogs/:blogId', authentication,authorization, blogController.deleteBlogByPath)

router.delete('/blogs',authentication,authorization, blogController.deleteBlogByQuery)



module.exports = router;