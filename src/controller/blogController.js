const { default: mongoose } = require("mongoose")
const authorModel = require("../model/authorModel")
const blogModel = require("../model/blogModel")

/*### POST /blogs
- Create a blog document from request body. Get authorId in request body only.
- Make sure the authorId is a valid authorId by checking the author exist in the authors collection.
- Return HTTP status 201 on a succesful blog creation. Also return the blog document. The response should be a JSON object like [this](#successful-response-structure) 
- Create atleast 5 blogs for each author

- Return HTTP status 400 for an invalid request with a response body like [this](#error-response-structure)
*/

const validdetails=function(details){
    return /^[a-zA-Z,'.\s]{0,150}$/.test(details)
}
const createBlog = async function (req, res) {
    try {
        let data = req.body
        let authorId = req.body.authorId
        if (!data.title) { return res.status(400).send({ status: false, msg: "title name is required" }) }
        if (!data.body) { return res.status(400).send({ status: false, msg: "body name is required" }) }
        if (!data.authorId) { return res.status(400).send({ status: false, msg: "authorId name is required" }) }
        if (!data.category) { return res.status(400).send({ status: false, msg: "category name is required" }) }
        if (authorId) {
            if(!mongoose.isValidObjectId(authorId)){return res.status(400).send({ status: false, msg: "authorId is not in format"})}
            else {
                if (!await authorModel.findById(authorId)) {
                    return res.status(400).send({ status: false, msg: "Author id is not valid" })
                }
            }
        }
        if(data.isPublished){if(typeof(data.isPublished)!== 'boolean'){
            return res.status(400).send({status:false , msg : "isPublished should be in Boolean"})
        }}
        if(data.isPublished==true){
            data.publishedAt=Date()
        }
        // if(data.isDeleted){if(typeof(data.isDeleted)!== 'boolean'){
        //     return res.status(400).send({status:false , msg : "isPublished should be in Boolean"})
        // }}
        
        
        if(!validdetails(data.title) ){return res.status(400).send({status:false,msg:"title should be in string "})}
        if(!validdetails(data.body) ){return res.status(400).send({status:false,msg:"body should be in string "})}
        if(!validdetails(data.category) ){return res.status(400).send({status:false,msg:"category should be in string "})}
        if(data.tags){
        if(!validdetails(data.tags.toString()) ){return res.status(400).send({status:false,msg:"tags should be in string "})}
        }
        if(data.subcategory){
        if(!validdetails(data.subcategory.toString()) ){return res.status(400).send({status:false,msg:"subcategory should be in string "})}
        }
        let record = await blogModel.create(data)
        res.status(201).send({ status: true, data: record })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

/*
### GET /blogs
- Returns all blogs in the collection that aren't deleted and are published
- Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
- If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) 
- Filter blogs list by applying filters. Query param can have any combination of below filters.
  - By author Id
  - By category
  - List of blogs that have a specific tag
  - List of blogs that have a specific subcategory
example of a query url: blogs?filtername=filtervalue&f2=fv2
*/

const getBlog = async function (req, res) {
    try {
        let obj = { isDeleted: false, isPublished: true }
        //- By author Id
        let authorId = req.query.authorId
        let category = req.query.category
        let tags = req.query.tags
        let subcategory = req.query.subcategory
        if (authorId) {
            if(!mongoose.isValidObjectId(authorId)){return res.status(400).send({ status: false, msg: "authorId is not in format"})}
            else {
                if (!await authorModel.findById(authorId)) {
                    return res.status(400).send({ status: false, msg: "Author is with this id not in database" })
                }
            }
        }
        // //Filter blogs list by applying filters
        if (authorId) { obj.authorId = authorId }//
        if (category) { obj.category = category }
        if (tags) { obj.tags = tags }
        if (subcategory) { obj.subcategory = subcategory }//

        let saveData = await blogModel.find(obj)
        if (saveData.length == 0) {
            return res.status(404).send({ status: false, msg: "No document found with this filter" })
        }
        return res.status(200).send({ status: true, data: saveData })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }
}



// ### PUT /blogs/:blogId
// - Updates a blog by changing the its title, body, adding tags, adding a subcategory. (Assuming tag and subcategory received in body is need to be added)
// - Updates a blog by changing its publish status i.e. adds publishedAt date and set published to true
// - Check if the blogId exists (must have isDeleted false). If it doesn't, return an HTTP status 404 with a response body like [this](#error-response-structure)
// - Return an HTTP status 200 if updated successfully with a body like [this](#successful-response-structure) 
// - Also make sure in the response you return the updated blog document. 


const updateBlog = async function (req, res) {
    try {
        let data = req.body
        let blogId = req.params.blogId

        if (!blogId) { return res.status(400).send({ status: false, msg: "blogid is required" }) }

        if(!mongoose.isValidObjectId(blogId)){return res.status(400).send({ status: false, msg: "blogId is not in format"})}

        let findBlog = await blogModel.findById(blogId)
        if (!findBlog) { return res.status(404).send({ status: false, msg: "Invalid BlogId" }) }

        if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, msg: "please enter blog details in body for updating" }) }

        if (findBlog.isDeleted) { return res.status(404).send({ status: false, msg: "blogs already deleted" }) }

        let obj = {}
        let obj2 = {}

        let title = req.body.title
        let body = req.body.body
        let category = req.body.category
        let tags = req.body.tags
        let subcategory = req.body.subcategory
        let isPublished=req.body.isPublished
        let isDeleted=req.body.isDeleted

        if (title) { obj.title = title }
        if (body) { obj.body = body }
        if (category) { obj.category = category }
        if (tags) { obj2.tags = tags }
        if (subcategory) { obj2.subcategory = subcategory }
        if(isDeleted){
            obj.isDeleted=true
            obj.deletedAt=new Date()
        }
        else{
            obj.isDeleted=false
            obj.deletedAt=null
        }

        if(isPublished){
        obj.publishedAt = new Date(),
            obj.isPublished = true
        }
        else{
            obj.isPublished=false
            obj.publishedAt =null
        }

        let updatedBlog = await blogModel.findOneAndUpdate({ _id:blogId }, {
            $set: obj,
            $push: obj2
        }, { new: true, upsert: true })
        return res.status(200).send({ status: true, data: updatedBlog })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
};


// ### DELETE /blogs/:blogId
// - Check if the blogId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
// - If the blog document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure) 


const deleteBlogByPath = async function (req, res) {
    try {
        let blogId = req.params.blogId

    
        if(!mongoose.isValidObjectId(blogId)){return res.status(400).send({ status: false, msg: "blogId is not in format"})}

        let blogVerify = await blogModel.findById(blogId)
        if (!blogVerify) {
            return res.status(404).send({ status: false, msg: "Invalid blog id" })
        }
        if (blogVerify.isDeleted) {
            return res.status(404).send({ status: false, msg: "already deleted" })
        }

        let record = await blogModel.updateOne({ _id: blogId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        res.status(200).send()
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}


// ### DELETE /blogs?queryParams
// - Delete blog documents by category, authorid, tag name, subcategory name, unpublished
// - If the blog document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure)


const deleteBlogByQuery = async function (req, res) {
    try {
        
        // let authorId = req.query.authorId
        // let category = req.query.category
        // let tags = req.query.tags
        // let subcategory = req.query.subcategory
        // let isPublished = req.query.isPublished //unPublished => isPublished = false

        // let obj = {}
        // if (category) { obj.category = category }
        // if (authorId) { obj.authorId = authorId }
        // if (tags) { obj.tags = tags }
        // if (subcategory) { obj.subcategory = subcategory }
        // //if(req.query.isPublished){
        // if(isPublished ===false || isPublished===true){ obj.isPublished = isPublished }
        // // else{
        // //     obj.isPublished=isPublished
        // // }
        // //}

        let obj = req.query
        obj["isDeleted"] = false
        let findblogs = await blogModel.find(obj).select({ _id: 1 })
        if(findblogs.length ==0){return res.status(404).send({ status: false, msg: "No data found" })}
        for (let i in findblogs){
            let deletedocument = await blogModel.updateOne( {_id : findblogs[i]._id}, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        }
            res.status(200).send()
        // let deleted = await blogModel.findOne(obj ).select({ isDeleted: 1, _id: 0 })
        // if (deleted.isDeleted) { return res.status(404).send({ status: false, msg: "Document already deleted" }) }
        // if (Object.keys(obj).length == 0) { return res.status(400).send({ status: false, msg: "No document is enter in filter" }) }
        
    }
    catch (err) {
        res.status(500).status({ status: false, msg: err.message })
    }

  }


module.exports = {createBlog , getBlog , updateBlog, deleteBlogByPath, deleteBlogByQuery}