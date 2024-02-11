const Category = require("../models/category");

module.exports = {
  category : async(req,res)=>{
    const cat = await Category.find();
    
    res.render("admin/category",{cat});
  },
  addCategory:(req,res)=>{
    res.render("admin/addcategory");
  },
  postAddCategory:async(req,res)=>{
    const userData = await Category.create(req.body);
    res.redirect('/admin/category')
  },
  deleteCategory:async(req,res)=>{
    let id = req.params.id;
    await Category.findByIdAndDelete(id);
    res.redirect('/admin/category');
  }
}

