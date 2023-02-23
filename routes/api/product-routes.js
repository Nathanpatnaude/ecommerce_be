const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    await Product.findAll({
      // attributes: ["id", "product_name", "price", "stock", "category_id"],
      include: [
        {
          model: Tag,
          attributes: ["id", "tag_name"],
          through: "ProductTag",
        },
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
      ],
    })
      .then((productAll) => {
        res.status(200).json(productAll);
      });
  } catch (err) {
    res.status(500).json(err);
  }

});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    Product.findByPk(req.params.id, {
      // attributes: ["id", "product_name", "price", "stock", "category_id"],
      include: [
        {
          model: Tag,
          attributes: ["id", "tag_name"],
          through: "ProductTag",
        },
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
      ],
    })
      .then((productOne) => {
        res.status(200).json(productOne);
      })
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  // variable to return the .json(new Product)
  var newProduct;
  Product.create(req.body)
    .then(async (product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model

      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        await ProductTag.bulkCreate(productTagIdArr);
        // assigns Full data for new Product
        newProduct = await Product.findByPk(product.dataValues.id, {
          attributes: ["id", "product_name", "price", "stock", "category_id"],
          include: [
            {
              model: Tag,
              attributes: ["id", "tag_name"],
              through: "ProductTag",
            },
            {
              model: Category,
              attributes: ["id", "category_name"],
            },
          ],
        })
      }
      res.status(200).json(newProduct);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  // update product data

  // create an id to access row after update if updating id
  var newIdTarget
  if (req.body.id) {
    newIdTarget = parseInt(req.body.id);
  } else {
    newIdTarget = parseInt(req.params.id);
  }
  const productNewIdExists = await Product.findByPk(req.body.id);
  const productIdExists = await Product.findByPk(req.params.id);
  // Can update Id if the body.id === null or if the body.id is the same as the product Id
  if (productNewIdExists === null || parseInt(req.body.id) === parseInt(req.params.id)) {


    Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        // find all associated tags from ProductTag
        return ProductTag.findAll({ where: { product_id: newIdTarget } });
      })
      .then((productTags) => {
        // get list of current tag_ids
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        // create filtered list of new tag_ids
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: newIdTarget,
              tag_id,
            };
          });
        // figure out which ones to remove
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);

        // run both actions
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      })
      .then(async (updated) => {
        // returns the updated json even if the id changes
        const productUpdated = await Product.findByPk(newIdTarget, {
          include: [
            {
              model: Tag,
              attributes: ["id", "tag_name"],
              through: "ProductTag",
            },
            {
              model: Category,
              attributes: ["id", "category_name"],
            },
          ],
        });
        res.json(productUpdated)
      })
      .catch((err) => {
        // console.log(err);
        res.status(400).json(err);
      });
  } else if (productIdExists === null) {
    res.status(500).json('Product Id does not exist');
  } else {
    res.status(500).json('Product Id already exists')
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productDestroy = await Product.findByPk(req.params.id);
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then(() => {
        res.status(200).json(`${productDestroy.dataValues.product_name} was removed from the database`);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
