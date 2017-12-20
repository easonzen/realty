var express = require('express')
var router = express.Router()

const connectDatabase = (collection) => {
	let mongo = require('mongoskin')
	let db = mongo.db(`mongodb://localhost:27017/${collection}`)
	db.bind(collection)

	return db
}

/* GET home page. */
router.get('/', function (req, res, next) {
		res.render('index')
})

router.post('/getRoomInfo', function(req, res, next) {
	let page = req.body.page
	const db = connectDatabase('room_info')
	db.room_info.find({}, { _id: 0 })
	.skip(page * 10)
	.limit(10)
	.toArray(function(err, items) {
		if(items && items.length > 0) {
			data = items
		} else {
			throw err
		}
		db.close()
	})
	res.json(data)
})

router.post('/roomInfo', function (req, res, next) {
		let roomInfo = req.body
		const db = connectDatabase('room_info')
		db.room_info.insert({
			title: roomInfo.title,
			priceInfo: {
				total: roomInfo.priceInfo.total,
				perPrice: roomInfo.priceInfo.perPrice
			},
			houseInfo: {
				room: {
					mainInfo: roomInfo.houseInfo.room.mainInfo,
					subInfo: roomInfo.houseInfo.room.subInfo
				},
				type: {
					mainInfo: roomInfo.houseInfo.type.mainInfo,
					subInfo: roomInfo.houseInfo.type.subInfo
				},
				area: {
					mainInfo: roomInfo.houseInfo.area.mainInfo,
					subInfo: roomInfo.houseInfo.area.subInfo,
				}
			},
			aroundInfo: {
				apartmentName: roomInfo.aroundInfo.apartmentName,
				areaName: roomInfo.aroundInfo.areaName
			}
		})
		res.status(200).json({ 	code: 0, 	msg: 'success' })
})

module.exports = router
