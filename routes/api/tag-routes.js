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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    await Tag.create(req.body)
      .then((tagNew) => {
        res.status(200).json(tagNew);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tagNewIdExists = await Tag.findByPk(req.body.id);
    const tagIdExists = await Tag.findByPk(req.params.id);
    // Can update Id if the body.id === null or if the body.id is the same as the tag Id
    if (tagNewIdExists === null || parseInt(req.body.id) === parseInt(req.params.id)) {
      await Tag.update(req.body, {
        where: {
          id: req.params.id
        },
      })
        .then(async (updated) => {
           // returns the updated json even if the id changes
          if (req.body.id) {
            const tagUpdated = await Tag.findByPk(req.body.id);
            res.status(200).json(tagUpdated);
          } else {
            const tagUpdate = await Tag.findByPk(req.params.id);
            res.status(200).json(tagUpdate);
          }
        });
    } else if (tagIdExists === null) {
      res.status(500).json('Tag Id does not exist');
    } else {
      res.status(500).json('Tag Id already exists')
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagDestroy = await Tag.findByPk(req.params.id);
    console.log(tagDestroy);
    await Tag.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then(() => {
        res.status(200).json(`${tagDestroy.dataValues.tag_name} was removed from the database`);
      })
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
