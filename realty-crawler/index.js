var cron = require('node-cron')
var crawler = require('./crawlers/crawler.lianjia')

cron.schedule('49 14 * * *', function () {
	crawler()
})
