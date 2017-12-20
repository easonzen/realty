const lianjia = () => {
	var Crawler = require('crawler')
	var cheerio = require('cheerio')

	var pageMax = 1000
	var page = 1
	var originUrl = 'https://bj.lianjia.com/ershoufang/'
	var apiUrl = 'http://localhost:3000/roomInfo'
	// 链家北京二手房
	var getUrl = () => {
		return `https://bj.lianjia.com/ershoufang/pg${page}p3`
	}

	var request = require('request')
	var http = request.defaults({
		json: true
	})
	var params = {
		title: '',
		priceInfo: {
			total: '',
			perPrice: ''
		},
		houseInfo: {
			room: {
				mainInfo: '',
				subInfo: ''
			},
			type: {
				mainInfo: '',
				subInfo: ''
			},
			area: {
				mainInfo: '',
				subInfo: ''
			}
		},
		aroundInfo: {
			apartmentName: '',
			areaName: ''
		}
	}

	var c = new Crawler({
		maxConnections: 10,
		rateLimit: 2000,
		jQuery: {
			name: 'cheerio',
			options: {
				decodeEntities: false
			}
		},
		// This will be called for each crawled page
		callback: function (error, res, done) {
			console.log('start each page')
			if (error) {
				console.log(error)
			} else {
				var $ = res.$
				// $ is Cheerio by default
				//a lean implementation of core jQuery designed specifically for the server
				// console.log($('.content .title .main').text())
				params.title = $('.title-wrapper .content .title .main').text()
				params.priceInfo.total = $('.overview .content .price .total').text()
				params.priceInfo.perPrice = $('.overview .content .price .text .unitPriceValue').text()
				params.houseInfo.room.mainInfo = $('.overview .content .houseInfo .room .mainInfo').text()
				params.houseInfo.room.subInfo = $('.overview .content .houseInfo .room .subInfo').text()
				params.houseInfo.type.mainInfo = $('.overview .content .houseInfo .type .mainInfo').text()
				params.houseInfo.type.subInfo = $('.overview .content .houseInfo .type .subInfo').text()
				params.houseInfo.area.mainInfo = $('.overview .content .houseInfo .area .mainInfo').text()
				params.houseInfo.area.subInfo = $('.overview .content .houseInfo .area .subInfo').text()
				params.aroundInfo.apartmentName = $(
					'.overview .content .aroundInfo .communityName .info'
				).text()
				params.aroundInfo.areaName = $('.overview .content .aroundInfo .areaName .info').text()
				console.log(params)
				http.post({ url: apiUrl, body: params }, function (error, response, data) {
					console.log('---send---')
					console.log('error: ', error)
					console.log(data)
				})
			}
			done()
		}
	})

	// Queue URLs with custom callbacks & parameters
	function query () {
		console.log('【url】: ', getUrl())
		c.queue([
			{
				uri: getUrl(),
				// The global callback won't be called
				callback: function (error, res, done) {
					if (error) {
						console.log(error)
					} else {
						console.log('Grabbed', res.body.length, 'bytes')
						var $ = res.$
						var $infos = $('.sellListContent li')
						$infos.each((i, info) => {
							var url = $(info).find('.img').attr('href')
							c.queue(url)
						})
					}
					done()
				}
			}
		])
	}

	c.on('drain', function () {
		console.log('------end-----')

		if (page > pageMax) return

		// 继续搜索剩余的记录
		page += 1
		query()
	})

	query()
}

module.exports = lianjia
