const transactionModel = require("../models/transactionModel");
const moment = require("moment");

const getAllTransaction = async (req, res) => {
  try {
    const { frequency, selectedDate, type, userid } = req.body;

    if (!frequency || !userid) {
      return res.status(400).json({ message: "Frequency and userid are required" });
    }

    const query = {
      userid: userid,
      ...(frequency !== "custom"
        ? {
            date: {
              $gt: moment().subtract(Number(frequency), "d").toDate(),
            },
          }
        : {
            date: {
              $gte: moment(selectedDate[0]).toDate(),
              $lte: moment(selectedDate[1]).toDate(),
            },
          }),
          userid: req.body.userid,
      ...(type !== "all" && { type}),
    };

    const transactions = await transactionModel.find(query);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    await transactionModel.findOneAndDelete({_id:req.body.transactionId})
    res.status(200).send('Transaction Deleted!');
  } catch (error) {
    console.log(error);
    res.status(500).json(error)
  }
}

const editTransaction = async (req, res) => {
    try {
      await transactionModel.findOneAndUpdate({_id:req.body.transactionId}, req.body.payload);
      res.status(200).send('Edit Successfully');
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }
};

const addTransaction = async (req, res) => {
  try {
    const { date, description, category, type, amount, userid } = req.body;

    
    if (!date || !description || !category || !type || !amount || !userid) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTransaction = new transactionModel({
      date,
      description,
      category,
      type,
      amount,
      userid,
    });

   
    await newTransaction.save();

 
    res.status(201).json({ message: "Transaction created successfully", transaction: newTransaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllTransaction, addTransaction, editTransaction, deleteTransaction };