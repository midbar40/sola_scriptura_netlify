const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const PrayDiary = require('../src/models/PrayDiary')
const User = require('../src/models/User')
const expressAsyncHandler = require('express-async-handler')


const { Types: { ObjectId }} = mongoose


// 기도일기 저장
router.post('/saveDiary', expressAsyncHandler(async(req, res, next)=>{
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            const prayDiary = new PrayDiary({
                title: req.body.title,
                detail: req.body.detail,
                author: user._id
            })
            return prayDiary.save()
        } else {
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
        })
    .then(result =>{
        console.log('기도일기 저장 성공', result)
        res.json({
            code: 200,
            message: '기도일기 저장 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도일기 저장 실패',
            err
        })
    })    
}))

// 기도일기 조회
router.post('/getDiary', expressAsyncHandler(async(req, res, next)=>{
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            PrayDiary.find({author: user._id})
            .then(result =>{
                console.log('기도일기 조회 성공', result)
                res.json({
                    code: 200,
                    message: '기도일기 조회 성공',
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
            message: '기도일기 조회 실패',
            err
        })
    })
}))

// 기도일기 특정일기 상세조회
router.post('/getDiaryDetail', expressAsyncHandler(async(req, res, next)=>{
    console.log('_id 리퀘바디id:', req.body._id)
    PrayDiary.findOne({_id : req.body._id}) 
    .then(result =>{
        console.log('기도일기 상세조회 성공', result)
        res.json({
            code: 200,
            message: '기도일기 상세조회 성공',
            result
        })
    })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도일기 상세조회 실패',
            err
        })
    })
}))

// 기도일기 수정
router.put('/editDiary', expressAsyncHandler(async(req, res, next)=>{
    console.log('기도일기 수정', req.body)
            PrayDiary.findOneAndUpdate( 
                {_id: req.body._id},
                {
                    title : req.body.title,
                    detail: req.body.detail,
                    lastModifiedAt: req.body.lastModifiedAt
                },
                {new: true})
            .then(result =>{
                console.log('기도일기 수정 성공', result)
                res.json({
                    code: 200,
                    message: '기도일기 수정 성공',
                    result
                })
            })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도일기 수정 실패',
            err
        })
    })
}))

// 기도일기 삭제
router.delete('/deleteDiary', expressAsyncHandler(async(req, res, next)=>{
            PrayDiary.findOneAndDelete({_id: req.body._id})
            .then(result =>{
                console.log('기도일기 삭제 성공', result)
                res.json({
                    code: 200,
                    message: '기도일기 삭제 성공',
                    result
                })
            })
    .catch(err =>{
        res.json({
            code: 500,
            message: '기도일기 삭제 실패',
            err
        })
    })
}))

module.exports = router
