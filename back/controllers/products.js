import util from 'util'
import products from '../models/products.js'

export const createProduct = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式錯誤' })
    return
  }
  try {
    const result = await products.create(req.body)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getProducts = async (req, res) => {
  try {
    const query = {}

    // 不能這樣先預設空的 {}，因為 price 欄位類型是數字
    // const query = {
    //   price: {}
    // }

    // $gte 大於等於
    if (req.query.pricegte) {
      // 如果沒有判斷可能會出現 query.price undefined 錯誤
      if (!query.price) {
        query.price = {}
      }
      const gte = parseInt(req.query.pricegte)
      if (!isNaN(gte)) {
        query.price.$gte = gte
      }
    }

    // $lte 小於等於
    if (req.query.pricelte) {
      if (!query.price) {
        query.price = {}
      }
      const lte = parseInt(req.query.pricelte)
      if (!isNaN(lte)) {
        query.price.$lte = lte
      }
    }

    // 關鍵字搜尋
    if (req.query.keywords) {
      if (!query.$or) {
        query.$or = []
      }
      const names = []
      const descriptions = []
      const keywords = req.query.keywords.split(',')
      for (const keyword of keywords) {
        // $in 包含, 關鍵字和搜尋結果的字要完全一樣才能搜尋到, 所以要用正則表達式才能打幾個關鍵字就能搜尋到符合關鍵字的所有結果, 'i' 不區分大小寫
        const re = new RegExp(keyword, 'i')
        names.push(re)
        descriptions.push(re)
      }
      query.$or.push({ name: { $in: names } })
      query.$or.push({ description: { $in: descriptions } })
    }
    // 最上面 import util from 'util', console.log(util.inspect(要 log 的東西)) 避免 node.js 終端機顯示的東西被折成 object, 很好用可以學起來
    console.log(util.inspect(query, { depth: null }))
    const result = await products.find(query)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getProduct = async (req, res) => {
  try {
    const result = await products.findById(req.params.id)
    if (result) {
      res.status(200).send({ success: true, message: '', result })
    } else {
      res.status(404).send({ success: false, message: '查無商品' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無商品' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const updateProduct = async (req, res) => {
  try {
    const result = await products.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean()
    if (result) {
      res.status(200).send({ success: true, message: '', result })
    } else {
      res.status(404).send({ success: false, message: '查無商品' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無商品' })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const delProduct = async (req, res) => {
  try {
    const result = await products.findByIdAndDelete(req.params.id)
    if (result) {
      res.status(200).send({ success: true, message: '' })
    } else {
      res.status(404).send({ success: false, message: '查無商品' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '查無商品' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
