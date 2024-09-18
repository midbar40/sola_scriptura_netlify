const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Sermon = require('../src/models/Sermon')
const User = require('../src/models/User')
const expressAsyncHandler = require('express-async-handler')


const { Types: { ObjectId }} = mongoose


// 설교노트 저장
router.post('/saveSermon', expressAsyncHandler(async(req, res, next)=>{
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            const sermon = new Sermon({
                date: req.body.date,
                scripture : req.body.scripture,
                preacher : req.body.preacher,
                title: req.body.title,
                content: req.body.content,
                takeaway: req.body.takeaway,
                author: user._id
            })
            return sermon.save()
        } else {
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
        })
    .then(result =>{
        console.log('설교 저장 성공', result)
        res.json({
            code: 200,
            message: '설교노트 저장 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '설교노트 저장 실패',
            err
        })
    })    
}))

// 설교노트 조회
router.post('/getSermon', expressAsyncHandler(async(req, res, next)=>{
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            Sermon.find({author: user._id})
            .then(result =>{
                console.log('설교노트 조회 성공', result)
                res.json({
                    code: 200,
                    message: '설교노트 조회 성공',
                    result
                })
            })
        } else {
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '설교노트 조회 실패',
            err
        })
    })
}))

// 설교노트 특정설교 상세조회
router.post('/getSermonDetail', expressAsyncHandler(async(req, res, next)=>{
    console.log('_id 리퀘바디id:', req.body._id)
    Sermon.findOne({_id : req.body._id}) 
    .then(result =>{
        console.log('설교노트 상세조회 성공', result)
        res.json({
            code: 200,
            message: '설교노트 상세조회 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '설교노트 상세조회 실패',
            err
        })
    })
}))

// 설교노트 수정
router.put('/editSermon', expressAsyncHandler(async(req, res, next)=>{
    console.log('설교노트 수정', req.body)
            Sermon.findOneAndUpdate( 
                {_id: req.body._id},
                {
                    date: req.body.date,
                    scripture : req.body.scripture,
                    preacher : req.body.preacher,
                    title: req.body.title,
                    content: req.body.content,
                    takeaway: req.body.takeaway,
                    lastModifiedAt: Date.now()
                },
                {new: true})
            .then(result =>{
                console.log('설교노트 수정 성공', result)
                res.json({
                    code: 200,
                    message: '설교노트 수정 성공',
                    result
                })
            })
    .catch(err =>{
        res.json({
            code: 500,
            message: '설교노트 수정 실패',
            err
        })
    })
}))

// 설교노트 삭제
router.delete('/deleteSermon', expressAsyncHandler(async(req, res, next)=>{
            Sermon.findOneAndDelete({_id: req.body._id})
            .then(result =>{
                console.log('설교노트 삭제 성공', result)
                res.json({
                    code: 200,
                    message: '설교노트 삭제 성공',
                    result
                })
            })
    .catch(err =>{
        res.json({
            code: 500,
            message: '설교노트 삭제 실패',
            err
        })
    })
}))

module.exports = router
