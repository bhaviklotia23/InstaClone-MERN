const mongoose = require('mongoose')

exports.connectDb = (url) => {
    mongoose.set("strictQuery", true);
    mongoose.connect(url).then(() => {
        console.log('MongoDB connected')
    }).catch((err) => {
        console.log(err)
    })
}

