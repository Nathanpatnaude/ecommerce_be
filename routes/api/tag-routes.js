const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    await Tag.findAll({
      include: [
        {
          model: Product,
          attributes: ["id", "product_name", "price", "stock", "category_id"],
          through: "ProductTag",
        }
      ]
    })
    .then((tagAll) => {
      res.status(200).json(tagAll);
    });
  } catch {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    await Tag.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          attributes: ["id", "product_name", "price", "stock", "category_id"],
          through: "ProductTag",
        }
      ]
    })
    .then((tagOne) => {
      res.status(200).json(tagOne);
    })
  } catch {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    await Tag.create(req.body)
    .then((tagNew) => {
      res.status(200).json(tagNew);
    });
  } catch {
    res.status(500).json(err);
  }
  // create a new tag
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  try {
  } catch {
    res.status(500).json(err);
  }
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  try {
  } catch {
    res.status(500).json(err);
  }
});

module.exports = router;
