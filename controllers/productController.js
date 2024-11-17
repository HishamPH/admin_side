const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Offer = require("../models/offerModel");
const Categories = require("../models/categoryModel");

module.exports = {
  getProduct: async (req, res) => {
    let pd = await Product.find().populate("Category");
    pd.forEach(async (item) => {
      if (item.stock === 0) item.Status = "Out of Stock";
      else item.Status = "In Stock";
    });

    res.render("admin/products", { activePage: "products", pd });
  },
  getAddProduct: async (req, res) => {
    const cat = await Category.find();
    res.render("admin/addproduct", { activePage: "products", cat });
  },
  postAddProduct: async (req, res) => {
    try {
      const {
        Category,
        ProductName,
        Description,
        spec1,
        spec2,
        spec3,
        Price,
        discount,
        stock,
        color,
        storage,
      } = req.body;
      const files = req.files;

      mapFilesToVariants(color, files, "color");
      mapFilesToVariants(storage, files, "storage");

      const hello = await Offer.find();

      const category = await Categories.findOne({ Name: req.body.Category });
      const categoryOffer = await Offer.findOne({ category: category._id });

      const product = await Product.create({
        ProductName,
        Description,
        spec1,
        spec2,
        spec3,
        Category: category._id,
        offer: categoryOffer._id || null,
        offerPrice: 1000,
        color: color,
        storage: storage,
        Status: "In Stock",
        Price: 34000,
      });

      return res.redirect("/admin/products");
    } catch (error) {
      console.log(error);
    }
  },
  blockProduct: async (req, res) => {
    let id = req.params.id;
    await Product.findByIdAndUpdate(id, [
      {
        $set: { Display: { $not: "$Display" } },
      },
    ]);
    res.redirect("/admin/products");
  },
  getEditProduct: async (req, res) => {
    let id = req.params.id;
    let pd = await Product.findById(id).populate("Category");
    res.render("admin/editproduct", { activePage: "products", pd });
    console.log(pd.Category);
  },
  postEditProduct: async (req, res) => {
    let id = req.params.id;
    const images = [];
    const pd = await Product.findById(id);
    let cat = pd.Category;
    const category = await Category.findOne({ Name: req.body.Category });
    const categoryOffer = await Offer.findOne({ category: cat });
    for (let i = 1; i <= 3; i++) {
      const fieldName = `image${i}`;
      if (req.files[fieldName] && req.files[fieldName][0]) {
        images.push(req.files[fieldName][0].filename);
      }
    }
    let insertImages = pd.images;
    if (images.length !== 0) {
      insertImages = images;
    }
    const Status = req.body.stock <= 0 ? "Out of Stock" : "In Stock";
    let amount = req.body.Price;
    let offerPrice;
    let discountPercentage = 0;
    if (categoryOffer) discountPercentage = categoryOffer.percentage;
    offerPrice =
      amount - amount * (discountPercentage / 100) - req.body.discount;
    console.log("offer price inside ADD NEW PRODUCT", offerPrice);
    await Product.findByIdAndUpdate(id, [
      {
        $set: {
          ProductName: req.body.ProductName,
          Price: Number(req.body.Price),
          Description: req.body.Description,
          stock: Number(req.body.stock),
          Status: Status,
          spec1: req.body.spec1,
          discount: Number(req.body.discount),
          offer: categoryOffer ? categoryOffer._id : null,
          offerPrice: Math.floor(offerPrice),
          images: insertImages,
        },
      },
    ]);
    res.redirect("/admin/products");
  },
};

// utils/mapFilesToVariants.js
function mapFilesToVariants(variants, files, type) {
  if (!Array.isArray(variants)) return;

  variants.forEach((variant, variantIndex) => {
    // Initialize the images array if not present
    variant.images = variant.images || [];

    (variant.imageNames || []).forEach((imageName, imageIndex) => {
      if (!imageName || imageName === "false") {
        variant.images[imageIndex] = null; // No file for this image
      } else {
        // Find the matching file from req.files
        const file = files.find((f) => f.fieldname === imageName);
        if (file) {
          variant.images[imageIndex] = file.filename; // Store the filename
        } else {
          console.warn(
            `No file found for ${type}[${variantIndex}][images][${imageIndex}]`
          );
        }
      }
    });

    // Remove the imageNames field (optional)
    delete variant.imageNames;
  });
}

//=========================================================

//  const images = [];
//  const category = await Category.findOne({ Name: req.body.Category });
//  const categoryOffer = await Offer.findOne({ category: category._id });
//  for (let i = 1; i <= 3; i++) {
//    const fieldName = `image${i}`;
//    if (req.files[fieldName] && req.files[fieldName][0]) {
//      images.push(req.files[fieldName][0].filename);
//    }
//  }
//  const Status = req.body.stock <= 0 ? "Out of Stock" : "In Stock";
//  let amount = req.body.Price;
//  let offerPrice;

//  const discountPercentage = categoryOffer?.percentage || 0;
//  offerPrice = amount - amount * (discountPercentage / 100) - req.body.discount;
//  console.log("offer price inside ADD NEW PRODUCT", offerPrice);

//  const newProduct = new Product({
//    ProductName: req.body.ProductName,
//    Price: req.body.Price,
//    Description: req.body.Description,
//    stock: req.body.stock,
//    Category: category._id,
//    Status: Status,
//    spec1: req.body.spec1,
//    discount: req.body.discount,
//    images: images,
//    offer: categoryOffer ? categoryOffer._id : null,
//    offerPrice: Math.floor(offerPrice),
//  });
//  await newProduct.save();
//  res.redirect("/admin/products");
