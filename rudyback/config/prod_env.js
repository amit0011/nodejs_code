module.exports = {
	db: process.env.MONGO_URL || 'mongodb://localhost:27017/agriculture',
	logDir: '/var/log/api/', //@todo : check if log directory exits, if not create one.
	sessionSecret: "thisisareallylongandbigsecrettoken",
	fcmKey: "AIzaSyA856vXQqTb8xnUL1io6CPH0GQtpg3-vxE"
};
