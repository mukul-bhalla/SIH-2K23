const mongoose = require('mongoose');

// Connect to MongoDB
const feedSchema = new mongoose.Schema({
    name: String,
    post: String
});

const Feed = mongoose.model("Feed", feedSchema);

// Feed.insertMany([
//     { name: "Jane Doe", email: "janedoe@email.com", number: '987654321', post: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus magnam quasi autem eveniet ducimus? Suscipit quia quae illum corporis facere, quas aut enim officiis! Cumque error distinctio voluptate hic rem.' },
//     { name: "John Doe", email: "johndoe@email.com", number: '987654322', post: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus magnam quasi autem eveniet ducimus? Suscipit quia quae illum corporis facere, quas aut enim officiis! Cumque error distinctio voluptate hic rem.' },
//     { name: "James Doe", email: "jamesdoe@email.com", number: '987654323', post: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus magnam quasi autem eveniet ducimus? Suscipit quia quae illum corporis facere, quas aut enim officiis! Cumque error distinctio voluptate hic rem.' },
// ])

module.exports = Feed;
