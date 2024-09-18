const express = require('express');
const router = express.Router();
const Grace = require('../src/models/Grace')
const User = require('../src/models/User')
const expressAsyncHandler = require('express-async-handler')


// 감사기도 조회
router.post('/getGrace', expressAsyncHandler(async(req, res, next)=>{
    console.log('감사기도 조회', req.body)
    User.findOne({email: req.body.email})
    .then(user => {
        if(user){
            Grace.find({author: user._id})
            .then(result =>{
                console.log('감사기도 조회 성공', result)
                res.json({
                    code: 200,
                    message: '감사기도 조회 성공',
                    result
                })
            })
            .catch(err =>{
                res.json({
                    code: 500,
                    message: '감사기도 조회 실패',
                    err
                })
            })
        }
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '유저가 존재하지 않습니다.',
            err
        })
    })
}))

// 감사기도 저장
router.post('/saveGrace', expressAsyncHandler(async(req, res, next)=> {
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            const grace = new Grace({
                detail: req.body.detail,
                author: user._id
            })
            return grace.save()
        } else{
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
    })
    .then(result =>{
        console.log('감사기도 저장 성공', result)
        res.json({
            code: 200,
            message: '감사기도 저장 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '감사기도 저장 실패',
            err
        })
    })
}))

// 감사기도 내용수정
router.put('/edit', expressAsyncHandler(async(req, res, next)=>{
    Grace.findOneAndUpdate(
        {_id: req.body._id},
        {
            detail: req.body.detail,
            lastModifiedAt: req.body.lastModifiedAt
        },
        {new: true}
    )
    .then(result =>{
        console.log('감사기도 수정 성공', result)
        res.json({
            code: 200,
            message: '감사기도 수정 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '감사기도 수정 실패',
            err
        })
    })
}))

// 감사기도 삭제
router.delete('/', expressAsyncHandler(async(req, res, next)=>{
    console.log('감사기도 삭제', req.body._id, req.body)
    Grace.findOneAndDelete({_id: req.body._id})
    .then(result =>{
        console.log('감사기도 삭제 성공', result)
        res.json({
            code: 200,
            message: '감사기도 삭제 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '감사기도 삭제 실패',
            err
        })
    })
}))

module.exports = router