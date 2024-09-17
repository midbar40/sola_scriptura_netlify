// 전역변수
const express = require('express')
const Bible  = require('../models/Bible')
const expressAsyncHandler = require('express-async-handler')

const router = express.Router()

// 성경전문조회
router.get('/', expressAsyncHandler(async(req, res) => {
    try{
    const bibles = await Bible.find()
    res.status(200).json({ code: 200, message: '성경조회 성공', bibles})
    // console.log(bibles)
} catch(err){
    res.status(500).send()
}
}))

// 성경전문검색
router.get('/search', expressAsyncHandler(async (req, res) => {
    const words = req.query.query.split(/\s+/).filter(word => word.trim() !== '');
    console.log('리퀘쿼리', words)
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = 20; // 페이지당 아이템 수
  
      const skipItems = (page - 1) * perPage;
  
      const bibles = await Bible.find({ content: { $all: words.map(word => new RegExp(word, 'i')) } })
        .sort({ book:1, chapter:1, verse: 1})
        .skip(skipItems)
        .limit(perPage);
      res.status(200).json({ code: 200, message: '성경검색 성공', bibles });
    } catch (err) {
      res.status(500).send();
    }
  }));


// 성경 랜덤조회
router.get('/random', expressAsyncHandler(async(req, res) => {
    try{
        const bibles = await Bible.aggregate([{$sample: {size: 1}}])
        console.log('조회결과 :',bibles)
        res.status(200).json({ code: 200, message: '성경조회 성공', bibles})
    } catch(err){
        res.status(500).send()
    }
}))

// 성경클릭한 성서만 조회
router.get('/read', expressAsyncHandler(async(req, res) => {
    console.log('리퀘쿼리', req.query)
    try{
        const bible = await Bible.find({ book: req.query.query }).sort({ verse: 1, chapter:1})
        res.status(200).json({ code: 200, message: '성서본문조회성공', bible})
    } catch(err){
        res.status(500).send()
    }
}))

// 시편조회
router.get('/psalms', expressAsyncHandler(async(req, res)=> {
    // 전체 리스트
try{
    const { title } = req.query
    // console.log(title)
    const psalms = await Bible.find({title: "시편"}).sort({ verse: 1 })
    res.status(200).json({code:200, message: '시편조회 성공', psalms})
}catch(err){
    res.status(500).send()
    console.log(err)
}

})) 

module.exports = router