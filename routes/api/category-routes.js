const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    await Category.findAll({
      include: [{ 
        model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"]
      }]
    })
    .then((categoryData) => {
      res.status(200).json(categoryData);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    await Category.findByPk(req.params.id, {
      attributes: ["id", "category_name"],
      include: [{
        model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"],
      }],
    }).then((categoryData) => {
      res.status(200).json(categoryData);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    await Category.create(req.body)
    .then((categoryNew) => {
      res.status(200).json(categoryNew)
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
try {
  await Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then(categoryUpdate => Category.findByPk(req.params.id))
  .then((categoryUpdate) => res.status(200).json(categoryUpdate));
} catch (err) {
  res.status(500).json(err);
}
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryDestroy = Category.findByPk(req.params.id);
    await Category.destroy({
      where: {
        id: req.params.id,
      },
    })
    .then(() => {
      res.status(200).json(`${categoryDestroy} was removed from the database`);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
