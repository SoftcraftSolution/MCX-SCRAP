const express = require('express');
const router = express.Router();
const mcxcontroller=require('../controller/mcx.controller')

router.get('/mcx',mcxcontroller.getMcxData)


module.exports = router;
