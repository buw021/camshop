const agenda = require('./agenda');
const Sale = require('../models/sale');

// Define the job to disable expired sales
agenda.define('disable sale', async (job) => {
    const { saleId } = job.attrs.data;
    const sale = await Sale.findById(saleId);
    
    if (sale) {
        sale.isOnSale = false;
        await sale.save();
        console.log(`Sale "${sale.name}" has been disabled.`);
    }
});

module.exports = agenda;
