const express = require('express');
const Course = require('../../models/course'); 
const Answer = require('../../models/answer'); 
const LikeLog = require('../../models/like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/courses', require('./courses'));

// Like for Course
router.post('/courses/:id/like', catchErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next({status: 404, msg: 'Not exist course'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, course: course._id});
  if (!likeLog) {
    course.numLikes++;
    await Promise.all([
      course.save(),
      LikeLog.create({author: req.user._id, course: course._id})
    ]);
  }
  return res.json(course);
}));

// Like for Answer
router.post('/answers/:id/like', catchErrors(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);
  answer.numLikes++;
  await answer.save();
  return res.json(answer);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;
