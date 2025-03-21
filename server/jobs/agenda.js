const Agenda = require('agenda');
const mongoose = require('mongoose');

// Use the existing Mongoose connection
const agenda = new Agenda({
    mongo: mongoose.connection, // Reuse existing connection
    collection: 'agendaJobs' // Optional: Custom collection name
});

// Event listeners (optional but helpful for debugging)
agenda.on('ready', () => console.log('Agenda is connected to MongoDB'));
agenda.on('error', (err) => console.error('Agenda connection error:', err));

// Start Agenda when ready
(async function () {
    await agenda.start();
    console.log('Agenda has started processing jobs');
})();

module.exports = agenda;
