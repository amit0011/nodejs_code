module.exports = {
	db: process.env.MONGO_URL || 'mongodb://localhost:27017/agriculture',
	logDir: './logs/', //@todo : check if log directory exits, if not create one.
	sessionSecret: "thisisareallylongandbigsecrettoken",
	fcmKey: process.env.fcmKey
};
