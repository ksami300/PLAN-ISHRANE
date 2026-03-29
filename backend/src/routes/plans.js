const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');
const router = express.Router();

// create plan (protected)
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('plan').isObject().withMessage('plan must be an object'),
    body('lockPin').optional().isLength({ min: 4, max: 6 }).withMessage('lockPin must be 4-6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { name, meta = {}, plan, lockPin } = req.body;
      const owner = req.user.id;
      const newPlan = new Plan({ owner, name, meta, plan });

      if (lockPin) {
        // simple example; for production use bcrypt/argon2 and strong encryption
        newPlan.locked = true;
        newPlan.pinHash = Buffer.from(String(lockPin)).toString('base64');
      }

      await newPlan.save();
      res.status(201).json({ plan: newPlan });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// list user's plans
router.get('/', auth, async (req,res) => {
  try{
    const owner = req.user.id;
    const plans = await Plan.find({ owner }).sort({ createdAt: -1 }).lean();
    res.json({ plans });
  }catch(e){
    console.error(e);
    res.status(500).json({ message:'Server error' });
  }
});

// get single plan (requires PIN if locked)
router.get('/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid plan id' });

  try {
    const p = await Plan.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: 'Not found' });
    if (String(p.owner) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    delete p.pinHash;
    res.json({ plan: p });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// verify PIN to unlock (temporary token)
router.post('/:id/unlock', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid plan id' });
  if (!req.body.pin) return res.status(422).json({ message: 'PIN is required' });

  try {
    const p = await Plan.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    if (String(p.owner) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    const expected = p.pinHash;
    if (!expected) return res.status(400).json({ message: 'Not locked' });

    if (expected === Buffer.from(String(req.body.pin)).toString('base64')) {
      return res.json({ ok: true, unlocked: true });
    } else {
      return res.status(400).json({ ok: false, message: 'Wrong PIN' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete plan
router.delete('/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid plan id' });

  try {
    const p = await Plan.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    if (String(p.owner) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    await Plan.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
