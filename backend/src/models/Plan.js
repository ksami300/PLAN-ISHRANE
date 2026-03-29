const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    meta: {
      type: Object,
      default: {},
    },
    plan: {
      type: Object,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    pinHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
