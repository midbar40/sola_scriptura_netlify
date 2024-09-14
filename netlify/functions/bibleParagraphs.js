// 전역변수
const express = require('express')
const BibleParagraph  = require('../models/BibleParagraph')
const expressAsyncHandler = require('express-async-handler')

const mongoose = require('mongoose')
const { Types : {ObjectId} } = mongoose

const router = express.Router()

// 성경구절 조회
router.get('/:category', expressAsyncHandler(async(req, res) => {
    console.log('성경구절 조회', req.params)
    try{
    const bibleParagraphs = await BibleParagraph.find({category: req.params.category})
    res.status(200).json({ code: 200, message: '성경구절조회 성공', bibleParagraphs})
    // console.log(bibles)
} catch(err){
    res.status(500).send()
}
}))


module.exports = router