const Sale = require("../models/sale");

const saleJobs = (agenda) => {
  agenda.define("disable sale", async (job) => {
    console.log("running the job...");
    try {
      const { saleId } = job.attrs.data;
      const sale = await Sale.findById(saleId);

      if (sale) {
        sale.isOnSale = false;
        await sale.save();
        console.log(`Sale "${sale.name}" has been disabled.`);
      } else {
        console.log(`Sale with ID "${saleId}" not found.`);
      }
    } catch (error) {
      console.error("Error in disable sale job:", error);
    }
  });
};

module.exports = saleJobs;
