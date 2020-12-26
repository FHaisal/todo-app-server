const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Todo = require('../models/Todo');

router.get('/', auth, async (req, res) => {
  try {
    await res.json(await Todo.find({ user: req.user.id }).sort({ created: -1 }));
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server error');
  }
});

router.post(
  '/',
  [
    auth,
    [
      check('todo', 'Todo required!').exists({ checkNull: true, checkFalsy: true })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { todo } = req.body;

    try {
      const newTodo = new Todo({
        user: req.user.id,
        title: todo
      });

      await res.json(await newTodo.save());
    } catch (e) {
      console.error(e.message);
      res.status(500).send('Server error');
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !todo)
      return res.status(404).json({ msg: 'To-do not found' });

    if (todo.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not authorised' });

    await todo.remove();

    await res.json({ msg: 'To-do removed' });
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
