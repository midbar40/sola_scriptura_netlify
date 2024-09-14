import connectDb from './dbConnect'
import BibleParagraph from '../models/BibleParagraph'
import mongoose from 'mongoose'

const { Types: { ObjectId } } = mongoose

export const handler = async (event, context) => {
    await connectDb()
    const { category } = event.path.split('/').pop(); // 마지막 경로 파라미터를 추출
    console.log('category :', category)
    try {
        const bibleParagraphs = await BibleParagraph.find({ category: req.params.category })
        return new Response.json({ code: 200, message: '성경구절조회 성공', bibleParagraphs })
    } catch (error) {
        res.status(500).send()
    }
};

