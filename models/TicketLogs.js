const mongoose = require('mongoose');

const ticketLogsSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  technicianName: {
    type: String,
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Use existing model if already defined, otherwise define it
const TicketLogs = mongoose.models.TicketLogs || mongoose.model('TicketLogs', ticketLogsSchema);

module.exports = TicketLogs;
