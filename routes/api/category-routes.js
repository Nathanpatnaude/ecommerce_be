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
    const categoryNewIdExists = await Category.findByPk(req.body.id);
    const categoryIdExists = await Category.findByPk(req.params.id);
    console.log(req.body.id, "===", req.params.id);
    if (categoryNewIdExists === null || parseInt(req.body.id) === parseInt(req.params.id)) {
      await Category.update(req.body, {
        where: {
          id: req.params.id
        },
      })
        .then(async (updated) => {
          console.log(updated);
          if (req.body.id) {
            const catergoryUpdated = await Category.findByPk(req.body.id);
            res.status(200).json(catergoryUpdated);
          } else {
            const categoryUpdate = await Category.findByPk(req.params.id);
            res.status(200).json(categoryUpdate);
          }
        });
    } else if (categoryIdExists === null) {
      res.status(500).json('Category Id does not exist');
    } else {
      res.status(500).json('Category Id already exists')
    }
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
        res.status(200).json(`${categoryDestroy.dataValues.category_name} was removed from the database`);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
