const Agenda = require("agenda");
const saleJobs = require("./saleJobs");
const mongoConnectionString = process.env.MONGO_URL;

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: "agendaJobs" },
});

//  Debugging: Show all scheduled jobs on startup

saleJobs(agenda);

(async function () {
  await agenda.start();
  console.log("agendaStarted");
})();

module.exports = agenda;
