const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
// const opts = { toJSON: { virtuals: true } };
const imageSchema = new mongoose.Schema({
    url: String,
    filename: String
})
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
    role: {
        type: String,
        required: [true, 'Role cannot be blank'],
        enum: ['Client', 'Junior Advocate', 'Senior Advocate']
    },
    image: imageSchema

})

userSchema.statics.findAndValidate = async function (email, password) {
    const foundUser = await this.findOne({ email: email });
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;

}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User', userSchema);