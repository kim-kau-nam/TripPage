const express = require('express');
const Course = require('../../models/course');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const courses = await Course.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({courses: courses.docs, page: courses.page, pages: courses.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate('author');
  res.json(course);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var course = new Course({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await course.save();
  res.json(course)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next({status: 404, msg: 'Not exist course'});
  }
  if (course.author && course.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  course.title = req.body.title;
  course.content = req.body.content;
  course.tags = req.body.tags;
  await course.save();
  res.json(course);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next({status: 404, msg: 'Not exist course'});
  }
  if (course.author && course.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  await Course.findOneAndRemove({_id: req.params.id});
  res.json({msg: 'deleted'});
}));


module.exports = router;