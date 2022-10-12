const stripe = require('stripe')(process.env.SECRET_KEY || 'sk_test_51LmB5yIvrRcHSJHYmkhMHmJDIRqY1vdDE1fUiSBjmrNoAwlfR5WupmhtJm5lpYM2RHsqv8ZwpTQGpZwGr4oQYGSP00E3o6f3bq');
module.exports = { stripe };
