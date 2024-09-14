const express = require('express');
const router = express.Router();
const { Types: { ObjectId } } = require('mongoose')
const PickPost = require('../models/PickPost')
const User = require('../models/User')
const expressAsyncHandler = require('express-async-handler')

// pickPost1 가져오기
router.post('/post1', expressAsyncHandler(async (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => { 
        if (user) {
            PickPost.find({ author: user._id, label: 'post1' })
            .then(result => {
                console.log('pickPost1 가져오기 성공', result)
                res.json({
                    code: 200,
                    message: 'pickPost1 가져오기 성공',
                    result
                })
            })
            .catch(err => {
                console.log('pickPost1 가져오기 실패', err)
                res.json({
                    code: 500,
                    message: 'pickPost1 가져오기 실패',
                    err
                })
            })
        }
        else {
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
    })
    .catch(err => {
        res.json({
            code: 500,
            message: '유저가 존재하지 않습니다.',
            err
        })
    })
}))

// pickPost2 가져오기
router.post('/post2', expressAsyncHandler(async (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => { 
        if (user) {
            PickPost.find({ author: user._id, label: 'post2' })
            .then(result => {
                console.log('pickPost2 가져오기 성공', result)
                res.json({
                    code: 200,
                    message: 'pickPost2 가져오기 성공',
                    result
                })
            })
            .catch(err => {
                console.log('pickPost2 가져오기 실패', err)
                res.json({
                    code: 500,
                    message: 'pickPost2 가져오기 실패',
                    err
                })
            })
        }
        else {
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
    })
    .catch(err => {
        res.json({
            code: 500,
            message: '유저가 존재하지 않습니다.',
            err
        })
    })
}))

// pickPost3 가져오기
router.post('/post3', expressAsyncHandler(async (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => { 
        if (user) {
            PickPost.find({ author: user._id, label: 'post3' })
            .then(result => {
                console.log('pickPost3 가져오기 성공', result)
                res.json({
                    code: 200,
                    message: 'pickPost3 가져오기 성공',
                    result
                })
            })
            .catch(err => {
                console.log('pickPost3 가져오기 실패', err)
                res.json({
                    code: 500,
                    message: 'pickPost3 가져오기 실패',
                    err
                })
            })
        }
        else {
            res.json({
                code: 400,
                message: '유저가 존재하지 않습니다.'
            })
        }
    })
    .catch(err => {
        res.json({
            code: 500,
            message: '유저가 존재하지 않습니다.',
            err
        })
    })
}))

// pickPost1 저장하기
router.post('/savePost1', expressAsyncHandler(async (req, res, next) => {
    console.log('req.body.email', req.body.email)

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                const savePickPost1 = new PickPost({
                    author: user._id,
                    label: req.body.label,
                    text: req.body.text
                })
                return savePickPost1.save()
            }
            else {
                res.json({
                    code: 400,
                    message: '유저가 존재하지 않습니다.'
                })
            }
        })

        .then(result => {
            console.log('pickPost1 저장 성공', result)
            res.json({
                code: 200,
                message: 'pickPost1 저장 성공',
                result
            })
        })
        .catch(err => {
            console.log('pickPost1 저장 실패', err)
            res.json({
                code: 500,
                message: 'pickPost1 저장 실패',
                err
            })
        })
}))
// pickPost2 저장하기
router.post('/savePost2', expressAsyncHandler(async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                const savePickPost2 = new PickPost({
                    author: user._id,
                    label: req.body.label,
                    text: req.body.text
                })
                return savePickPost2.save()
            } else {
                res.json({
                    code: 400,
                    message: '유저가 존재하지 않습니다.'
                })
            }
        })
        .then(result => {
            console.log('pickPost2 저장 성공', result)
            res.json({
                code: 200,
                message: 'pickPost2 저장 성공',
                result
            })
        })
        .catch(err => {
            console.log('pickPost2 저장 실패', err)
            res.json({
                code: 500,
                message: 'pickPost2 저장 실패',
                err
            })
        })
}))
// pickPost3 저장하기
router.post('/savePost3', expressAsyncHandler(async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                const savePickPost3 = new PickPost({
                    author: user._id,
                    label: req.body.label,
                    text: req.body.text
                })
                return savePickPost3.save()
            } else {
                res.json({
                    code: 400,
                    message: '유저가 존재하지 않습니다.'
                })
            }
        })
        .then(result => {
            console.log('pickPost3 저장 성공', result)
            res.json({
                code: 200,
                message: 'pickPost3 저장 성공',
                result
            })
        })
        .catch(err => {
            console.log('pickPost3 저장 실패', err)
            res.json({
                code: 500,
                message: 'pickPost3 저장 실패',
                err
            })
        })
}))
// pickPost1 수정하기
router.put('/updatePost1', expressAsyncHandler(async (req, res, next) => {
    const editPickPost1 = await PickPost.findOneAndUpdate(
        { label: 'post1' },
        { text: req.body.text }
    )
    try {
        res.json({
            code: 200,
            message: 'pickPost1 수정 성공',
            editPickPost1
        })
    }
    catch {
        res.json({
            code: 500,
            message: 'pickPost1 수정 실패',
            err
        })
    }
}))
// pickPost2 수정하기
router.put('/updatePost2', expressAsyncHandler(async (req, res, next) => {
    const editPickPost2 = await PickPost.findOneAndUpdate(
        { label: 'post2' },
        { text: req.body.text }
    )
    try {
        res.json({
            code: 200,
            message: 'pickPost2 수정 성공',
            editPickPost2
        })
    }
    catch {
        res.json({
            code: 500,
            message: 'pickPost2 수정 실패',
            err
        })
    }
}))
// pickPost3 수정하기
router.put('/updatePost3', expressAsyncHandler(async (req, res, next) => {
    const editPickPost3 = await PickPost.findOneAndUpdate(
        { label: 'post3' },
        { text: req.body.text }
    )
    try {
        res.json({
            code: 200,
            message: 'pickPost3 수정 성공',
            editPickPost3
        })
    }
    catch {
        res.json({
            code: 500,
            message: 'pickPost3 수정 실패',
            err
        })
    }
}))

module.exports = router;