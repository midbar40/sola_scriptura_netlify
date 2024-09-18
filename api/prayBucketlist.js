const express = require('express')
const PrayBucketlist = require('../src/models/PrayBucketlist')
const User = require('../src/models/User')
const expressAsyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

const router = express.Router()

const { Types : {ObjectId} } = mongoose

// 기도버킷리스트 저장
router.post('/saveBucket', expressAsyncHandler(async(req, res, next)=> {
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            const prayBucketlist = new PrayBucketlist({
                detail: req.body.detail,
                author: user._id,
                finishedAt: req.body.finishedAt,
            })
            return prayBucketlist.save()
        } else{
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
    })
    .then(result =>{
        console.log('기도버킷리스트 저장 성공', result)
        res.json({
            code: 200,
            message: '기도버킷리스트 저장 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도버킷리스트 저장 실패',
            err
        })
    })
}))
   

// 기도버킷리스트 조회
router.post('/getBucket', expressAsyncHandler(async(req, res, next)=>{
    console.log('기도버킷리스트 조회', req.body)
    User.findOne({email: req.body.email})
    .then(user => {
        if(user){
            PrayBucketlist.find({author: user._id})
            .then(result =>{
                console.log('기도버킷리스트 조회 성공', result)
                res.json({
                    code: 200,
                    message: '기도버킷리스트 조회 성공',
                    result
                })
            })
            .catch(err =>{
                res.json({
                    code: 500,
                    message: '기도버킷리스트 조회 실패',
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

router.get('/:id', expressAsyncHandler(async(req, res, next)=>{
    res.json('특정 기도제목 조회')
}))

// 기도버킷리스트 내용 수정
router.put('/edit', expressAsyncHandler(async(req, res, next)=>{
    PrayBucketlist.findOneAndUpdate(
        {_id: req.body._id},
        {
            detail: req.body.detail,
            lastModifiedAt: req.body.lastModifiedAt
        },
        {new: true}
    )
    .then(result =>{
        console.log('기도제목 수정 성공', result)
        res.json({
            code: 200,
            message: '기도제목 수정 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도제목 수정 실패',
            err
        })
    })
}))

// 체크박스 클릭시 응답부분 날짜 업데이트
router.put('/checked', expressAsyncHandler(async(req, res, next)=>{
    PrayBucketlist.findOneAndUpdate(
        {_id: req.body._id},
        {
        isDone: req.body.isDone,
        finishedAt: req.body.finishedAt
       },
       { new: true }
       )
         .then(result =>{
              console.log('응답날짜 수정 성공', result)
              res.json({
                code: 200,
                message: '응답날짜 수정 성공',
                result
              })
         })
            .catch(err =>{
                res.json({
                    code: 500,
                    message: '응답날짜 수정 실패',
                    err
                })
            })
}))

// 기도버킷리스트 삭제
router.delete('/', expressAsyncHandler(async(req, res, next)=>{
    console.log('기도제목 삭제', req.body._id, req.body)
    PrayBucketlist.findOneAndDelete({_id: req.body._id})
    .then(result =>{
        console.log('기도제목 삭제 성공', result)
        res.json({
            code: 200,
            message: '기도제목 삭제 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도제목 삭제 실패',
            err
        })
    })
}))

module.exports = router