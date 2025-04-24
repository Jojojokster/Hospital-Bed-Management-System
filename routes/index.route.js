const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('index', { currentPage: 'index' });
});

module.exports = router;