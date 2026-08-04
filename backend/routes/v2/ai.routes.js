const express = require('express');
const router = express.Router();
const aiAssistantService = require('../../services/aiAssistant.service');
const ResponseUtil = require('../../utils/response');
const { optionalAuth } = require('../../middleware/auth.middleware');

// POST /api/v2/ai/chat
router.post('/chat', optionalAuth, async (req, res, next) => {
  try {
    const { message, context } = req.body;
    const userContext = context || { bloodGroup: req.user?.bloodGroup };
    const response = aiAssistantService.processQuery(message, userContext);
    return ResponseUtil.success(res, { message: 'AI query processed.', data: response });
  } catch (err) {
    next(err);
  }
});

// GET /api/v2/ai/compatibility/:bloodGroup
router.get('/compatibility/:bloodGroup', (req, res) => {
  const info = aiAssistantService.getCompatibility(req.params.bloodGroup.toUpperCase());
  if (!info) {
    return ResponseUtil.error(res, { code: 404, type: 'NOT_FOUND', message: 'Invalid blood group.' });
  }
  return ResponseUtil.success(res, { message: 'Blood compatibility retrieved.', data: info });
});

module.exports = router;
