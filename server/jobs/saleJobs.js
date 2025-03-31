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
        agenda.on("complete:disable sale", async (job) => {
          await agenda.cancel({ _id: job.attrs._id }); // Deletes the completed job
        });
        console.log(`Sale "${sale.name}" has been disabled.`);
      } else {
        console.log(`Sale with ID "${saleId}" not found.`);
      }
    } catch (error) {
      console.error("Error in disable sale job:", error);
    }
  });
  agenda.on("complete:disable sale", async (job) => {
    try {
      await agenda.cancel({ _id: job.attrs._id }); // Delete the completed job
      console.log(
        `Job "${job.attrs.name}" with ID "${job.attrs._id}" has been deleted.`
      );
    } catch (error) {
      console.error("Error deleting completed job:", error);
    }
  });
};

module.exports = saleJobs;
